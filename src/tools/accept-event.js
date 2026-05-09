/**
 * accept-event.js — Aceita um convite de reunião/compromisso recebido.
 *
 * Endpoint Graph: POST /me/events/{id}/accept
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";

export const acceptEventSchema = z.object({
  evento_id: z
    .string()
    .min(1)
    .describe("ID do evento. Obtido via `listar_compromissos`."),
  comentario: z
    .string()
    .optional()
    .describe("Mensagem opcional para o organizador."),
  enviar_resposta: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Se true, envia notificação ao organizador. Se false, aceita silenciosamente."
    ),
});

export async function acceptEvent(params) {
  const { evento_id, comentario, enviar_resposta } = params;

  const body = {
    sendResponse: enviar_resposta,
  };
  if (comentario) body.comment = comentario;

  await graphRequest("POST", `/me/events/${encodeURIComponent(evento_id)}/accept`, body);

  return enviar_resposta
    ? "✅ Convite aceito e resposta enviada ao organizador."
    : "✅ Convite aceito (resposta não enviada).";
}
