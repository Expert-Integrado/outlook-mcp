/**
 * onedrive-upload.js — Upload simples de arquivo local (<4MB) para o OneDrive.
 *
 * Para arquivos maiores, use a ferramenta `onedrive_upload_grande` (chunked).
 */

import fs from "fs";
import path from "path";
import { z } from "zod";
import { graphUpload } from "../graph.js";

const MAX_BYTES_SIMPLE = 4 * 1024 * 1024; // 4 MiB

export const onedriveUploadSchema = z.object({
  arquivo_local: z
    .string()
    .describe("Caminho absoluto do arquivo no computador do usuário."),
  destino: z
    .string()
    .describe(
      "Caminho de destino no OneDrive (ex: 'Documentos/relatorio.pdf'). Inclua o nome do arquivo."
    ),
  sobrescrever: z
    .boolean()
    .optional()
    .default(false)
    .describe("Se true, sobrescreve arquivo existente. Padrão: false (falha se já existir)."),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

export async function onedriveUpload(params) {
  const { arquivo_local, destino, sobrescrever } = params;

  if (!fs.existsSync(arquivo_local)) {
    throw new Error(`Arquivo local não encontrado: ${arquivo_local}`);
  }
  const stat = fs.statSync(arquivo_local);
  if (stat.isDirectory()) {
    throw new Error(`O caminho informado é uma pasta, não um arquivo: ${arquivo_local}`);
  }
  if (stat.size > MAX_BYTES_SIMPLE) {
    throw new Error(
      `Arquivo tem ${(stat.size / 1024 / 1024).toFixed(1)} MB e excede o limite de 4 MB do upload simples. ` +
        `Use a ferramenta \`onedrive_upload_grande\` para arquivos maiores.`
    );
  }

  const destinoNorm = normalizePath(destino);
  if (!destinoNorm || destinoNorm.endsWith("/")) {
    throw new Error("Informe o caminho completo no OneDrive incluindo o nome do arquivo.");
  }

  const conflictBehavior = sobrescrever ? "replace" : "fail";
  const endpoint = `/me/drive/root:/${encodeURI(destinoNorm)}:/content?@microsoft.graph.conflictBehavior=${conflictBehavior}`;

  const buffer = fs.readFileSync(arquivo_local);
  const result = await graphUpload("PUT", endpoint, buffer, {
    "Content-Type": "application/octet-stream",
  });

  const baseName = path.basename(arquivo_local);
  const tamanho = (stat.size / 1024).toFixed(1);
  return (
    `✅ Upload concluído: ${baseName} (${tamanho} KB)\n` +
    `Local no OneDrive: /${destinoNorm}\n` +
    (result?.webUrl ? `Abrir: ${result.webUrl}` : "")
  );
}
