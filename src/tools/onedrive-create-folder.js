/**
 * onedrive-create-folder.js — Cria pasta no OneDrive.
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";

export const onedriveCreateFolderSchema = z.object({
  caminho_pai: z
    .string()
    .optional()
    .default("")
    .describe(
      "Caminho da pasta pai no OneDrive (ex: 'Documentos'). Vazio = raiz."
    ),
  nome: z
    .string()
    .min(1)
    .describe("Nome da nova pasta."),
  comportamento_conflito: z
    .enum(["fail", "replace", "rename"])
    .optional()
    .default("fail")
    .describe(
      "O que fazer se já existir pasta com esse nome: 'fail' (recomendado), 'replace' (sobrescreve), 'rename' (cria com nome único)."
    ),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

export async function onedriveCreateFolder(params) {
  const { caminho_pai, nome, comportamento_conflito } = params;
  const paiNorm = normalizePath(caminho_pai);

  const endpoint = paiNorm
    ? `/me/drive/root:/${encodeURI(paiNorm)}:/children`
    : `/me/drive/root/children`;

  const result = await graphRequest("POST", endpoint, {
    name: nome,
    folder: {},
    "@microsoft.graph.conflictBehavior": comportamento_conflito,
  });

  const localizacao = paiNorm ? `/${paiNorm}/${result.name}` : `/${result.name}`;
  return (
    `📁 Pasta criada: ${result.name}\n` +
    `Local: ${localizacao}\n` +
    (result?.webUrl ? `Abrir: ${result.webUrl}` : "") +
    `\nID: ${result.id}`
  );
}
