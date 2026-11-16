# Progresso — CompilaAí

- [x] **Fase 1 — Leitura e plano** (PDF lido; tema A · CompilaAí aprovado)
- [x] **Fase 2 — Esqueleto + navegação** (Stack → Drawer → Tabs, abas internas, Voltar no detalhe; placeholders)
- [x] Fase 3 — Supabase + Auth (código pronto; login real ainda a testar no app)
- [x] Fase 4 — Schema SQL (aplicado no projeto `sooqpffnxpgsmhjvdcyw`, org compilai: 5 tabelas com RLS, 12 políticas, 2 gatilhos; Confirm email desligado)
- [ ] Fase 5 — Publicar + Feed
- [ ] Fase 6 — Explorar, Perfil, Pessoa, Editar perfil
- [ ] Fase 7 — Detalhe, curtidas, comentários
- [ ] Fase 8 — Notificações
- [ ] Fase 9 — SQLite (rascunho + cache offline)
- [ ] Fase 10 — Polimento
- [ ] Fase 11 — Documentação

## Notas
- Template atual do Expo (SDK 58) usa `src/app`; as pastas de apoio ficam em `src/` (alias `@/`).
- O Expo Router 58 traz o Drawer embutido (`expo-router/drawer`); não precisa de `@react-navigation/drawer`.
- Splash nativa usa a imagem padrão do template como placeholder (trocar por logo do CompilaAí na Fase 10).
