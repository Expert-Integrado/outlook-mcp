#!/usr/bin/env node
/**
 * index.js — Servidor MCP Outlook (Microsoft 365)
 *
 * 28 ferramentas: autenticação, e-mail, calendário, contatos, OneDrive.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { autenticar, autenticarSchema } from "./src/tools/autenticar.js";

import { sendEmail, sendEmailSchema } from "./src/tools/send-email.js";
import { readEmails, readEmailsSchema } from "./src/tools/read-emails.js";
import { replyEmail, replyEmailSchema } from "./src/tools/reply-email.js";
import { forwardEmail, forwardEmailSchema } from "./src/tools/forward-email.js";
import { markEmail, markEmailSchema } from "./src/tools/mark-email.js";
import { moveEmail, moveEmailSchema } from "./src/tools/move-email.js";
import { downloadAttachment, downloadAttachmentSchema } from "./src/tools/download-attachment.js";
import { draftEmail, draftEmailSchema } from "./src/tools/draft-email.js";
import { listFolders, listFoldersSchema } from "./src/tools/list-folders.js";
import { createFolder, createFolderSchema } from "./src/tools/create-folder.js";

import { createEvent, createEventSchema } from "./src/tools/create-event.js";
import { listEvents, listEventsSchema } from "./src/tools/list-events.js";
import { updateEvent, updateEventSchema } from "./src/tools/update-event.js";
import { deleteEvent, deleteEventSchema } from "./src/tools/delete-event.js";
import { acceptEvent, acceptEventSchema } from "./src/tools/accept-event.js";
import { declineEvent, declineEventSchema } from "./src/tools/decline-event.js";
import { cancelEvent, cancelEventSchema } from "./src/tools/cancel-event.js";
import { checkAvailability, checkAvailabilitySchema } from "./src/tools/check-availability.js";

import { searchContacts, searchContactsSchema } from "./src/tools/search-contacts.js";
import { createContact, createContactSchema } from "./src/tools/create-contact.js";

import { onedriveList, onedriveListSchema } from "./src/tools/onedrive-list.js";
import { onedriveSearch, onedriveSearchSchema } from "./src/tools/onedrive-search.js";
import { onedriveDownload, onedriveDownloadSchema } from "./src/tools/onedrive-download.js";
import { onedriveUpload, onedriveUploadSchema } from "./src/tools/onedrive-upload.js";
import { onedriveUploadLarge, onedriveUploadLargeSchema } from "./src/tools/onedrive-upload-large.js";
import { onedriveShare, onedriveShareSchema } from "./src/tools/onedrive-share.js";
import { onedriveCreateFolder, onedriveCreateFolderSchema } from "./src/tools/onedrive-create-folder.js";
import { onedriveDelete, onedriveDeleteSchema } from "./src/tools/onedrive-delete.js";

const server = new McpServer({
  name: "outlook-mcp",
  version: "1.0.0",
});

function errMsg(err, contexto) {
  const hint = err.hint ? `\n💡 ${err.hint}` : "";
  return `Erro ao ${contexto}: ${err.message}${hint}`;
}

/**
 * Registra uma tool com try/catch padronizado.
 */
function registerTool(nome, descricao, schema, handler, contextoErro) {
  server.tool(nome, descricao, schema.shape, async (params) => {
    try {
      const result = await handler(params);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: errMsg(err, contextoErro) }],
        isError: true,
      };
    }
  });
}

// ─── Autenticação ─────────────────────────────────────────────────────────────

registerTool(
  "autenticar",
  "Inicia ou conclui a autenticação no Microsoft 365 via Device Code Flow. " +
    "Chame esta ferramenta na primeira vez (mostra URL + código pra colar no navegador) e " +
    "depois novamente após fazer login no navegador (confirma que deu certo). " +
    "Use também quando ver erro de sessão expirada.",
  autenticarSchema,
  autenticar,
  "autenticar"
);

// ─── E-mail ───────────────────────────────────────────────────────────────────

registerTool(
  "enviar_email",
  "Envia um e-mail pelo Outlook da conta Microsoft 365 autenticada",
  sendEmailSchema,
  sendEmail,
  "enviar e-mail"
);

registerTool(
  "ler_emails",
  "Lê e-mails do Outlook (caixa de entrada, enviados ou rascunhos) com opção de filtro",
  readEmailsSchema,
  readEmails,
  "ler e-mails"
);

registerTool(
  "responder_email",
  "Responde a um e-mail existente mantendo o threading. Pode responder apenas ao remetente ou a todos.",
  replyEmailSchema,
  replyEmail,
  "responder e-mail"
);

registerTool(
  "encaminhar_email",
  "Encaminha um e-mail existente para um ou mais destinatários, com comentário opcional",
  forwardEmailSchema,
  forwardEmail,
  "encaminhar e-mail"
);

registerTool(
  "marcar_email",
  "Marca um e-mail como lido ou não lido no Outlook",
  markEmailSchema,
  markEmail,
  "marcar e-mail"
);

registerTool(
  "mover_email",
  "Move um e-mail para uma pasta específica do Outlook. Cria a pasta automaticamente se não existir. Atenção: o Graph API gera um novo ID para o e-mail após a movimentação — use ler_emails na pasta de destino para obter o ID atualizado.",
  moveEmailSchema,
  moveEmail,
  "mover e-mail"
);

