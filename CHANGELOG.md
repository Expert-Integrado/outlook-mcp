# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] — 2026-05-09

### Adicionado

- Primeira release como pacote npm `@expertintegrado/outlook-mcp`
- 28 ferramentas cobrindo Outlook (e-mail), Calendário, Contatos e OneDrive:
  - **E-mail** (10): `enviar_email`, `ler_emails`, `responder_email`, `encaminhar_email`, `marcar_email`, `mover_email`, `baixar_anexo`, `criar_rascunho_email`, `listar_pastas_email`, `criar_pasta_email`
  - **Calendário** (8): `criar_compromisso`, `listar_compromissos`, `atualizar_compromisso`, `deletar_compromisso`, `aceitar_evento`, `recusar_evento`, `cancelar_compromisso`, `verificar_disponibilidade`
  - **Contatos** (2): `buscar_contato`, `criar_contato`
  - **OneDrive** (8): `onedrive_listar`, `onedrive_buscar`, `onedrive_download`, `onedrive_upload`, `onedrive_upload_grande`, `onedrive_compartilhar`, `onedrive_criar_pasta`, `onedrive_deletar`
- Tool `autenticar` que conduz o Device Code Flow direto no chat — mentorado nunca abre terminal pra autenticar
- Suporte multi-tenant: default `OUTLOOK_TENANT_ID=common` aceita qualquer conta Microsoft 365 (corporativa ou pessoal)
- Refresh automático de token via `acquireTokenSilent` (escopo `offline_access`)
- Storage isolado em `~/.expertintegrado/outlook-mcp/` (sobrevive a `npx` cache invalidation)
- Suporte a upload de arquivo grande (>4MB) via upload session em chunks de 5MB
- Variável `OUTLOOK_TIMEZONE` para fuso horário customizado nas chamadas Graph
- Auto-publish via GitHub Actions (`release.yml`) disparado por tag `v*`
- Documentação completa em PT-BR: README prompt-driven, INSTALL técnico, TOOLS, TROUBLESHOOTING

### Notas de migração (vs versão monorepo `expertintegrado/skills/mcps/outlook`)

- **Token e rate-limit** agora ficam em `~/.expertintegrado/outlook-mcp/` (antes: pasta do projeto)
- **`auth.js` removido** — autenticação via tool MCP `autenticar`
- **App Azure agora multi-tenant** por padrão (antes: single-tenant Expert)
- **Novos escopos**: `Mail.ReadWrite`, `Contacts.ReadWrite`, `Files.ReadWrite`, `MailboxSettings.Read`. Quem migra do monorepo precisa re-autenticar.
