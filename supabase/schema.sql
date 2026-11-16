-- CompilaAí — esquema do banco remoto (Supabase / PostgreSQL)
-- Idempotente: pode ser executado mais de uma vez no SQL Editor.
-- Ordem: profiles → posts → likes → comments → notifications → função + gatilhos.

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  bio text not null default ''
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists ler on public.profiles;
create policy ler on public.profiles for select
  to authenticated using (true);
drop policy if exists criar_proprio on public.profiles;
create policy criar_proprio on public.profiles for insert
  to authenticated with check (id = (select auth.uid()));
drop policy if exists editar_proprio on public.profiles;
create policy editar_proprio on public.profiles for update
  to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ───────────────────────── posts ─────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.profiles(id),
  texto text not null check (length(trim(texto)) between 1 and 500),
  criado_em timestamptz not null default now()
);
alter table public.posts enable row level security;
revoke all on public.posts from public, anon, authenticated;
grant select, insert on public.posts to authenticated;

drop policy if exists ler on public.posts;
create policy ler on public.posts for select
  to authenticated using (true);
drop policy if exists publicar on public.posts;
create policy publicar on public.posts for insert
  to authenticated with check (autor_id = (select auth.uid()));

-- ───────────────────────── likes ─────────────────────────
-- Chave primária composta: cada pessoa curte um post no máximo uma vez.
create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  autor_id uuid not null references public.profiles(id),
  criado_em timestamptz not null default now(),
  primary key (post_id, autor_id)
);
alter table public.likes enable row level security;
revoke all on public.likes from public, anon, authenticated;
grant select, insert, delete on public.likes to authenticated;

drop policy if exists ler on public.likes;
create policy ler on public.likes for select
  to authenticated using (true);
drop policy if exists curtir on public.likes;
create policy curtir on public.likes for insert
  to authenticated with check (autor_id = (select auth.uid()));
drop policy if exists descurtir on public.likes;
create policy descurtir on public.likes for delete
  to authenticated using (autor_id = (select auth.uid()));

-- ───────────────────────── comments ─────────────────────────
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  autor_id uuid not null references public.profiles(id),
  texto text not null check (length(trim(texto)) between 1 and 500),
  criado_em timestamptz not null default now()
);
alter table public.comments enable row level security;
revoke all on public.comments from public, anon, authenticated;
grant select, insert on public.comments to authenticated;

drop policy if exists ler on public.comments;
create policy ler on public.comments for select
  to authenticated using (true);
drop policy if exists comentar on public.comments;
create policy comentar on public.comments for insert
  to authenticated with check (autor_id = (select auth.uid()));

-- ───────────────────────── notifications ─────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  destino_id uuid not null references public.profiles(id),
  ator_id uuid not null references public.profiles(id),
  post_id uuid not null references public.posts(id) on delete cascade,
  tipo text not null,
  criado_em timestamptz not null default now(),
  lida_em timestamptz
);

-- ───────────────────────── gatilho de avisos ─────────────────────────
-- O aviso é criado NO SERVIDOR após curtir/comentar. O cliente nunca insere avisos.
-- Interação do autor no próprio post não gera aviso.
create or replace function public.avisar_autor()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  insert into public.notifications
    (destino_id, ator_id, post_id, tipo)
  select p.autor_id, new.autor_id, p.id,
    case when tg_table_name = 'likes'
         then 'curtida' else 'comentario' end
  from public.posts p
  where p.id = new.post_id and p.autor_id <> new.autor_id;
  return new;
end;
$$;
revoke all on function public.avisar_autor()
  from public, anon, authenticated;

drop trigger if exists ao_curtir on public.likes;
create trigger ao_curtir after insert on public.likes
  for each row execute function public.avisar_autor();
drop trigger if exists ao_comentar on public.comments;
create trigger ao_comentar after insert on public.comments
  for each row execute function public.avisar_autor();

-- Quem pode ler ou marcar como lido? Só o destinatário, e só a coluna lida_em.
alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;
grant select, update (lida_em) on public.notifications to authenticated;

drop policy if exists ler_aviso on public.notifications;
create policy ler_aviso on public.notifications for select
  to authenticated using (destino_id = (select auth.uid()));
drop policy if exists marcar_aviso on public.notifications;
create policy marcar_aviso on public.notifications for update
  to authenticated using (destino_id = (select auth.uid()))
  with check (destino_id = (select auth.uid()));

-- ───────────────────────── índices ─────────────────────────
create index if not exists posts_criado_em_idx on public.posts (criado_em desc);
create index if not exists posts_autor_idx on public.posts (autor_id);
create index if not exists comments_post_idx on public.comments (post_id, criado_em);
create index if not exists likes_autor_idx on public.likes (autor_id);
create index if not exists notifications_destino_idx on public.notifications (destino_id, lida_em);
