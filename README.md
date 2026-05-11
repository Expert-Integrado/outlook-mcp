# Outlook MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@expertintegrado/outlook-mcp.svg)](https://www.npmjs.com/package/@expertintegrado/outlook-mcp)

Conecta o seu **Microsoft 365 (Outlook + Calendário + OneDrive)** ao **Claude Code**. Depois de instalar, você pede coisas como *"lista meus e-mails de hoje"*, *"marca uma reunião com o Pedro amanhã às 14h"*, *"sobe esse arquivo pro OneDrive"* — e ele faz, direto na sua conta Microsoft.

> A instalação é guiada pelo próprio Claude Code. Você só cola um prompt e depois faz login na conta Microsoft quando ele pedir. Não precisa registrar nada no Azure, não precisa client secret, não precisa editar arquivo.

---

## Passo 1 — Instale o que precisa

Baixe e instale (uma vez só, na sua máquina):

- [Node.js 18 ou superior](https://nodejs.org/) — baixe e clique "Avançar" até o fim. **Reinicie o computador** depois.
- [Claude Code](https://claude.ai/download) — o aplicativo oficial da Anthropic.

## Passo 2 — Peça pro Claude Code instalar

Abra o **Claude Code** e cole o prompt abaixo no chat (use o botão de copiar no canto do bloco):

````text
Você é um instalador automático do MCP do Outlook da Expert Integrado.
Siga esta sequência:

1. Rode no terminal exatamente:

   claude mcp add outlook -s user \
     -e OUTLOOK_TIMEZONE=America/Sao_Paulo \
     -- npx -y @expertintegrado/outlook-mcp

2. Baixe e leia a documentação completa do MCP rodando:

   npm view @expertintegrado/outlook-mcp readme

   Use esse conteúdo como contexto — não precisa me mostrar o
   README inteiro, só absorver internamente.

3. Confirme que o comando rodou sem erro e me avise pra encerrar
   e reabrir o Claude Code pra ativar o MCP.

4. Depois que eu reabrir, guie-me pelo processo de autenticação
   (sem precisar de token — o login é feito pelo navegador na
   minha conta Microsoft 365).
````

O Claude Code vai:

1. Rodar o comando de configuração automaticamente
2. Te avisar pra reiniciar
3. Depois de reiniciar, te guiar pelo login no Microsoft 365

Quando ele pedir, **feche e abra o Claude Code** (feche o app inteiro, não só a aba).

## Passo 3 — Autentique na sua conta Microsoft

Com o Claude Code reaberto, peça:

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

> O MCP do Outlook da Expert Integrado não está funcionando. Roda `/mcp` pra verificar se ele tá listado, confere se o Node.js 18+ está instalado, e me ajuda a diagnosticar. Se precisar, consulta o guia em `https://github.com/expertintegrado/outlook-mcp/blob/main/docs/TROUBLESHOOTING.md`.

Se mesmo assim não rolar, [abra uma issue](https://github.com/expertintegrado/outlook-mcp/issues/new/choose) contando o que aconteceu.

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
- Limite anti-spam embutido: máximo 10 e-mails enviados ou 10 eventos criados por hora; acima disso exige confirmação explícita.
- Operações destrutivas (cancelar evento, deletar arquivo, deletar evento) exigem `confirmacao: true`.

## Contribuindo

Quer reportar um bug, sugerir uma melhoria ou contribuir com código? Veja [CONTRIBUTING.md](CONTRIBUTING.md) e, para o procedimento de release, [RELEASING.md](RELEASING.md).

## Licença

[MIT](LICENSE) © Expert Integrado
