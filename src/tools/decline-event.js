/**
 * decline-event.js — Recusa um convite de reunião/compromisso recebido.
 *
 * Endpoint Graph: POST /me/events/{id}/decline
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";

export const declineEventSchema = z.object({
  evento_id: z
    .string()
    .min(1)
    .describe("ID do evento. Obtido via `listar_compromissos`."),
  comentario: z
    .string()
    .optional()
    .describe("Mensagem opcional para o organizador (recomendado quando recusa)."),
  enviar_resposta: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Se true, envia notificação ao organizador. Se false, recusa silenciosamente."
    ),
  proposta_horario: z
    .string()
    .optional()
    .describe(
      "ISO 8601 opcional do horário alternativo proposto (ex: '2026-05-15T14:00:00')."
    ),
  proposta_duracao_minutos: z
    .number()
    .optional()
    .describe("Duração da proposta em minutos (usado junto com proposta_horario)."),
});

export async function declineEvent(params) {
  const {
    evento_id,
    comentario,
    enviar_resposta,
    proposta_horario,
    proposta_duracao_minutos,
  } = params;

  const body = { sendResponse: enviar_resposta };
  if (comentario) body.comment = comentario;

  if (proposta_horario) {
    if (!proposta_duracao_minutos) {
      throw new Error("Para propor outro horário, informe também `proposta_duracao_minutos`.");
    }
    const inicio = new Date(proposta_horario);
    const fim = new Date(inicio.getTime() + proposta_duracao_minutos * 60_000);
    body.proposedNewTime = {
      start: { dateTime: inicio.toISOString().replace(/\.\d{3}Z$/, ""), timeZone: "UTC" },
      end: { dateTime: fim.toISOString().replace(/\.\d{3}Z$/, ""), timeZone: "UTC" },
    };
  }

  await graphRequest("POST", `/me/events/${encodeURIComponent(evento_id)}/decline`, body);

  if (proposta_horario) {
    return `❌ Convite recusado com proposta de novo horário (${proposta_horario} por ${proposta_duracao_minutos}min).`;
  }
  return enviar_resposta
    ? "❌ Convite recusado e resposta enviada ao organizador."
    : "❌ Convite recusado (resposta não enviada).";
}
