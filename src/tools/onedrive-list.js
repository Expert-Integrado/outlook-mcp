/**
 * onedrive-list.js — Lista arquivos e pastas em um diretório do OneDrive.
 */

import { z } from "zod";
import { graphRequestPaginated } from "../graph.js";

export const onedriveListSchema = z.object({
  caminho: z
    .string()
    .optional()
    .default("")
    .describe(
      "Caminho da pasta no OneDrive (ex: 'Documentos/Projetos'). Vazio = raiz."
    ),
  quantidade: z
    .number()
    .optional()
    .default(50)
    .describe("Quantidade máxima de itens. Padrão: 50, máximo: 200."),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

function formatSize(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function onedriveList(params) {
  const caminho = normalizePath(params.caminho);
  const top = Math.min(params.quantidade ?? 50, 200);

  const endpoint = caminho
    ? `/me/drive/root:/${encodeURI(caminho)}:/children?$top=${top}&$select=id,name,size,folder,file,webUrl,lastModifiedDateTime`
    : `/me/drive/root/children?$top=${top}&$select=id,name,size,folder,file,webUrl,lastModifiedDateTime`;

  const result = await graphRequestPaginated(endpoint, top);
  const items = result?.value ?? [];

  if (items.length === 0) {
    return caminho
      ? `A pasta "${caminho}" está vazia ou não existe.`
      : "Seu OneDrive está vazio.";
  }

  const linhas = items.map((it) => {
    const tipo = it.folder ? "📁" : "📄";
    const tamanho = it.folder
      ? `${it.folder.childCount ?? 0} item(ns)`
      : formatSize(it.size);
    return `${tipo} ${it.name}  (${tamanho})  [id: ${it.id}]`;
  });

  const titulo = caminho ? `OneDrive — /${caminho}` : "OneDrive — raiz";
  return `${titulo}\n${"─".repeat(50)}\n${linhas.join("\n")}`;
}
