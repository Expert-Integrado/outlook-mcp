# Instruções para o Claude Code neste repositório

Este arquivo é lido automaticamente pelo Claude Code quando alguém abre este repositório. Ele direciona tarefas comuns para a documentação detalhada correspondente.

---

## Mapa de tarefas

| Quando o usuário pedir... | Leia e siga |
|---|---|
| "Implemente X", "corrija o bug Y", "adicione a feature Z" | [CONTRIBUTING.md](CONTRIBUTING.md) |
| "Faça uma release", "publica uma versão nova", "bump patch/minor/major" | [RELEASING.md](RELEASING.md) |
| "Como instalar/configurar o MCP" (usuário perguntando de fora) | [README.md](README.md) — método primário é `npx`, fallback manual em `<details>` |
| "Não está funcionando", erros em runtime | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| "O que faz a tool X?", "quais tools existem?" | [docs/TOOLS.md](docs/TOOLS.md) |
| "Como funciona a autenticação?" | [INSTALL.md#autenticação-microsoft-365](INSTALL.md#autenticação-microsoft-365) |

Quando a tarefa casar com uma linha acima, leia o arquivo referenciado **antes** de começar.

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