registerTool(
  "baixar_anexo",
  "Baixa anexos de um e-mail do Outlook para o computador.",
  downloadAttachmentSchema,
  downloadAttachment,
  "baixar anexo"
);

registerTool(
  "criar_rascunho_email",
  "Cria um rascunho de e-mail (não envia). Fica salvo na pasta Rascunhos para o usuário revisar.",
  draftEmailSchema,
  draftEmail,
  "criar rascunho de e-mail"
);

registerTool(
  "listar_pastas_email",
  "Lista as pastas de e-mail do Outlook (Inbox, Drafts, Sent, e personalizadas), com totais e não lidos",
  listFoldersSchema,
  listFolders,
  "listar pastas de e-mail"
);

registerTool(
  "criar_pasta_email",
  "Cria uma pasta de e-mail no Outlook (raiz ou dentro de outra pasta)",
  createFolderSchema,
  createFolder,
  "criar pasta de e-mail"
);

// ─── Calendário ───────────────────────────────────────────────────────────────

registerTool(
  "criar_compromisso",
  "Cria um compromisso no Calendário do Outlook (Microsoft 365)",
  createEventSchema,
  createEvent,
  "criar compromisso"
);

registerTool(
  "listar_compromissos",
  "Lista compromissos do Calendário do Outlook para uma data ou período",
  listEventsSchema,
  listEvents,
  "listar compromissos"
);

registerTool(
  "atualizar_compromisso",
  "Atualiza campos de um compromisso existente. Busca pelo título e data.",
  updateEventSchema,
  updateEvent,
  "atualizar compromisso"
);

registerTool(
  "deletar_compromisso",
  "Deleta um compromisso do seu calendário (não notifica participantes). Para cancelar avisando os participantes use `cancelar_compromisso`.",
  deleteEventSchema,
  deleteEvent,
  "deletar compromisso"
);

registerTool(
  "aceitar_evento",
  "Aceita um convite de evento recebido. Notifica o organizador por padrão.",
  acceptEventSchema,
  acceptEvent,
  "aceitar evento"
);

registerTool(
  "recusar_evento",
  "Recusa um convite de evento. Pode propor horário alternativo via proposta_horario.",
  declineEventSchema,
  declineEvent,
  "recusar evento"
);

registerTool(
  "cancelar_compromisso",
  "Cancela um compromisso do qual VOCÊ é organizador e notifica os participantes. Para eventos de terceiros use `recusar_evento`.",
  cancelEventSchema,
  cancelEvent,
  "cancelar compromisso"
);

registerTool(
  "verificar_disponibilidade",
  "Verifica disponibilidade de uma ou mais pessoas em uma janela de tempo, encontrando horários livres em comum",
  checkAvailabilitySchema,
  checkAvailability,
  "verificar disponibilidade"
);

// ─── Contatos ─────────────────────────────────────────────────────────────────

registerTool(
  "buscar_contato",
  "Busca contatos pelo nome no diretório Microsoft 365 (People API) retornando e-mail, cargo e telefone",
  searchContactsSchema,
  searchContacts,
  "buscar contato"
);

registerTool(
  "criar_contato",
  "Cria um novo contato na agenda do Outlook com nome, e-mail, telefone, empresa e cargo",
  createContactSchema,
  createContact,
  "criar contato"
);

// ─── OneDrive ─────────────────────────────────────────────────────────────────

registerTool(
  "onedrive_listar",
  "Lista arquivos e pastas em um diretório do OneDrive (vazio = raiz)",
  onedriveListSchema,
  onedriveList,
  "listar OneDrive"
);

registerTool(
  "onedrive_buscar",
  "Busca arquivos no OneDrive por nome ou conteúdo (busca full-text do Microsoft Graph)",
  onedriveSearchSchema,
  onedriveSearch,
  "buscar no OneDrive"
);

registerTool(
  "onedrive_download",
  "Gera URL temporária de download (~1h de validade) para um arquivo do OneDrive",
  onedriveDownloadSchema,
  onedriveDownload,
  "obter link de download"
);

registerTool(
  "onedrive_upload",
  "Faz upload de arquivo local pequeno (<4MB) para o OneDrive. Para arquivos maiores use `onedrive_upload_grande`.",
  onedriveUploadSchema,
  onedriveUpload,
  "fazer upload no OneDrive"
);

registerTool(
  "onedrive_upload_grande",
  "Faz upload de arquivo local grande (>4MB) para o OneDrive em chunks de 5MB",
  onedriveUploadLargeSchema,
  onedriveUploadLarge,
  "fazer upload em chunks no OneDrive"
);

registerTool(
  "onedrive_compartilhar",
  "Cria link de compartilhamento (view ou edit) para um arquivo ou pasta do OneDrive",
  onedriveShareSchema,
  onedriveShare,
  "compartilhar do OneDrive"
);

registerTool(
  "onedrive_criar_pasta",
  "Cria uma nova pasta no OneDrive",
  onedriveCreateFolderSchema,
  onedriveCreateFolder,
  "criar pasta no OneDrive"
);

registerTool(
  "onedrive_deletar",
  "Move arquivo ou pasta para a Lixeira do OneDrive (operação destrutiva — exige confirmacao: true). Recuperável por 30 dias.",
  onedriveDeleteSchema,
  onedriveDelete,
  "deletar do OneDrive"
);

// ─── Inicialização ───────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
