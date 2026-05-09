/**
 * onedrive-upload-large.js — Upload em chunks (>4MB) usando upload session do Graph.
 *
 * Cria sessão de upload, fatia o arquivo em chunks de 5 MiB e envia sequencialmente.
 * Recomendado pra arquivos entre 4MB e ~250MB. Acima disso considere mover via web.
 */

import fs from "fs";
import path from "path";
import { z } from "zod";
import { graphRequest, graphUpload } from "../graph.js";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MiB (precisa ser múltiplo de 320 KiB; 5MB satisfaz)

export const onedriveUploadLargeSchema = z.object({
  arquivo_local: z
    .string()
    .describe("Caminho absoluto do arquivo no computador do usuário."),
  destino: z
    .string()
    .describe(
      "Caminho de destino no OneDrive (ex: 'Backups/video.mp4'). Inclua o nome do arquivo."
    ),
  sobrescrever: z
    .boolean()
    .optional()
    .default(false)
    .describe("Se true, sobrescreve arquivo existente. Padrão: false."),
});

function normalizePath(p) {
  return (p ?? "").replace(/^\/+|\/+$/g, "").trim();
}

export async function onedriveUploadLarge(params) {
  const { arquivo_local, destino, sobrescrever } = params;

  if (!fs.existsSync(arquivo_local)) {
    throw new Error(`Arquivo local não encontrado: ${arquivo_local}`);
  }
  const stat = fs.statSync(arquivo_local);
  if (stat.isDirectory()) {
    throw new Error(`O caminho informado é uma pasta, não um arquivo: ${arquivo_local}`);
  }
  const totalSize = stat.size;

  const destinoNorm = normalizePath(destino);
  if (!destinoNorm || destinoNorm.endsWith("/")) {
    throw new Error("Informe o caminho completo no OneDrive incluindo o nome do arquivo.");
  }

  // 1) Cria upload session
  const session = await graphRequest(
    "POST",
    `/me/drive/root:/${encodeURI(destinoNorm)}:/createUploadSession`,
    {
      item: {
        "@microsoft.graph.conflictBehavior": sobrescrever ? "replace" : "fail",
        name: path.basename(destinoNorm),
      },
    }
  );

  if (!session?.uploadUrl) {
    throw new Error("OneDrive não retornou URL de upload session.");
  }

  // 2) Envia chunks sequenciais
  const fd = fs.openSync(arquivo_local, "r");
  let result = null;
  try {
    let offset = 0;
    const buffer = Buffer.alloc(CHUNK_SIZE);
    while (offset < totalSize) {
      const remaining = totalSize - offset;
      const thisChunk = Math.min(CHUNK_SIZE, remaining);
      const slice = thisChunk === CHUNK_SIZE ? buffer : Buffer.alloc(thisChunk);
      fs.readSync(fd, slice, 0, thisChunk, offset);

      const start = offset;
      const end = offset + thisChunk - 1;
      const headers = {
        "Content-Length": String(thisChunk),
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Content-Type": "application/octet-stream",
      };

      // graphUpload aceita URL completa quando começa com https://
      result = await graphUpload("PUT", session.uploadUrl, slice, headers);
      offset += thisChunk;
    }
  } finally {
    fs.closeSync(fd);
  }

  const baseName = path.basename(arquivo_local);
  const tamanhoMb = (totalSize / 1024 / 1024).toFixed(1);
  return (
    `✅ Upload em chunks concluído: ${baseName} (${tamanhoMb} MB)\n` +
    `Local no OneDrive: /${destinoNorm}\n` +
    (result?.webUrl ? `Abrir: ${result.webUrl}` : "")
  );
}
