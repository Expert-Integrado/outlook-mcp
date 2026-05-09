# Contribuindo

Este documento é executável por uma IA. Se você é humano, peça ao Claude Code: *"Implemente `<descrição da mudança>` seguindo o CONTRIBUTING.md."*

## Regras fixas

1. **Nada vai direto pra `main`.** Toda mudança passa por Pull Request.
2. **Não rode `npm publish` manualmente** — quem publica é o workflow `release.yml` via push de tag. Ver [RELEASING.md](RELEASING.md).
3. **Não inclua segredos.** Tokens de sessão Microsoft 365, dados reais de conta, credenciais — nunca no código, nos testes, nos exemplos ou nos commits.
4. **Dependências mínimas.** Cada dependência nova aumenta o tempo de startup via `npx`. Adicione apenas se justificável.

## Fluxo

### 1. Criar branch a partir da `main`

Prefixos convencionais: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`.

```bash
git checkout main
git pull
git checkout -b <prefixo>/<nome-curto>
```

### 2. Implementar e commitar

Mensagens em português, imperativo, foco no porquê:

```bash
git commit -m "fix: corrige fuso horario em listar_compromissos quando OUTLOOK_TIMEZONE vazio"
```

### 3. Testar localmente

```bash
# O MCP deve iniciar sem erro (fica aguardando stdio — Ctrl+C pra encerrar)
node index.js
```

Pra testar de ponta a ponta como usuário final, registre o MCP local no Claude Code:

```bash
claude mcp add outlook-dev -s user \
  -- node <caminho-absoluto>/outlook-mcp/index.js
```

Reinicie o Claude Code, peça "autentica no Outlook", e valide as ferramentas afetadas.

> **Atenção ao token:** o MCP local usa o mesmo storage do MCP em produção (`~/.expertintegrado/outlook-mcp/token-cache.json`). Para isolar, defina `OUTLOOK_CLIENT_ID` diferente no `claude mcp add`, ou copie/restaure o token entre testes.

### 4. Atualizar documentação

Se a mudança altera comportamento visível ao usuário, atualize na mesma PR:

- `README.md` — se muda instalação, uso básico, ou lista de features
- `INSTALL.md` — se muda setup, pré-requisitos, ou env vars
- `docs/TOOLS.md` — se adiciona, remove ou muda uma tool
- `docs/TROUBLESHOOTING.md` — se a mudança resolve ou introduz caso de erro conhecido

**Não atualize `CHANGELOG.md` aqui** — isso é feito no momento da release ([RELEASING.md](RELEASING.md)).

### 5. Abrir Pull Request

```bash
git push -u origin HEAD
gh pr create --fill
```

### 6. Revisão + merge

- Pelo menos **1 aprovação** obrigatória
- Merge via **Squash and merge**
- Após merge, a mudança está na `main` mas **não publicada**. Publicação é passo separado — ver [RELEASING.md](RELEASING.md).

## Estilo técnico

- JavaScript ESM (`"type": "module"`)
- Node.js 18+ — features modernas liberadas (top-level await, etc.)
- Sem transpilação, sem build step — roda direto com `node index.js`
- Tools seguem o padrão de [src/tools/send-email.js](src/tools/send-email.js): schema Zod + handler async + retorno texto

## Adicionando uma tool nova

1. Crie `src/tools/<nome>.js` exportando `<nome>Schema` e `<nome>` (handler).
2. Importe e registre no `index.js` via `registerTool(...)`.
3. Adicione entrada em `docs/TOOLS.md`.
4. Se a tool precisar de novo escopo Microsoft Graph, adicione em [src/config.js](src/config.js) e documente no README.

## Dúvidas

- Instalação / erros de runtime: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Publicação de versão nova: [RELEASING.md](RELEASING.md)
- Outras: [abra uma issue](https://github.com/expertintegrado/outlook-mcp/issues/new/choose)
