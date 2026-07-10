# Guia de instalação

O Outlook MCP é distribuído como pacote npm público: [`@expertintegrado/outlook-mcp`](https://www.npmjs.com/package/@expertintegrado/outlook-mcp). O método recomendado é o **Modo 1 (npx)** — sem download, sem clone, sem caminho absoluto. Os modos alternativos são para quem está offline, quer dev/fork, ou precisa de setup sem internet para instalar do registry.

> Prefere não fazer nada disso na mão? O [README](README.md#passo-2--peça-pro-claude-code-instalar) tem um prompt colável que faz o Claude Code conduzir a instalação inteira por você — inclusive as etapas de navegador.

- [Pré-requisitos](#pré-requisitos)
- [Modo 1 — npx (recomendado)](#modo-1--npx-recomendado)
- [Modo 2 — ZIP (sem git, instalação local)](#modo-2--zip-sem-git-instalação-local)
- [Modo 3 — git clone (dev / atualização via `git pull`)](#modo-3--git-clone-dev--atualização-via-git-pull)
- [Autenticação Microsoft 365](#autenticação-microsoft-365)
- [Registrar um app próprio no Microsoft Entra (opcional)](#registrar-um-app-próprio-no-microsoft-entra-opcional)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Atualizando o MCP](#atualizando-o-mcp)

---

## Pré-requisitos

1. **Node.js 18 ou superior.**
   ```bash
   node --version
   ```
   Não tem? [Baixar aqui](https://nodejs.org/). Reinicie o computador após instalar.

2. **Um cliente MCP** instalado:
   - [Claude Desktop](https://claude.ai/download)
   - [Claude Code](https://claude.ai/download)
   - Ou qualquer outro cliente MCP (Cursor, Continue, Cline, etc.)

3. **Conta Microsoft 365** (corporativa ou pessoal). Não precisa registrar app no Azure — já usamos um app pré-aprovado da Expert.

4. **Conexão com internet** na primeira execução (`npx` baixa o pacote + login Microsoft).

---

## Modo 1 — npx (recomendado)

### Claude Desktop

Edite o arquivo:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Cole:

```json
{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "@expertintegrado/outlook-mcp"],
      "env": {
        "OUTLOOK_TIMEZONE": "America/Sao_Paulo"
      }
    }
  }
}
```

Feche e abra o Claude Desktop. Depois peça "autentica no Outlook MCP" para fazer login.

### Claude Code — global

```bash
claude mcp add outlook -s user \
  -e OUTLOOK_TIMEZONE=America/Sao_Paulo \
  -- npx -y @expertintegrado/outlook-mcp
```

Reinicie o Claude Code, depois peça "autentica no Outlook MCP".

### Claude Code — por projeto

Crie `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "@expertintegrado/outlook-mcp"],
      "env": {
        "OUTLOOK_TIMEZONE": "America/Sao_Paulo"
      }
    }
  }
}
```

> ⚠️ **Não coloque `mcpServers` dentro de `settings.json`.** O Claude Code só lê MCPs do `.mcp.json` (projeto) ou do `~/.claude.json` (usuário).

### Outros clientes MCP

A mesma estrutura (`command: "npx"`, `args: ["-y", "@expertintegrado/outlook-mcp"]`) funciona em Cursor, Continue, Cline. Consulte a documentação do seu cliente para o caminho do config.

---

## Modo 2 — ZIP (sem git, instalação local)

Use quando:

- Está em ambiente **sem acesso ao npm registry**
- Quer **inspecionar/editar** o código antes de usar
- Quer evitar que o `npx` baixe na inicialização

### Passos

1. Baixe o ZIP: [outlook-mcp-main.zip](https://github.com/Expert-Integrado/outlook-mcp/archive/refs/heads/main.zip)
2. Descompacte numa pasta estável.
3. Abra um terminal **dentro dessa pasta** e rode:
   ```bash
   npm install
   ```
4. Anote o **caminho absoluto** da pasta:
   ```bash
   pwd     # macOS/Linux
   cd      # Windows
   ```
5. Configure o cliente MCP apontando para `index.js`:
   ```json
   {
     "mcpServers": {
       "outlook": {
         "command": "node",
         "args": ["CAMINHO_ABSOLUTO_PARA/outlook-mcp/index.js"],
         "env": {
           "OUTLOOK_TIMEZONE": "America/Sao_Paulo"
         }
       }
     }
   }
   ```
   > **Windows:** dentro do JSON, use `/` ou `\\`. Nunca `\` solo — quebra o parser.
6. Reinicie o cliente MCP.

---

## Modo 3 — git clone (dev / atualização via `git pull`)

```bash
git clone https://github.com/Expert-Integrado/outlook-mcp.git
cd outlook-mcp
npm install
```

Configure como no [Modo 2, passo 5](#modo-2--zip-sem-git-instalação-local).

---

## Autenticação Microsoft 365

Diferente do Pipedrive, o Outlook MCP **não usa token de API**. A autenticação é por **Device Code Flow** OAuth da Microsoft:

1. Depois de configurado, peça ao Claude: *"autentica no Outlook MCP"*
2. O Claude chama a tool `autenticar` e te mostra:
   - Uma URL (geralmente `https://microsoft.com/devicelogin`)
   - Um código curto (ex: `ABC123XY`)
3. Acesse a URL no navegador, cole o código, faça login com sua conta Microsoft
4. Autorize as permissões pedidas
5. Volte ao Claude e peça "autentica" de novo — ele confirma `✅ Autenticado como ...`

O token fica em `~/.expertintegrado/outlook-mcp/token-cache.json` com permissão `0600`. Renovação é automática enquanto o refresh token for válido (~90 dias).

### Trocar de conta

Apague o arquivo de token:

```bash
# macOS/Linux
rm ~/.expertintegrado/outlook-mcp/token-cache.json

# Windows (PowerShell)
Remove-Item "$env:USERPROFILE\.expertintegrado\outlook-mcp\token-cache.json"
```

Depois peça "autentica" de novo no Claude.

---

## Registrar um app próprio no Microsoft Entra (opcional)

Por padrão o MCP usa o app público pré-registrado pela Expert (`Expert Integrado Outlook MCP`, client ID `b044cdc1-5c75-4c25-be87-46e51f036ae6`, multi-tenant) — **não precisa fazer nada desta seção**. Registre um app próprio apenas se:

- A política da sua empresa **bloqueia apps de terceiros** (e o admin não quer aprovar o app da Expert), ou
- Você quer controle total do app no seu próprio tenant.

> Esta é uma etapa de navegador. Se estiver no fluxo assistido do README, o Claude se oferece pra navegar e preencher por você — você só faz o login.

### Passo a passo

1. Acesse [https://entra.microsoft.com](https://entra.microsoft.com) (ou [https://portal.azure.com](https://portal.azure.com) → Microsoft Entra ID) e faça login como admin do tenant.
2. **App registrations** → **New registration**:
   - **Name:** o que preferir (ex: `Outlook MCP - Minha Empresa`)
   - **Supported account types:** "Accounts in this organizational directory only" (single-tenant) — ou multi-tenant, se quiser aceitar outras contas
   - **Redirect URI:** deixe **em branco** — o Device Code Flow não usa redirect URI
3. Com o app criado, abra **Authentication** → em **Advanced settings**, marque **Allow public client flows = Yes** → Save. Sem isso o Device Code Flow falha.
4. Abra **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions** e adicione exatamente os escopos que o MCP usa:
   - `Mail.Send`, `Mail.ReadWrite`, `MailboxSettings.Read`
   - `Calendars.ReadWrite`
   - `Contacts.ReadWrite`, `People.Read`
   - `Files.ReadWrite`
   - `User.Read`, `offline_access`
5. (Recomendado em tenant corporativo) Ainda em **API permissions**, clique **Grant admin consent** para pré-aprovar os escopos pra todo mundo do tenant.
6. **Não crie client secret nem certificado** — o MCP é Public Client Application; secret não é usado e não deve existir.
7. Na aba **Overview**, copie o **Application (client) ID** e o **Directory (tenant) ID**.
8. Reconfigure o MCP apontando pro seu app (exemplo Claude Code):

   ```bash
   claude mcp remove outlook
   claude mcp add outlook -s user \
     -e OUTLOOK_TIMEZONE=America/Sao_Paulo \
     -e OUTLOOK_CLIENT_ID=SEU_CLIENT_ID \
     -e OUTLOOK_TENANT_ID=SEU_TENANT_ID \
     -- npx -y @expertintegrado/outlook-mcp
   ```

9. Reinicie o cliente MCP, apague o token antigo (se existir) e peça "autentica no Outlook MCP" de novo.

---

## Variáveis de ambiente

Todas opcionais. Configuradas no bloco `env` do cliente MCP.

| Variável | Default | Descrição |
|---|---|---|
| `OUTLOOK_TIMEZONE` | `America/Sao_Paulo` | Fuso horário IANA usado em chamadas Graph (afeta horários retornados) |
| `OUTLOOK_CLIENT_ID` | `b044cdc1-5c75-4c25-be87-46e51f036ae6` | Override do client ID do app Azure. Use só se quiser registrar app próprio |
| `OUTLOOK_TENANT_ID` | `common` | Override do tenant. `common` aceita qualquer conta. Use o GUID do seu tenant para forçar single-tenant |

---

## Atualizando o MCP

### Modo 1 (npx)

```bash
npx clear-npx-cache
# ou
npm cache clean --force
```

Reinicie o cliente MCP.

### Modo 2 (ZIP)

Baixe o ZIP novo, substitua o conteúdo da pasta antiga, rode `npm install`.

### Modo 3 (git)

```bash
cd CAMINHO_PARA/outlook-mcp
git pull
npm install
```

Em todos os casos, reinicie o cliente MCP após atualizar. O token salvo continua válido — não precisa autenticar de novo (a menos que mudemos os escopos numa nova versão).

---

## Próximos passos

- Veja a lista completa de ferramentas em [docs/TOOLS.md](docs/TOOLS.md)
- Problemas? [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
