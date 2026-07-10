# Instruções para o Claude Code neste repositório

Este arquivo é lido automaticamente pelo Claude Code quando alguém abre este repositório. Ele direciona tarefas comuns para a documentação detalhada correspondente.

---

## Mapa de tarefas

| Quando o usuário pedir... | Leia e siga |
|---|---|
| "Implemente X", "corrija o bug Y", "adicione a feature Z" | [CONTRIBUTING.md](CONTRIBUTING.md) |
| "Faça uma release", "publica uma versão nova", "bump patch/minor/major" | [RELEASING.md](RELEASING.md) |
| "Como instalar/configurar o MCP" (usuário perguntando de fora) | [README.md](README.md) — método primário é `npx`, fallback manual em `<details>` |
| Usuário abriu o repo sem o MCP configurado / quer usar o Outlook MCP | Seção [Onboarding assistido](#onboarding-assistido-instruções-para-o-claude) abaixo — **ofereça o setup ativamente** |
| "Não está funcionando", erros em runtime | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| "O que faz a tool X?", "quais tools existem?" | [docs/TOOLS.md](docs/TOOLS.md) |
| "Como funciona a autenticação?" | [INSTALL.md#autenticação-microsoft-365](INSTALL.md#autenticação-microsoft-365) |

Quando a tarefa casar com uma linha acima, leia o arquivo referenciado **antes** de começar.

---

## Onboarding assistido (instruções para o Claude)

Se você abriu este repositório (ou o usuário mencionou o Outlook MCP) e detectar que o MCP **não está configurado** — a ferramenta `autenticar` não aparece na sessão, ou não existe `~/.expertintegrado/outlook-mcp/token-cache.json` — **ofereça ativamente**: "Quer que eu instale e configure o Outlook MCP pra você agora? Eu conduzo tudo, inclusive as partes no navegador." Não espere o usuário pedir.

### Protocolo

1. **Uma etapa por vez, com verificação real.** Nunca declare uma fase concluída sem prova: registro do MCP = comando saiu sem erro; autenticação = `autenticar` respondeu "Autenticado como ..."; instalação = `ler_emails` retornou 1 e-mail de verdade.
2. **Toda etapa de navegador começa com AskUserQuestion**: "Essa etapa é no navegador. Quer que eu faça pra você?" com as opções: **(a) Faz pra mim (Playwright)** — rota padrão; se as tools do Playwright MCP não estiverem disponíveis, rode `claude mcp add playwright -- npx -y @playwright/mcp@latest` e avise que precisa reiniciar; **(b) Faz pra mim (Claude in Chrome)** — se o usuário já usa a extensão; **(c) Eu mesmo faço** — passo a passo manual, um passo por mensagem, aguardando confirmação.
3. **Na rota automatizada**: navegue você mesmo, narre cada clique/preenchimento, extraia da tela os valores necessários (código de dispositivo, Application ID, Tenant ID) e **pare** quando chegar em login/senha/MFA — isso é sempre do usuário.
4. **Nunca peça senha, código MFA ou token no chat.** Nenhum segredo aparece no chat nem em arquivo do projeto: o token de sessão é gravado pelo próprio MCP em `~/.expertintegrado/outlook-mcp/` (fora do repo). Overrides de configuração (`OUTLOOK_CLIENT_ID`, `OUTLOOK_TENANT_ID`, `OUTLOOK_TIMEZONE`) vão no bloco `env` do cliente MCP — são identificadores públicos, não segredos, mas mesmo assim não pertencem a commits deste repo.
5. **Mesmo erro 2x = pare e diagnostique** com [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md); não repita o comando às cegas.
6. **Feche com teste E2E + resumo**: `ler_emails` (1 e-mail) + `listar_compromissos` (hoje), depois resuma o que foi instalado, onde o token vive, os guardrails ativos e como trocar de conta.

### Etapas de navegador deste projeto (URLs exatas)

| Etapa | Quando acontece | URL | O que fazer / extrair |
|---|---|---|---|
| Login por código de dispositivo | Sempre, na primeira autenticação (tool `autenticar`) | `https://microsoft.com/devicelogin` | Preencher o código retornado pela tool; usuário faz login e autoriza as permissões; nada a extrair |
| Aprovação de admin (consentimento) | Só se aparecer "Need admin approval" / `AADSTS65001` (tenant corporativo restritivo) | `https://entra.microsoft.com` → Identidade → Aplicativos → **Aplicativos empresariais** (ou `https://portal.azure.com` → Microsoft Entra ID → Enterprise applications) | Localizar o app "Expert Integrado Outlook MCP" (client ID em [INSTALL.md](INSTALL.md)) → Permissões → **Conceder consentimento do administrador**. Só funciona se o usuário for admin do tenant; senão, redija a mensagem pro admin dele |
| Registro de app próprio (opcional) | Só se a empresa bloquear o app da Expert ou o usuário preferir app próprio | `https://entra.microsoft.com` → **App registrations** → New registration | Seguir [INSTALL.md — app próprio](INSTALL.md#registrar-um-app-próprio-no-microsoft-entra-opcional): sem redirect URI, **Allow public client flows = Yes**, permissões delegadas do Graph, extrair da tela o **Application (client) ID** e o **Directory (tenant) ID** e reconfigurar o MCP com `OUTLOOK_CLIENT_ID`/`OUTLOOK_TENANT_ID`. **Nunca criar client secret** — este MCP é Public Client, secret não é usado |

O prompt colável que os usuários seguem está no [README.md](README.md) — mantenha este protocolo e o prompt sempre coerentes entre si.

---

## Invariantes do repositório

Violações destas regras devem ser questionadas com o usuário antes de prosseguir:

1. **Nunca push direto na `main`.** Toda mudança passa por Pull Request.
2. **Nunca `npm publish` manual.** Publicação é automática via workflow `.github/workflows/release.yml` disparado por push de tag `v*`.
3. **`package.json.version`, tag git `vX.Y.Z` e entrada em `CHANGELOG.md` precisam estar sempre sincronizados.**
4. **Sem segredos no código, testes ou exemplos.** Tokens de sessão, dados reais — jamais comitar.
5. **Dependências mínimas.** Cada dep nova atrasa startup pros usuários instalando via `npx`. Adicione só se justificável.
6. **ESM only** (`"type": "module"`), **Node.js 18+**, sem build step — `index.js` roda direto.
7. **Token de sessão NUNCA fica no diretório do projeto** — sempre em `~/.expertintegrado/outlook-mcp/`.
8. **Mensagens de erro em PT-BR** com sugestão acionável (ex: "peça pra eu chamar `autenticar`").

---

## Contexto rápido do projeto

- **O que é:** servidor MCP que expõe Microsoft 365 (Outlook + Calendário + OneDrive) para clientes Claude
- **Onde está publicado:** [`@expertintegrado/outlook-mcp`](https://www.npmjs.com/package/@expertintegrado/outlook-mcp) no npm
- **Método primário de instalação:** `npx -y @expertintegrado/outlook-mcp` — sem clone, sem caminho absoluto
- **Autenticação:** Device Code Flow do Azure AD via MSAL (não usa client secret — Public Client Application)
- **App Azure:** `b044cdc1-5c75-4c25-be87-46e51f036ae6` (registrado pela Expert, multi-tenant)
- **Storage de token + rate-limit:** `~/.expertintegrado/outlook-mcp/`
- **Arquivo principal:** [`index.js`](index.js) — registra 29 tools (1 de auth + 28 funcionais)
- **Tools:** [`src/tools/`](src/tools/) — uma tool por arquivo, padrão schema Zod + handler async
- **Cliente Graph API:** [`src/graph.js`](src/graph.js) com helpers `graphRequest`, `graphRequestPaginated`, `graphUpload`
- **Guardrails:** [`src/guardrails.js`](src/guardrails.js) — rate limit 10/h por domínio (email, event), validação anti-spam

---

## Padrão de uma tool

```js
// src/tools/exemplo.js
import { z } from "zod";
import { graphRequest } from "../graph.js";

export const exemploSchema = z.object({
  campo: z.string().describe("Descrição clara para o LLM"),
});

export async function exemplo(params) {
  const result = await graphRequest("GET", "/me/...");
  return `Texto formatado pra mostrar ao usuário`;
}
```

Registro no `index.js`:

```js
registerTool(
  "exemplo",
  "Descrição da tool (vista pelo LLM)",
  exemploSchema,
  exemplo,
  "fazer exemplo"   // contexto de erro: "Erro ao fazer exemplo: ..."
);
```

---

## Preferências de interação

- Respostas e commits em **português brasileiro** (com acentos corretos)
- Commits: imperativo, foco no **porquê** (não no "o quê")
- Prefixos de commit: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Ao terminar tarefas com múltiplas mudanças, rode `git status` e confirme antes de commitar
- Ao rodar release, sempre faça as verificações de pré-requisito do [RELEASING.md](RELEASING.md) — nunca pule
