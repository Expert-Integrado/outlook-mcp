/**
 * onedrive-delete.js — Move arquivo ou pasta para a Lixeira do OneDrive.
 *
 * Operação destrutiva → exige confirmação explícita do usuário.
 * Itens vão para a lixeira (recuperáveis por 30 dias) — não é deleção permanente.
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";

export const onedriveDeleteSchema = z.object({
  caminho: z
    .string()
    .optional()
    .describe("Caminho do item no OneDrive. Use isto OU id."),
  id: z
    .string()
    .optional()
    .describe("ID do item no OneDrive. Use isto OU caminho."),
  confirmacao: z
    .boolean()
    .describe(
      "Obrigatório true. Operação destrutiva: o item vai para a Lixeira do OneDrive (recuperável por 30 dias)."
    ),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

export async function onedriveDelete(params) {
  const { caminho, id, confirmacao } = params;

  if (confirmacao !== true) {
    throw new Error(
      "Operação destrutiva bloqueada. Para confirmar, chame de novo passando `confirmacao: true`. " +
        "O item vai para a Lixeira do OneDrive e fica recuperável por 30 dias."
    );
  }
  if (!caminho && !id) {
    throw new Error("Informe `caminho` ou `id` do item.");
  }

  // Resolve ID + nome para mostrar no retorno
  let itemId = id;
  let nome = "";
  let tipoIcone = "📄";
  if (!itemId) {
    const item = await graphRequest(
      "GET",
      `/me/drive/root:/${encodeURI(normalizePath(caminho))}?$select=id,name,folder`
    );
    if (!item?.id) throw new Error("Item não encontrado no OneDrive.");
    itemId = item.id;
    nome = item.name;
    tipoIcone = item.folder ? "📁" : "📄";
  } else {
    const item = await graphRequest(
      "GET",
      `/me/drive/items/${encodeURIComponent(itemId)}?$select=id,name,folder`
    );
    nome = item?.name ?? "(sem nome)";
    tipoIcone = item?.folder ? "📁" : "📄";
  }

  await graphRequest("DELETE", `/me/drive/items/${encodeURIComponent(itemId)}`);

  return (
    `🗑️  ${tipoIcone} ${nome} movido para a Lixeira do OneDrive.\n` +
    `Recuperável por 30 dias em https://onedrive.live.com/?v=trash`
  );
}
