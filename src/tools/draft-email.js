/**
 * draft-email.js — Cria um RASCUNHO de e-mail no Outlook (não envia).
 *
 * O rascunho fica salvo na pasta Rascunhos. O usuário pode revisar e enviar
 * pelo Outlook web/desktop, ou usar uma chamada subsequente para enviar (ainda
 * não implementado nesta versão).
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";
import { validateRecipients } from "../guardrails.js";

export const draftEmailSchema = z.object({
  para: z
    .string()
    .describe(
      "E-mails dos destinatários. Múltiplos separados por vírgula. Total para+CC+CCO ≤ 5."
    ),
  assunto: z.string().describe("Assunto do e-mail"),
  corpo: z.string().describe("Corpo do e-mail (texto simples ou HTML)."),
  cc: z.string().optional().describe("E-mails em cópia (CC)."),
  cco: z.string().optional().describe("E-mails em cópia oculta (CCO/BCC)."),
  html: z
    .boolean()
    .optional()
    .default(false)
    .describe("Se true, o corpo é HTML. Padrão: texto simples."),
});

function parseRecipients(field) {
  if (!field) return [];
  return field
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((address) => ({ emailAddress: { address } }));
}

export async function draftEmail(params) {
  const { para, assunto, corpo, cc, cco, html } = params;

  validateRecipients({ para, cc, cco });

  const message = {
    subject: assunto,
    body: { contentType: html ? "HTML" : "Text", content: corpo },
    toRecipients: parseRecipients(para),
  };
  const ccList = parseRecipients(cc);
  if (ccList.length) message.ccRecipients = ccList;
  const bccList = parseRecipients(cco);
  if (bccList.length) message.bccRecipients = bccList;

  const result = await graphRequest("POST", "/me/messages", message);

  return (
    `📝 Rascunho criado: "${result.subject}"\n` +
    `Salvo em Rascunhos. Abra no Outlook para revisar e enviar.\n` +
    `id: ${result.id}` +
    (result.webLink ? `\nLink: ${result.webLink}` : "")
  );
}
