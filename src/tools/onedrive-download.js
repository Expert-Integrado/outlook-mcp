/**
 * onedrive-download.js — Gera URL temporária de download para um arquivo do OneDrive.
 *
 * Não baixa o arquivo localmente — retorna URL pré-assinada que o usuário pode abrir
 * no navegador (válida por ~1 hora). Isso evita carregar bytes na memória do MCP.
 */

import { z } from "zod";
import { graphRequest } from "../graph.js";

export const onedriveDownloadSchema = z.object({
  caminho: z
    .string()
    .optional()
    .describe(
      "Caminho do arquivo no OneDrive (ex: 'Documentos/relatorio.pdf'). Use isto OU id."
    ),
  id: z
    .string()
    .optional()
    .describe("ID do arquivo no OneDrive. Use isto OU caminho."),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

export async function onedriveDownload(params) {
  const { caminho, id } = params;
  if (!caminho && !id) {
    throw new Error("Informe `caminho` ou `id` do arquivo.");
  }

  const endpoint = id
    ? `/me/drive/items/${encodeURIComponent(id)}?$select=name,size,@microsoft.graph.downloadUrl,webUrl`
    : `/me/drive/root:/${encodeURI(normalizePath(caminho))}?$select=name,size,@microsoft.graph.downloadUrl,webUrl`;

  const item = await graphRequest("GET", endpoint);

  if (!item) throw new Error("Arquivo não encontrado.");
  if (item.folder) {
    throw new Error("O item informado é uma pasta, não um arquivo. Use a ferramenta de listar para ver o conteúdo.");
  }

  const downloadUrl = item["@microsoft.graph.downloadUrl"];
  if (!downloadUrl) {
    return `Arquivo "${item.name}" encontrado, mas o OneDrive não devolveu URL temporária. Abra direto no navegador: ${item.webUrl}`;
  }

  return (
    `📄 ${item.name}\n` +
    `Link de download (válido ~1h): ${downloadUrl}\n\n` +
    `Abrir no OneDrive: ${item.webUrl}`
  );
}
