/**
 * onedrive-search.js — Busca arquivos no OneDrive por nome/conteúdo.
 */

import { z } from "zod";
import { graphRequestPaginated } from "../graph.js";

export const onedriveSearchSchema = z.object({
  consulta: z
    .string()
    .min(1)
    .describe(
      "Termo a buscar no OneDrive (nome de arquivo, conteúdo, autor — Microsoft Graph faz a busca full-text)."
    ),
  quantidade: z
    .number()
    .optional()
    .default(20)
    .describe("Quantidade máxima de resultados. Padrão: 20, máximo: 100."),
});

function formatSize(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function onedriveSearch(params) {
  const { consulta } = params;
  const top = Math.min(params.quantidade ?? 20, 100);
  const q = encodeURIComponent(`'${consulta.replace(/'/g, "''")}'`);
  const endpoint = `/me/drive/root/search(q=${q})?$top=${top}&$select=id,name,size,folder,file,webUrl,lastModifiedDateTime,parentReference`;

  const result = await graphRequestPaginated(endpoint, top);
  const items = result?.value ?? [];

  if (items.length === 0) {
    return `Nenhum arquivo encontrado para "${consulta}".`;
  }

  const linhas = items.map((it, i) => {
    const tipo = it.folder ? "📁" : "📄";
    const tamanho = it.folder ? "(pasta)" : formatSize(it.size);
    const localizacao = it.parentReference?.path
      ? it.parentReference.path.replace("/drive/root:", "") || "/"
      : "";
    return `${i + 1}. ${tipo} ${it.name}  ${tamanho}\n   Local: ${localizacao || "(raiz)"}\n   id: ${it.id}`;
  });

  return `Resultados para "${consulta}":\n${"─".repeat(50)}\n${linhas.join("\n\n")}`;
}
