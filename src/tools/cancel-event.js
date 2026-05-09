/**
 * cancel-event.js — Cancela um evento que VOCÊ organizou e notifica os participantes.
 *
 * Diferente de `deletar_compromisso`: usa POST /me/events/{id}/cancel, que envia
 * mensagem de cancelamento aos participantes. Funciona apenas se você for o
 * organizador.
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";
import { checkRateLimit, registerAction } from "../guardrails.js";

export const cancelEventSchema = z.object({
  evento_id: z
    .string()
    .min(1)
    .describe("ID do evento. Obtido via `listar_compromissos`."),
  comentario: z
    .string()
    .optional()
    .describe("Mensagem que será enviada aos participantes junto com o cancelamento."),
  confirmacao: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Obrigatório true se já enviou 10+ ações na hora. Mantém o guardrail anti-spam."
    ),
});

export async function cancelEvent(params) {
  const { evento_id, comentario, confirmacao } = params;

  await checkRateLimit("event", confirmacao);

  const body = {};
  if (comentario) body.comment = comentario;

  await graphRequest("POST", `/me/events/${encodeURIComponent(evento_id)}/cancel`, body);
  await registerAction("event");

  return (
    "🚫 Evento cancelado. Os participantes foram notificados.\n" +
    "Observação: você só pode cancelar eventos dos quais é organizador. Para eventos de terceiros, use `recusar_evento`."
  );
}
