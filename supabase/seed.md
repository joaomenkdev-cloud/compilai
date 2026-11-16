# Dados de demonstração (fictícios)

Para os 5 testes do PDF são necessárias **duas contas**: A (quem publica) e B (quem interage).

| Conta | Nome de exibição | E-mail de teste | Papel nos testes |
|---|---|---|---|
| A | Bia Souza | `bia@compilai.test` | publica, recebe avisos, testa offline |
| B | Caio Lima | `caio@compilai.test` | encontra, curte, comenta, tenta editar A |

> Os e-mails usam o domínio `.test`, reservado para testes: nenhuma mensagem é enviada de verdade.
> **Não use senhas reais.** Escolha senhas só para a demonstração.

## Como criar as contas

1. No painel do Supabase, em **Authentication → Sign In / Providers**, desligue **Confirm email**
   (assim a conta entra direto, sem precisar abrir e-mail). Com a confirmação ligada o app também
   funciona: depois de criar a conta ele explica que é preciso confirmar o e-mail antes de entrar.
2. Abra o app, toque em **Criar conta** e cadastre a conta A com os dados da tabela.
3. Saia (menu lateral → **Sair**) e cadastre a conta B.
4. O perfil de cada conta é criado automaticamente no **primeiro login**, com o nome informado.

Para rodar o Teste 4, copie `.env.teste.example` para `.env.teste` e preencha e-mail e senha de B.
(No projeto da equipe, as contas Bia e Caio já existem e as senhas estão no `.env.teste` local,
que **não** vai para o GitHub.)

## Conteúdo sugerido para a demonstração

Entre como **Bia** e publique:

- "Terminei a tela de login do meu app em React Native! Agora falta o cadastro."
- "Alguém sabe por que meu FlatList re-renderiza tudo quando curto um item?"

Edite o perfil da Bia → biografia: "2º ano de DS. Curto React Native."

Entre como **Caio** e:

- procure "Bia" em Explorar → Pessoas e abra o perfil;
- curta o primeiro post e comente: "Ficou muito bom! Como você fez o cache?"

Volte para a **Bia**: o menu lateral mostra os avisos não lidos em Notificações.
