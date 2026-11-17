-- CompilaAí — EXTENSÕES do esquema (rodar DEPOIS de schema.sql).
-- Idempotente: pode ser executado mais de uma vez no SQL Editor.
-- Não altera nada do que o PDF define (tabelas, políticas e o gatilho avisar_autor
-- continuam iguais); só ACRESCENTA colunas, permissões e gatilhos novos.
--
--  1. Tipo da publicação: projeto | duvida | conquista
--  2. Dúvida resolvida: o autor marca o comentário que resolveu (+ aviso para quem ajudou)
--  3. Editar e excluir o próprio post/comentário
--  4. Destaques da semana (view que respeita o RLS)
--  5. Tempo real (Supabase Realtime) para posts e avisos

-- ───────────────── 1. tipo da publicação ─────────────────
alter table public.posts add column if not exists tipo text not null default 'projeto';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'posts_tipo_valido') then
    alter table public.posts add constraint posts_tipo_valido
      check (tipo in ('projeto', 'duvida', 'conquista'));
  end if;
end $$;

-- ───────────────── 2. dúvida resolvida ─────────────────
-- Comentário que resolveu a dúvida (se o comentário for excluído, volta a "não resolvida").
alter table public.posts add column if not exists resolvido_por uuid
  references public.comments(id) on delete set null;

-- ───────────────── 3. editar e excluir ─────────────────
alter table public.posts add column if not exists editado_em timestamptz;
alter table public.comments add column if not exists editado_em timestamptz;

-- O autor só pode alterar estas colunas (nunca autor_id nem criado_em).
grant update (texto, tipo, resolvido_por, editado_em) on public.posts to authenticated;
grant delete on public.posts to authenticated;
grant update (texto, editado_em) on public.comments to authenticated;
grant delete on public.comments to authenticated;

drop policy if exists editar_proprio on public.posts;
create policy editar_proprio on public.posts for update
  to authenticated using (autor_id = (select auth.uid()))
  with check (autor_id = (select auth.uid()));
drop policy if exists excluir_proprio on public.posts;
create policy excluir_proprio on public.posts for delete
  to authenticated using (autor_id = (select auth.uid()));

drop policy if exists editar_proprio on public.comments;
create policy editar_proprio on public.comments for update
  to authenticated using (autor_id = (select auth.uid()))
  with check (autor_id = (select auth.uid()));
drop policy if exists excluir_proprio on public.comments;
create policy excluir_proprio on public.comments for delete
  to authenticated using (autor_id = (select auth.uid()));

-- Regra de negócio no BANCO (não dá para burlar pelo app):
-- só dúvidas podem ser "resolvidas", e só por um comentário do próprio post.
create or replace function public.checar_resolucao()
returns trigger language plpgsql
set search_path = '' as $$
begin
  if new.resolvido_por is not null then
    if new.tipo <> 'duvida' then
      raise exception 'Só publicações do tipo dúvida podem ser marcadas como resolvidas';
    end if;
    if not exists (
      select 1 from public.comments c
      where c.id = new.resolvido_por and c.post_id = new.id
    ) then
      raise exception 'O comentário escolhido não pertence a esta publicação';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists antes_de_resolver on public.posts;
create trigger antes_de_resolver before update on public.posts
  for each row execute function public.checar_resolucao();

-- Aviso para quem ajudou: gerado no SERVIDOR, como os outros avisos (o app nunca insere).
create or replace function public.avisar_resolucao()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  if new.resolvido_por is not null
     and new.resolvido_por is distinct from old.resolvido_por then
    insert into public.notifications (destino_id, ator_id, post_id, tipo)
    select c.autor_id, new.autor_id, new.id, 'resolvido'
    from public.comments c
    where c.id = new.resolvido_por and c.autor_id <> new.autor_id;
  end if;
  return new;
end;
$$;
revoke all on function public.avisar_resolucao() from public, anon, authenticated;
revoke all on function public.checar_resolucao() from public, anon, authenticated;
drop trigger if exists ao_resolver on public.posts;
create trigger ao_resolver after update on public.posts
  for each row execute function public.avisar_resolucao();

-- ───────────────── 4. destaques da semana ─────────────────
-- security_invoker = true: a view roda com as permissões de QUEM CONSULTA,
-- então as políticas RLS de posts/likes/profiles continuam valendo.
create or replace view public.destaques_semana
with (security_invoker = true) as
select p.id, p.texto, p.tipo, p.criado_em, p.autor_id, pr.nome as autor_nome,
       count(l.autor_id)::int as curtidas
from public.posts p
join public.profiles pr on pr.id = p.autor_id
left join public.likes l on l.post_id = p.id
where p.criado_em > now() - interval '7 days'
group by p.id, pr.nome
having count(l.autor_id) > 0
order by curtidas desc, p.criado_em desc
limit 5;
revoke all on public.destaques_semana from public, anon;
grant select on public.destaques_semana to authenticated;

-- ───────────────── 5. tempo real ─────────────────
-- O Realtime respeita o RLS: cada pessoa só recebe o que já poderia ler.
do $$ begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  -- Comentários: a conversa do detalhe do post atualiza sozinha quando alguém comenta.
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments') then
    alter publication supabase_realtime add table public.comments;
  end if;
end $$;

create index if not exists posts_tipo_idx on public.posts (tipo, criado_em desc);

-- ───────────────── 6. áreas de atuação e stacks no perfil ─────────────────
-- areas: no que a pessoa trabalha (Front-end, Back-end...), até 3, só valores da lista.
-- stacks: linguagens/tecnologias (Python, React...), até 15. A lista completa fica no app
-- (src/constants/tecnologias.ts); o banco garante o tamanho de cada item e da lista.
-- A edição continua protegida pela política editar_proprio de profiles (do PDF).
alter table public.profiles add column if not exists areas text[] not null default '{}';
alter table public.profiles add column if not exists stacks text[] not null default '{}';

create or replace function public.itens_validos(lista text[])
returns boolean language sql immutable
set search_path = '' as $$
  select coalesce(bool_and(length(trim(item)) between 1 and 40), true) from unnest(lista) as item
$$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_areas_validas') then
    alter table public.profiles add constraint profiles_areas_validas check (
      cardinality(areas) <= 3
      and areas <@ array['Front-end', 'Back-end', 'Full-stack', 'Mobile', 'Dados e IA', 'DevOps e Nuvem',
                         'UI/UX Design', 'Jogos', 'Segurança', 'QA e Testes', 'Embarcados e IoT', 'Estudante']::text[]
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_stacks_validas') then
    alter table public.profiles add constraint profiles_stacks_validas check (
      cardinality(stacks) <= 15 and public.itens_validos(stacks)
    );
  end if;
end $$;

-- Índice para "quem também usa React?" (stacks @> array['React']).
create index if not exists profiles_stacks_idx on public.profiles using gin (stacks);
