# Release

Publicação no npm é automática via GitHub Actions quando uma tag `v*` é pushada. **Não rode `npm publish` manualmente** — a máquina local não tem (nem deve ter) credenciais de publicação.

Este documento é executável por uma IA. Se você é humano, peça ao Claude Code: *"Faça uma release patch/minor/major seguindo o RELEASING.md."*

---

## Pré-requisitos (verificar antes de começar)

```bash
# 1. Deve estar na main atualizada
git rev-parse --abbrev-ref HEAD   # deve retornar: main
git fetch && git status -uno      # deve dizer: up to date with origin/main

# 2. Working tree limpa
git status --porcelain            # deve retornar vazio

# 3. Secret NPM_TOKEN existe no GitHub
gh secret list --repo expertintegrado/outlook-mcp | grep -q NPM_TOKEN || echo "FALTA NPM_TOKEN"
```

Se qualquer verificação falhar, pare e corrija antes de prosseguir.

---

## Escolha do tipo de bump

Seguimos [SemVer](https://semver.org/lang/pt-BR/):

| Tipo | Usar quando | Exemplo |
|---|---|---|
| `patch` | Bug fix, ajuste de docs, dependência interna (sem mudança de comportamento visível) | 1.0.0 → 1.0.1 |
| `minor` | Feature nova compatível, nova tool, mudança de UX que não quebra configs existentes | 1.0.1 → 1.1.0 |
| `major` | Breaking change (muda env var, escopo Graph, comportamento público existente) | 1.1.0 → 2.0.0 |

Regra de ouro: **se algum usuário já instalado precisa autenticar de novo ou mudar config pra continuar funcionando, é major**.

> ⚠️ **Mudar `SCOPES` em `src/config.js`** é breaking — força re-autenticação. Bump major.

---

## Procedimento

Execute na ordem, sem pular etapas. Substitua `<TIPO>` por `patch`, `minor` ou `major`.

### 1. Atualizar CHANGELOG.md

```bash
CURRENT=$(node -p "require('./package.json').version")
NEXT=$(node -p "const [M,m,p]=require('./package.json').version.split('.').map(Number); const t='<TIPO>'; t==='major'?\`\${M+1}.0.0\`:t==='minor'?\`\${M}.\${m+1}.0\`:\`\${M}.\${m}.\${p+1}\`")
TODAY=$(date +%Y-%m-%d)
echo "Bumping $CURRENT -> $NEXT ($TODAY)"
```

Adicione uma seção no topo do `CHANGELOG.md` (abaixo do cabeçalho, acima da versão atual):

```markdown
## [$NEXT] — $TODAY

### Adicionado
- <itens novos, se houver>

### Mudou
- <mudanças em comportamento existente>

### Corrigido
- <bugs corrigidos>
```

Omita seções vazias. Liste cada item com o **porquê** da mudança.

### 2. Commitar o CHANGELOG

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): entrada para $NEXT"
```

### 3. Bump version + criar tag

```bash
npm version <TIPO>
```

Verificação:

```bash
test "$(node -p 'require("./package.json").version')" = "$(git describe --tags --exact-match)" \
  && echo "OK: package.json e tag sincronizados" \
  || echo "ERRO: desincronizado"
```

### 4. Push

```bash
git push origin main
git push origin "v$NEXT"
```

### 5. Acompanhar o workflow

```bash
sleep 5
gh run watch --exit-status
```

Esperado: job `publish` completa em ~15s, verde.

### 6. Verificar publicação

```bash
npm view @expertintegrado/outlook-mcp version
gh release view "v$NEXT" --repo expertintegrado/outlook-mcp
```

Ambos devem mostrar `$NEXT`.

---

## Falhas comuns

### Workflow falha: "Unauthorized" / "403" no `npm publish`

O `NPM_TOKEN` expirou ou foi revogado.

```bash
gh secret list --repo expertintegrado/outlook-mcp | grep NPM_TOKEN
```

Ação: gerar novo Granular Access Token em https://www.npmjs.com/settings/~/tokens com:
- Bypass 2FA ✅
- Read and write
- Scope no package `@expertintegrado/outlook-mcp`

```bash
gh secret set NPM_TOKEN --repo expertintegrado/outlook-mcp
```

Refazer apenas o último passo via `workflow_dispatch`:

```bash
gh workflow run release.yml --repo expertintegrado/outlook-mcp
```

### Workflow falha: "version already published"

```bash
git tag -d "v$NEXT"
git push origin ":v$NEXT"
# Volte ao passo 3 com bump maior
```

### Esqueci de atualizar o CHANGELOG antes do `npm version`

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): entrada para $NEXT (post-bump)"
git push origin main
```

A release já publicada não muda, mas a `main` fica consistente.

### Preciso reverter uma publicação

**Não é possível sobrescrever uma versão no npm.** Opções:

1. **Preferencial:** publicar versão nova (`patch`) com a correção.
2. **Excepcional:** `npm unpublish @expertintegrado/outlook-mcp@X.Y.Z` dentro de 72h. Desencorajado.

---

## Checklist rápido

```
[ ] Pré-requisitos passam (main atualizada, tree limpa, NPM_TOKEN existe)
[ ] CHANGELOG.md tem entrada nova com data de hoje
[ ] git commit do CHANGELOG
[ ] npm version <patch|minor|major>
[ ] git push origin main
[ ] git push origin v<versão>
[ ] gh run watch --exit-status passa verde
[ ] npm view @expertintegrado/outlook-mcp version retorna a nova versão
```
