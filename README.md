# Outlook MCP

Open source, criado por **Eric Luciano** na **Mentoria Automações Inteligentes** (Expert Integrado).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@expertintegrado/outlook-mcp.svg)](https://www.npmjs.com/package/@expertintegrado/outlook-mcp)

**[→ Como funciona o Outlook MCP](https://expert-integrado.github.io/outlook-mcp/)** — a página do projeto, com o sistema explicado visualmente.

Conecta o seu **Microsoft 365 (Outlook + Calendário + OneDrive)** ao **Claude Code**. Depois de instalar, você pede coisas como *"lista meus e-mails de hoje"*, *"marca uma reunião com o Pedro amanhã às 14h"*, *"sobe esse arquivo pro OneDrive"* — e ele faz, direto na sua conta Microsoft.

> A instalação é guiada pelo próprio Claude Code. Você só cola um prompt e depois faz login na conta Microsoft quando ele pedir. Não precisa registrar nada no Azure, não precisa client secret, não precisa editar arquivo. Até as etapas de navegador o Claude se oferece pra fazer por você — você só digita a sua senha, sempre no site da Microsoft.

---

## Passo 1 — Instale o que precisa

Baixe e instale (uma vez só, na sua máquina):

- [Node.js 18 ou superior](https://nodejs.org/) — baixe e clique "Avançar" até o fim. **Reinicie o computador** depois.
- [Claude Code](https://claude.ai/download) — o aplicativo oficial da Anthropic.

## Passo 2 — Peça pro Claude Code instalar

Abra o **Claude Code** e cole o prompt abaixo no chat (use o botão de copiar no canto do bloco). Ele funciona em duas fases: na primeira o Claude registra o MCP e pede pra você reiniciar; **depois de reabrir, cole o mesmo prompt de novo** e ele continua de onde parou.

````text
Você é o instalador assistido do Outlook MCP da Expert Integrado
(@expertintegrado/outlook-mcp). Conduza a instalação de ponta a ponta,
uma etapa por vez, verificando o resultado real de cada etapa antes de
seguir pra próxima.

REGRAS FIXAS:
- NUNCA me peça senha, código MFA ou token no chat. Login é sempre meu,
  digitado no site da Microsoft. Tokens ficam só em arquivo local
  (~/.expertintegrado/outlook-mcp/) — nunca aparecem no chat.
- TODA etapa que acontece no navegador: antes de me mandar fazer,
  pergunte com AskUserQuestion "Essa etapa é no navegador. Quer que eu
  faça pra você?" com estas opções:
  1) "Faz pra mim (Playwright)" — rota padrão. Use as ferramentas do
     Playwright MCP; se não estiverem disponíveis, rode antes
     `claude mcp add playwright -- npx -y @playwright/mcp@latest` e me
     avise que é preciso reiniciar o Claude Code pra ativá-las.
     Navegue você mesmo, narrando cada clique e preenchimento, extraia
     da tela os dados necessários, e PARE pra eu digitar login/senha/MFA
     quando a Microsoft pedir.
  2) "Faz pra mim (Claude in Chrome)" — se eu já uso a extensão no
     Chrome; mesmo comportamento.
  3) "Eu mesmo faço" — então me passe o passo a passo manual, um passo
     por vez, esperando minha confirmação em cada um.
- Se o mesmo comando falhar 2 vezes com o mesmo erro, pare e me mostre
  o diagnóstico em vez de repetir. Consulte docs/TROUBLESHOOTING.md em
  https://github.com/Expert-Integrado/outlook-mcp antes de improvisar.

ETAPAS:

1. PRÉ-REQUISITOS: rode `node --version` e confirme Node.js 18+.
   Se faltar, me aponte https://nodejs.org e pare aqui.

2. SE a ferramenta `autenticar` do MCP outlook ainda NÃO estiver
   disponível pra você nesta sessão:
   a) Pergunte meu fuso horário (padrão: America/Sao_Paulo) e registre
      o MCP:
      claude mcp add outlook -s user \
        -e OUTLOOK_TIMEZONE=America/Sao_Paulo \
        -- npx -y @expertintegrado/outlook-mcp
   b) Leia `npm view @expertintegrado/outlook-mcp readme` como contexto
      interno (não precisa me mostrar).
   c) Me avise pra fechar e reabrir o Claude Code (o app inteiro) e
      colar ESTE MESMO prompt de novo. Você continuará da etapa 3.

