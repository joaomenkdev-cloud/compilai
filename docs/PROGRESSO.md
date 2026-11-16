# Progresso — CompilaAí

- [x] **Fase 1 — Leitura e plano** (PDF lido; tema A · CompilaAí aprovado)
- [x] **Fase 2 — Esqueleto + navegação** (Stack → Drawer → Tabs, abas internas, Voltar no detalhe; placeholders)
- [x] Fase 3 — Supabase + Auth (código pronto; login real ainda a testar no app)
- [x] Fase 4 — Schema SQL (aplicado no projeto `sooqpffnxpgsmhjvdcyw`, org compilai: 5 tabelas com RLS, 12 políticas, 2 gatilhos; Confirm email desligado)
- [x] Fase 5 — Publicar + Feed (Recentes/Minhas, PostCard, curtir; consultas testadas no banco real com 2 contas)
- [x] Fase 6 — Explorar, Perfil, Pessoa, Editar perfil (busca, edição e bloqueio de edição alheia testados no banco)
- [x] Fase 7 — Detalhe, curtidas, comentários (comentários, avisos e regras testados no banco)
- [x] Fase 8 — Notificações (Novas/Anteriores, marcar lida, contador no menu; Teste 3 conferido no banco)
- [x] Fase 9 — SQLite (rascunho + cache offline) (código pronto; SQLite só roda no aparelho: teste offline é manual)
- [x] Fase 10 — Polimento (ícone/splash com a marca, tela Sobre, botão de menu em português, Voltar por histórico, contraste ≥ 4,5:1 conferido)
- [x] Fase 11 — Documentação (README, seed.md, TESTES.md, eas.json, Teste 4 rodado: PASSOU)

## Notas
- Template atual do Expo (SDK 58) usa `src/app`; as pastas de apoio ficam em `src/` (alias `@/`).
- O Expo Router 58 traz o Drawer embutido (`expo-router/drawer`); não precisa de `@react-navigation/drawer`.

## Pendente de teste manual (precisa de celular/emulador)
- Fluxo das telas no aparelho, splash nativa (build preview) e Teste 5 sem internet.
