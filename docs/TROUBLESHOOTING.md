# Solução de problemas

---

## Não consigo autenticar

### "AADSTS50020" — usuário de outro tenant

A app Azure precisa estar configurada como multi-tenant. Por padrão usamos `OUTLOOK_TENANT_ID=common` que aceita qualquer tenant. Se você definiu `OUTLOOK_TENANT_ID` manualmente, remova a variável (ou use `common`):

```bash
claude mcp remove outlook
claude mcp add outlook -s user \
  -e OUTLOOK_TIMEZONE=America/Sao_Paulo \
  -- npx -y @expertintegrado/outlook-mcp
```

### "AADSTS50194" — app não configurada como multi-tenant

A app Azure usada por padrão (`b044cdc1-...`) está como multi-tenant. Se você está vendo esse erro, pode ser que tenha definido `OUTLOOK_CLIENT_ID` apontando para um app próprio que está single-tenant. Reconfigure no Azure Portal → App registrations → Authentication → Supported account types.

### O código expirou antes de eu fazer login

O Device Code é válido por 15 minutos. Peça novamente "autentica no Outlook MCP" pra gerar um código novo.

### Travei na hora do consentimento ("Need admin approval")

Algumas empresas exigem aprovação do admin para permissões como `Files.ReadWrite` ou `Mail.Send`. Peça ao admin do Microsoft 365 da sua empresa para aprovar a app `Expert Integrado Outlook MCP` (CLIENT_ID `b044cdc1-5c75-4c25-be87-46e51f036ae6`) no Azure AD → Enterprise applications.

### "Sessão expirada" mesmo logo depois de autenticar

Pode ser que o `~/.expertintegrado/outlook-mcp/token-cache.json` foi gravado mas está corrompido. Apague e refaça:

```bash
# macOS/Linux
rm ~/.expertintegrado/outlook-mcp/token-cache.json

# Windows (PowerShell)
Remove-Item "$env:USERPROFILE\.expertintegrado\outlook-mcp\token-cache.json"
```

Depois peça "autentica no Outlook MCP" de novo.

---

## Problemas de instalação / runtime

### `/mcp` no Claude Code não mostra o outlook

1. Confira se o `claude mcp add` rodou sem erro
2. Reinicie o Claude Code COMPLETAMENTE (feche o app, não só a aba)
3. Cheque versão do Node.js:
   ```bash
   node --version   # precisa ser >= 18
   ```

### "Cannot find module '@modelcontextprotocol/sdk'" ou similar

Cache do `npx` corrompido:

```bash
npm cache clean --force
```

Reinicie o Claude Code.

### MCP carrega mas trava na primeira chamada

Provavelmente está tentando autenticar num tenant errado. Veja os logs do MCP no Claude Code:

- **Claude Code:** `/mcp` → seleciona `outlook` → vê o status e mensagens de erro
- **Claude Desktop:** `~/Library/Logs/Claude/mcp-server-outlook.log` (macOS) ou `%APPDATA%\Claude\logs\mcp-server-outlook.log` (Windows)

---

## Problemas com tools específicas

### `enviar_email`: "Limite de 10 e-mails/hora atingido"

Guardrail anti-spam. Pra continuar, peça ao Claude algo como:

> Manda esse e-mail com `confirmacao: true` (já estou ciente que estou no limite)

Ou aguarde 1 hora e o contador reseta sozinho.

### `enviar_email`: "máximo de 5 destinatários no total"

Restrição intencional. Para enviar para mais pessoas, use lista de distribuição do Outlook ou divida em vários e-mails.

### `criar_compromisso`: "eventos recorrentes não são permitidos"

Restrição intencional. Crie cada ocorrência separadamente, ou use o app Outlook Web pra recorrências complexas.

### `deletar_compromisso`: "Operação destrutiva bloqueada"

Adicione `confirmacao: true` na chamada. O Claude faz isso automaticamente quando você confirma "sim, pode deletar".

### `onedrive_upload`: "Arquivo excede 4 MB"

Use `onedrive_upload_grande` em vez disso — sobe em chunks de 5MB.

### `onedrive_compartilhar`: link não funciona pra pessoas externas

Por padrão usamos escopo `organization` (só pessoas da empresa). Para link público, peça explicitamente:

> Compartilha esse arquivo com link público (escopo `anonymous`)

### `verificar_disponibilidade`: retornou vazio mesmo com horários livres

Algumas configurações de calendário restringem `findMeetingTimes` para pessoas fora da sua empresa. Tente apenas com colegas do mesmo tenant primeiro.

### Horários aparecem em fuso errado

Configure `OUTLOOK_TIMEZONE` com o nome IANA do seu fuso (ex: `America/New_York`, `Europe/Lisbon`):

```bash
claude mcp remove outlook
claude mcp add outlook -s user \
  -e OUTLOOK_TIMEZONE=America/New_York \
  -- npx -y @expertintegrado/outlook-mcp
```

Reinicie o Claude Code.

---

## Onde reportar bugs

Se nada aqui resolveu: [abra uma issue](https://github.com/expertintegrado/outlook-mcp/issues/new/choose) com:

- Versão do Node.js (`node --version`)
- Versão do MCP (`npm view @expertintegrado/outlook-mcp version`)
- Cliente MCP usado (Claude Code / Desktop / outro)
- Mensagem de erro completa
- O que você tentou fazer