3. AUTENTICAÇÃO: chame a ferramenta `autenticar`. Ela devolve uma URL
   (https://microsoft.com/devicelogin) e um código de uso único. Essa é
   uma etapa de navegador — aplique a regra fixa. Na rota automatizada:
   abra a URL, preencha o código, e espere EU fazer login e autorizar
   as permissões. Depois chame `autenticar` de novo até ver
   "Autenticado como ...".

4. SE aparecer "Need admin approval" (AADSTS65001): minha empresa exige
   aprovação do admin. Se eu for o admin, é etapa de navegador em
   https://entra.microsoft.com (Aplicativos empresariais → aprovar o
   app "Expert Integrado Outlook MCP"); se não for, redija a mensagem
   pronta que devo mandar pro admin, citando o nome do app e o client
   ID documentados em INSTALL.md do repositório. Se a empresa bloquear
   o app da Expert de vez, ofereça a rota de app próprio descrita no
   INSTALL.md (também etapa de navegador — mesma regra).

5. VALIDAÇÃO REAL: antes de declarar qualquer sucesso, chame
   `ler_emails` e me mostre 1 e-mail da minha caixa de entrada.
   Falhou = diagnostique antes de seguir.

6. TESTE FINAL E RESUMO: liste meus compromissos de hoje com
   `listar_compromissos` e encerre com um resumo: o que foi instalado,
   onde o token ficou salvo, os guardrails ativos (10 envios/hora,
   máximo 5 destinatários, confirmação pra ações destrutivas) e como
   trocar de conta depois.
````

O Claude Code vai:

1. Verificar os pré-requisitos e rodar o comando de configuração
2. Te avisar pra reiniciar (feche o app inteiro, não só a aba) — **cole o mesmo prompt de novo ao reabrir**
3. Conduzir o login no Microsoft 365, oferecendo fazer a parte de navegador por você
4. Provar que funcionou lendo 1 e-mail seu antes de declarar pronto

## Passo 3 — Autentique na sua conta Microsoft

Se estiver seguindo o prompt do Passo 2, o Claude conduz esta parte sozinho — inclusive oferecendo abrir o navegador e preencher o código por você (via Playwright ou Claude in Chrome; a senha é sempre você quem digita, no site da Microsoft). Se preferir pedir manualmente, diga:

> Autentica no Outlook MCP.

O Claude vai chamar a ferramenta `autenticar` e te mostrar:

```
🔐 Para autenticar no Microsoft 365:

1. Acesse: https://microsoft.com/devicelogin
2. Digite o código: ABC123XY
3. Faça login com a conta Microsoft 365 que você quer usar
4. Autorize as permissões pedidas

Depois de concluir o login no navegador, me peça novamente "autenticar"
para eu confirmar que deu certo.
```

Siga as instruções no navegador. Quando voltar ao Claude e pedir "autentica" de novo, ele vai confirmar `✅ Autenticado como seu_email@empresa.com`.

> O token fica salvo em `~/.expertintegrado/outlook-mcp/token-cache.json` (apenas na sua máquina). O Claude renova sozinho até a sessão expirar — quando expirar, é só pedir "autentica" de novo.

## Passo 4 — Teste

Pergunte ao Claude:

> Me mostra meus 5 últimos e-mails.

Se ele responder com a sua caixa de entrada, está funcionando. 🎉

---

## O que dá pra fazer

Exemplos depois de instalado:

**E-mail**
- *"Mostre meus e-mails não lidos"*
- *"Manda um e-mail pro joao@empresa.com com assunto 'Reunião' dizendo que confirmo amanhã"*
- *"Responda o último e-mail da Maria com 'recebido, vou olhar'"*
- *"Encaminha esse e-mail pra equipe de vendas"*
- *"Cria um rascunho pro Pedro sobre o projeto X"*
- *"Move esse e-mail pra pasta 'Processados'"*

**Calendário**
- *"Quais compromissos eu tenho hoje?"*
- *"Marca uma reunião com o Pedro amanhã das 14h às 15h"*
- *"Verifica disponibilidade do João, Maria e Pedro pra próxima quinta entre 9h e 18h"*
- *"Aceita o convite da reunião de planejamento"*
- *"Cancela a reunião de quinta e avisa todo mundo"*

**OneDrive**
- *"Lista os arquivos do meu OneDrive"*
- *"Busca o arquivo 'proposta-cliente-x'"*
- *"Sobe esse arquivo pro OneDrive na pasta Documentos"*
- *"Compartilha esse arquivo com link só pra organização"*

