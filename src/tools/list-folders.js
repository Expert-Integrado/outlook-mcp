/**
 * list-folders.js — Lista as pastas de e-mail (mailFolders) do usuário.
 */

import { z } from "zod";
import { graphRequestPaginated } from "../graph.js";

export const listFoldersSchema = z.object({
  incluir_subpastas: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Se true, lista também as subpastas em árvore. Se false, lista só as pastas raiz (Inbox, Drafts, Sent, etc)."
    ),
  quantidade: z
    .number()
    .optional()
    .default(50)
    .describe("Quantidade máxima de pastas. Padrão: 50."),
});

export async function listFolders(params) {
  const { incluir_subpastas, quantidade } = params;
  const top = Math.min(quantidade, 200);

  const baseEndpoint = `/me/mailFolders?$top=${top}&$select=id,displayName,totalItemCount,unreadItemCount,parentFolderId`;
  const result = await graphRequestPaginated(baseEndpoint, top);
  let pastas = result?.value ?? [];

  if (incluir_subpastas) {
    // Para cada pasta com filhos, busca as subpastas (1 nível). Não recursivo profundo
    // pra não estourar quota — se o usuário tiver subpastas em 5+ níveis, vê só 2.
    const com_filhos = pastas.filter((p) => p.childFolderCount > 0).slice(0, 20);
    for (const pai of com_filhos) {
      try {
        const sub = await graphRequestPaginated(
          `/me/mailFolders/${encodeURIComponent(pai.id)}/childFolders?$top=50&$select=id,displayName,totalItemCount,unreadItemCount,parentFolderId`,
          50
        );
        if (sub?.value?.length) {
          pastas.push(...sub.value.map((s) => ({ ...s, _parent_name: pai.displayName })));
        }
      } catch {
        // ignora falhas de subpastas individuais
      }
    }
  }

  if (pastas.length === 0) return "Nenhuma pasta de e-mail encontrada.";

  const linhas = pastas.map((p) => {
    const total = p.totalItemCount ?? 0;
    const naoLidos = p.unreadItemCount ?? 0;
    const prefix = p._parent_name ? `  └─ ${p._parent_name} > ` : "📂 ";
    return `${prefix}${p.displayName}  (${total} total, ${naoLidos} não lidos)\n   id: ${p.id}`;
  });

  return `Pastas de e-mail:\n${"─".repeat(50)}\n${linhas.join("\n")}`;
}
