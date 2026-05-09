/**
 * config.js — Configurações compartilhadas do Azure / Microsoft Graph
 * Importado por graph.js, guardrails.js e pelas tools para evitar duplicação.
 *
 * Variáveis de ambiente (todas opcionais):
 *   OUTLOOK_CLIENT_ID  — Override do client ID do app Azure (default: app oficial Expert)
 *   OUTLOOK_TENANT_ID  — Override do tenant. Default "common" (multi-tenant + contas pessoais)
 *   OUTLOOK_TIMEZONE   — Fuso horário IANA usado em chamadas Graph (default: America/Sao_Paulo)
 */

import fs from "fs";
import os from "os";
import path from "path";

// CLIENT_ID e TENANT_ID NÃO são credenciais — são identificadores públicos por design no OAuth 2.0.
// É padrão da indústria embutir no código (igual ao client_id de qualquer "Login com Google").
// O que SERIA segredo é o client_secret, que NÃO usamos (Public Client Application via Device Code Flow).
export const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID ?? "b044cdc1-5c75-4c25-be87-46e51f036ae6";
export const TENANT_ID = process.env.OUTLOOK_TENANT_ID ?? "common";
export const AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`;
export const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
export const TIMEZONE = process.env.OUTLOOK_TIMEZONE ?? "America/Sao_Paulo";

export const SCOPES = [
  "Mail.Send",
  "Mail.ReadWrite",
  "MailboxSettings.Read",
  "Calendars.ReadWrite",
  "Contacts.ReadWrite",
  "People.Read",
  "Files.ReadWrite",
  "offline_access",
  "User.Read",
];

// Storage persistente fica em ~/.expertintegrado/outlook-mcp/
// Sobrevive a invalidação de cache do `npx` e a reinstalações do pacote.
const STORAGE_DIR = path.join(os.homedir(), ".expertintegrado", "outlook-mcp");
fs.mkdirSync(STORAGE_DIR, { recursive: true });

export const TOKEN_CACHE_PATH = path.join(STORAGE_DIR, "token-cache.json");
export const RATE_LIMIT_PATH = path.join(STORAGE_DIR, "rate-limit.json");

export function buildCachePlugin() {
  return {
    beforeCacheAccess: async (cacheContext) => {
      if (fs.existsSync(TOKEN_CACHE_PATH)) {
        cacheContext.tokenCache.deserialize(
          fs.readFileSync(TOKEN_CACHE_PATH, "utf-8")
        );
      }
    },
    afterCacheAccess: async (cacheContext) => {
      if (cacheContext.cacheHasChanged) {
        fs.writeFileSync(
          TOKEN_CACHE_PATH,
          cacheContext.tokenCache.serialize(),
          { mode: 0o600 }
        );
      }
    },
  };
}