**Contatos**
- *"Procura o contato do Pedro Santos no diretório"*
- *"Adiciona Maria Silva como contato com o e-mail dela"*

Lista completa: [docs/TOOLS.md](docs/TOOLS.md)

## Quer mudar seu fuso horário?

Por padrão usamos `America/Sao_Paulo`. Se você estiver em outro fuso, peça ao Claude Code:

> No MCP do Outlook, troca a variável `OUTLOOK_TIMEZONE` pra `America/New_York` (ou o nome IANA do fuso que você usa) e reinicie.

## Trocar de conta Microsoft

Se quiser autenticar em outra conta, peça:

> Apaga o arquivo `~/.expertintegrado/outlook-mcp/token-cache.json` e me ajuda a autenticar de novo.

## Atualizando o MCP

Quando sair versão nova, o `npx` pega automaticamente na próxima inicialização. Se quiser forçar agora, peça ao Claude Code:

> Limpa o cache do npx do Outlook MCP (`npm cache clean --force`) e me avisa pra reiniciar o Claude Code.

## Não funcionou?

Cole isso no Claude Code:

> O MCP do Outlook da Expert Integrado não está funcionando. Roda `/mcp` pra verificar se ele tá listado, confere se o Node.js 18+ está instalado, e me ajuda a diagnosticar. Se precisar, consulta o guia em `https://github.com/Expert-Integrado/outlook-mcp/blob/main/docs/TROUBLESHOOTING.md`.

Se mesmo assim não rolar, [abra uma issue](https://github.com/Expert-Integrado/outlook-mcp/issues/new/choose) contando o que aconteceu.

## Instalação manual (fallback)

<details>
<summary>Se preferir configurar sem pedir pro Claude Code, clique aqui.</summary>

Rode no terminal:

```bash
claude mcp add outlook -s user \
  -e OUTLOOK_TIMEZONE=America/Sao_Paulo \
  -- npx -y @expertintegrado/outlook-mcp
```

Ou edite `~/.claude.json` (Claude Code, user scope) ou `.mcp.json` (Claude Code, por projeto):

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

Reinicie o Claude Code. Depois peça "autentica no Outlook MCP" pra fazer login.

</details>

## Instalação alternativa (offline, Claude Desktop, contribuidor)

Se você:

- Está em ambiente **sem internet** (ou com proxy que bloqueia o npm registry)
- Quer usar o **Claude Desktop** (app de chat) em vez do Claude Code
- Vai **contribuir com o código** do MCP

→ Veja o [guia técnico de instalação](INSTALL.md) — tem os modos via ZIP download, `git clone`, e a configuração para Claude Desktop e outros clientes MCP.

## Permissões solicitadas (Microsoft Graph)

Na hora de autenticar, a Microsoft vai pedir autorização para:

- `Mail.Send`, `Mail.ReadWrite` — enviar e ler e-mails
- `Calendars.ReadWrite` — gerenciar compromissos do calendário
- `Contacts.ReadWrite` — buscar e criar contatos
- `Files.ReadWrite` — gerenciar arquivos no seu OneDrive
- `People.Read`, `MailboxSettings.Read`, `User.Read` — ler diretório e configurações
- `offline_access` — renovar a sessão sem pedir login toda hora

## Segurança

- **Nenhuma credencial fica no código deste pacote.** O `client_id` e o `tenant_id` da app Azure são identificadores públicos por design (igual ao "Login com Google" de qualquer site) — o que é segredo (`client_secret`) **não existe** porque usamos Public Client Application via Device Code Flow.
- O token de sessão fica **apenas no seu computador**, em `~/.expertintegrado/outlook-mcp/token-cache.json` (modo `0600` — só seu usuário lê).
- Nenhum dado é enviado pra servidor da Expert Integrado — o MCP roda localmente e fala direto com a Microsoft Graph API.
- Limite anti-spam embutido: máximo 10 e-mails enviados ou 10 ações de calendário por hora; acima disso exige confirmação explícita.
- Operações destrutivas (deletar compromisso, deletar arquivo do OneDrive) exigem `confirmacao: true`.

## Contribuindo

Quer reportar um bug, sugerir uma melhoria ou contribuir com código? Veja [CONTRIBUTING.md](CONTRIBUTING.md) e, para o procedimento de release, [RELEASING.md](RELEASING.md).

## Licença

[MIT](LICENSE) © Expert Integrado
