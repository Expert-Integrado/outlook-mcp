/**
 * create-folder.js — Cria pasta de e-mail (mailFolder) no Outlook.
 */

import { z } from "zod";
import { graphRequest, graphRequestPaginated } from "../graph.js";

export const createFolderSchema = z.object({
  nome: z.string().min(1).describe("Nome da nova pasta de e-mail."),
  pasta_pai: z
    .string()
    .optional()
    .describe(
      "Nome da pasta pai (ex: 'Inbox' ou 'Arquivo'). Se vazio, a pasta é criada na raiz da caixa de e-mail."
    ),
});

export async function createFolder(params) {
  const { nome, pasta_pai } = params;

  let endpoint = "/me/mailFolders";
  let paiNome = "";

  if (pasta_pai) {
    const filtro = encodeURIComponent(`displayName eq '${pasta_pai}'`);
    const result = await graphRequestPaginated(
      `/me/mailFolders?$filter=${filtro}&$select=id,displayName`,
      5
    );
    const pai = result?.value?.[0];
    if (!pai) throw new Error(`Pasta pai "${pasta_pai}" não encontrada.`);
    endpoint = `/me/mailFolders/${encodeURIComponent(pai.id)}/childFolders`;
    paiNome = pai.displayName;
  }

  const result = await graphRequest("POST", endpoint, { displayName: nome });

  const localizacao = paiNome ? ` dentro de "${paiNome}"` : " na raiz";
  return `📂 Pasta "${result.displayName}" criada${localizacao}.\n   id: ${result.id}`;
}
