/**
 * autenticar.js — Ferramenta MCP de autenticação Microsoft 365
 *
 * Substitui o antigo `node auth.js`. Usa Device Code Flow do MSAL e oferece
 * UX de duas chamadas (mantida via estado em módulo) para casar com o modelo
 * request/response síncrono do MCP:
 *
 *   Chamada 1 — sem token salvo → inicia fluxo, retorna URL + código.
 *   Chamada 2 — depois do login no navegador → confirma "autenticado como X".
 *
 * Como o servidor MCP roda em stdio e o processo persiste entre chamadas, o
 * estado em módulo (`_pendingAuth`) sobrevive ao tempo entre as duas chamadas.
 */

import fs from "fs";
import { z } from "zod";
import { PublicClientApplication } from "@azure/msal-node";
import { CLIENT_ID, AUTHORITY, SCOPES, TOKEN_CACHE_PATH, buildCachePlugin } from "../config.js";

let _pca = null;
function getPca() {
  if (!_pca) {
    _pca = new PublicClientApplication({
      auth: { clientId: CLIENT_ID, authority: AUTHORITY },
      cache: { cachePlugin: buildCachePlugin() },
    });
  }
  return _pca;
}

let _pendingAuth = null;

export const autenticarSchema = z.object({});

async function getCurrentAccountUsername() {
  if (!fs.existsSync(TOKEN_CACHE_PATH)) return null;
  try {
    const pca = getPca();
    const cache = pca.getTokenCache();
    cache.deserialize(fs.readFileSync(TOKEN_CACHE_PATH, "utf-8"));
    const accounts = await cache.getAllAccounts();
    if (!accounts || accounts.length === 0) return null;
    // Validar que o token ainda é utilizável (refresh transparente se preciso).
    await pca.acquireTokenSilent({ scopes: SCOPES, account: accounts[0] });
    return accounts[0].username;
  } catch {
    return null;
  }
}

export async function autenticar() {
  // 1) Já está autenticado e o token ainda é válido (ou refreshable)?
  const existingUser = await getCurrentAccountUsername();
  if (existingUser) {
    return (
      `✅ Você já está autenticado no Microsoft 365 como **${existingUser}**.\n\n` +
      `Se quiser trocar de conta, apague o arquivo ` +
      `\`~/.expertintegrado/outlook-mcp/token-cache.json\` e me peça para autenticar de novo.`
    );
  }

  // 2) Já existe um fluxo em andamento?
  if (_pendingAuth) {
    if (_pendingAuth.status === "success") {
      const username = _pendingAuth.username;
      _pendingAuth = null;
      return `✅ Autenticado com sucesso como **${username}**!`;
    }
    if (_pendingAuth.status === "error") {
      const errMsg = _pendingAuth.error;
      _pendingAuth = null;
      return (
        `❌ A autenticação anterior falhou: ${errMsg}\n\n` +
        `Me peça para autenticar de novo para tentar mais uma vez.`
      );
    }
    if (_pendingAuth.status === "pending") {
      return (
        `⏳ A autenticação ainda está em andamento.\n\n` +
        `1. Acesse: ${_pendingAuth.url}\n` +
        `2. Digite o código: **${_pendingAuth.code}**\n\n` +
        `Depois de concluir o login no navegador, me peça para autenticar de novo ` +
        `que eu confirmo.`
      );
    }
  }

  // 3) Inicia novo fluxo Device Code
  const pca = getPca();

  // Resolvido pelo deviceCodeCallback assim que o MSAL gera URL+código.
  let codeResolve;
  const codeReady = new Promise((resolve) => {
    codeResolve = resolve;
  });

  _pendingAuth = { status: "pending", url: null, code: null };

  pca
    .acquireTokenByDeviceCode({
      scopes: SCOPES,
      deviceCodeCallback: (info) => {
        _pendingAuth.url = info.verificationUri;
        _pendingAuth.code = info.userCode;
        codeResolve();
      },
    })
    .then((response) => {
      if (_pendingAuth) {
        _pendingAuth.status = "success";
        _pendingAuth.username = response?.account?.username ?? "(usuário Microsoft 365)";
      }
    })
    .catch((e) => {
      if (_pendingAuth) {
        _pendingAuth.status = "error";
        _pendingAuth.error = e?.message ?? String(e);
      }
    });

  // Aguarda só o disparo do callback (gera URL+código). NÃO aguarda o login completar.
  await codeReady;

  return (
    `🔐 Para autenticar no Microsoft 365:\n\n` +
    `1. Acesse: ${_pendingAuth.url}\n` +
    `2. Digite o código: **${_pendingAuth.code}**\n` +
    `3. Faça login com a conta Microsoft 365 que você quer usar\n` +
    `4. Autorize as permissões pedidas\n\n` +
    `Depois de concluir o login no navegador, me peça novamente "autenticar" ` +
    `para eu confirmar que deu certo.`
  );
}
