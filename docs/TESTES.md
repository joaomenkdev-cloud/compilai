# Roteiro dos 5 testes (PDF p.18)

Use duas contas (veja `supabase/seed.md`): **A = Bia** e **B = Caio**.
Para B, use outro aparelho/emulador, ou saia de A e entre com B no mesmo aparelho.

---

## 1 · Acesso

- [ ] Crie a conta A e a conta B em **Criar conta**.
- [ ] Entre com A. O app abre no **Início** (aba Recentes).
- [ ] Feche o app por completo e abra de novo → abre direto no **Início**, sem pedir login (sessão restaurada).
- [ ] Abra o menu (ícone ☰) → **Sair** → aparece a tela **Entrar**.
- [ ] Aperte **Voltar** do Android → o app **não** volta para o perfil nem para o feed.
- [ ] Feche e abra o app → agora abre em **Entrar** (o destino inicial mudou).

**Evidência esperada:** sessão restaurada após reiniciar; depois de sair, Voltar não reabre telas privadas.

---

## 2 · Interação

- [ ] Com **A**: Publicar → escreva um texto → **Publicar** → o post aparece no Início.
- [ ] Com **B**: Explorar → **Posts** → busque uma palavra do post de A → o post aparece.
- [ ] B toca **Curtir** → contador vai para **1** e o botão fica "Curtido".
- [ ] B toca de novo (**descurtir**) → contador volta para **0**.
- [ ] B curte **novamente** → contador **1**.
- [ ] B abre o post e escreve em **Seu comentário** → **Comentar** → o comentário aparece e o campo é limpo.

**Evidência esperada:** contador final indica **1 curtida**; o comentário de B aparece na conversa.

---

## 3 · Notificação

- [ ] Com **A**: abra o menu → **Notificações** mostra a bolinha com o número de não lidas.
- [ ] Na tela Notificações, puxe para atualizar → o aviso "Caio Lima comentou na sua publicação" está em **Novas**, com o rótulo **"Não lida"**.
- [ ] Toque no aviso → abre a publicação com o comentário de B.
- [ ] Volte → o aviso passou para **Anteriores** e o contador do menu **diminuiu**.

**Evidência esperada:** aviso marcado como lido (`lida_em` gravado) e contador menor.

---

## 4 · Autorização

Rode no computador (precisa do `.env` e do `.env.teste` com o e-mail/senha de B):

```bash
npm run teste:autorizacao
```

**Evidência esperada** (saída do script):

```
✔ Linhas alteradas pela tentativa de B: 0
✔ Perfil de A depois: Bia Souza — bio: "…" (igual a antes)
RESULTADO: PASSOU ✅ — B não conseguiu alterar o perfil de A
```

- [ ] Confirme também no app, logado como A: nome e biografia continuam os mesmos.

---

## 5 · Persistência

> Use uma **build instalada** (`eas build --profile preview`) ou um emulador com o pacote JS já carregado:
> o Expo Go precisa da rede para baixar o código.

- [ ] Com **A** e internet: abra o Início (o feed é salvo no aparelho).
- [ ] Em Publicar, escreva um texto e toque **Salvar rascunho** → aparece "Rascunho salvo neste aparelho às HH:MM".
- [ ] Desligue **Wi-Fi e dados móveis**. Feche o app e abra de novo.
- [ ] O Início mostra o último feed com o aviso **"Sem conexão · última atualização às HH:MM"**.
- [ ] Publicar → aba **Rascunho** mostra o texto salvo → **Continuar editando**.
- [ ] Religue a internet → **Publicar** → o post vai para o Início e o rascunho de A é apagado.
- [ ] Com **B**: o novo post de A aparece no feed.
- [ ] Com **A**, salve um **novo** rascunho. Saia e entre com **B** no mesmo aparelho.
- [ ] Com **B**: Publicar → aba **Rascunho** mostra "Nenhum rascunho salvo" (B não vê o rascunho de A).
- [ ] Saia e entre de novo com **A** → o rascunho de A continua lá.

**Evidência esperada:** feed e rascunho disponíveis sem internet; dados isolados por conta.

---

## Extras (além do PDF)

> Roteiro opcional dos recursos a mais. Pré-requisito: `supabase/extensoes.sql` aplicado.
> Nenhum deles muda os 5 testes acima.

**Tipos de post e dúvida resolvida**

- [ ] Com **A**, em Publicar escolha **Dúvida** e publique. O card mostra a etiqueta "Dúvida".
- [ ] Com **B**, comente na dúvida.
- [ ] Com **A**, abra o post → **Marcar como solução** no comentário de B. Aparece o resumo "Resolvida" e o comentário fica destacado, **sem sair da ordem cronológica**.
- [ ] Com **B**: chega o aviso "A marcou seu comentário como solução" (criado pelo banco).

**Código nos posts**

- [ ] Publique um texto com um bloco entre ```` ``` ```` (ex.: ```` ```js ```` … ```` ``` ````). O trecho aparece em fonte monoespaçada, num bloco escuro.

**Editar e excluir**

- [ ] No ⋯ do próprio post: **Editar** → o card mostra "· editado". **Excluir** pede confirmação.
- [ ] Com **B**, o ⋯ não aparece nos posts de A (e o banco recusa, como no Teste 4).

**Tempo real**

- [ ] Abra o Início com **A** em um aparelho e publique com **B** em outro: em **A** aparece "1 nova publicação · toque para ver".
- [ ] Deixe o mesmo post aberto nos dois: o comentário de **B** aparece em **A** sem puxar a tela.
- [ ] O contador de Notificações no menu de **A** sobe sozinho quando **B** curte.

**Notificações**

- [ ] Com vários avisos novos, toque **Marcar todas como lidas**: todos vão para "Anteriores" e o contador do menu zera.

**Perfil: áreas e stacks**

- [ ] Editar perfil → escolha até 3 áreas e até 15 stacks (a busca filtra a lista). Salve.
- [ ] No perfil, toque numa stack (ex.: **TypeScript**) → Explorar mostra "Quem usa TypeScript".
- [ ] Explorar com o campo vazio mostra os **Destaques da semana**; o filtro de tipo restringe a busca de posts.
