/**
 * onedrive-share.js — Cria link de compartilhamento (view/edit) para arquivo ou pasta.
 *
 * Por padrão gera link "view" restrito à organização (escopo `organization`),
 * que é o mais seguro. Pode-se trocar para "edit" e/ou "anonymous" se o
 * usuário pedir explicitamente.
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";

export const onedriveShareSchema = z.object({
  caminho: z
    .string()
    .optional()
    .describe("Caminho do item no OneDrive. Use isto OU id."),
  id: z
    .string()
    .optional()
    .describe("ID do item no OneDrive. Use isto OU caminho."),
  permissao: z
    .enum(["view", "edit"])
    .optional()
    .default("view")
    .describe("Permissão do link: 'view' (somente leitura) ou 'edit'."),
  escopo: z
    .enum(["organization", "anonymous"])
    .optional()
    .default("organization")
    .describe(
      "'organization' = só pessoas da empresa (recomendado). 'anonymous' = qualquer um com o link (use só quando o usuário pedir)."
    ),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

export async function onedriveShare(params) {
  const { caminho, id, permissao, escopo } = params;
  if (!caminho && !id) {
    throw new Error("Informe `caminho` ou `id` do item.");
  }

  // Resolve o ID se o usuário passou caminho.
  let itemId = id;
  let itemName = "";
  if (!itemId) {
    const item = await graphRequest(
      "GET",
      `/me/drive/root:/${encodeURI(normalizePath(caminho))}?$select=id,name`
    );
    if (!item?.id) throw new Error("Item não encontrado no OneDrive.");
    itemId = item.id;
    itemName = item.name;
  }

  const result = await graphRequest(
    "POST",
    `/me/drive/items/${encodeURIComponent(itemId)}/createLink`,
    {
      type: permissao,
      scope: escopo,
    }
  );

  const url = result?.link?.webUrl;
  if (!url) throw new Error("OneDrive não retornou link de compartilhamento.");

  const escopoTxt = escopo === "anonymous" ? "qualquer pessoa com o link" : "somente pessoas da organização";
  const permTxt = permissao === "edit" ? "edição" : "visualização";

  return (
    `🔗 Link de ${permTxt} criado (${escopoTxt})\n` +
    (itemName ? `Item: ${itemName}\n` : "") +
    `URL: ${url}`
  );
}
