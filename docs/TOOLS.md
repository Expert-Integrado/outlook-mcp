# Ferramentas disponíveis

Lista completa das 29 ferramentas registradas pelo MCP. Os parâmetros completos de cada uma estão nos arquivos `src/tools/<nome>.js`.

---

## Autenticação (1)

| Ferramenta | O que faz |
|---|---|
| `autenticar` | Inicia ou conclui a autenticação Microsoft 365 via Device Code Flow. Chame na primeira vez (mostra URL+código) e depois novamente após login no navegador (confirma). Use também quando ver erro de sessão expirada. |

---

## E-mail (10)

| Ferramenta | O que faz |
|---|---|
| `enviar_email` | Envia e-mail (max 5 destinatários totais entre para+CC+CCO). Limite anti-spam: 10/h. |
| `ler_emails` | Lê e-mails da inbox, enviados ou rascunhos. Suporta filtros. |
| `responder_email` | Responde mantendo threading. Pode responder ao remetente ou a todos. |
| `encaminhar_email` | Encaminha e-mail com comentário opcional. |
| `marcar_email` | Marca como lido ou não lido. |
| `mover_email` | Move pra outra pasta. Cria pasta automaticamente se não existir. **Atenção:** o ID do e-mail muda após a movimentação — use `ler_emails` na pasta destino para obter o novo ID. |
| `baixar_anexo` | Baixa anexo de e-mail pra disco local. |
| `criar_rascunho_email` | Cria rascunho na pasta Rascunhos (não envia). |
| `listar_pastas_email` | Lista as pastas de e-mail (Inbox, Sent, etc), opcionalmente com subpastas. |
| `criar_pasta_email` | Cria pasta de e-mail (raiz ou dentro de outra). |

---

## Calendário (8)

| Ferramenta | O que faz |
|---|---|
| `criar_compromisso` | Cria evento. Aceita lista de participantes, local, descrição, online (Teams). Limite 10/h. |
| `listar_compromissos` | Lista eventos por período. |
| `atualizar_compromisso` | Atualiza título, horário, local, descrição, disponibilidade. Busca pelo título e data. |
| `deletar_compromisso` | Deleta evento (sem notificar participantes). Para cancelar avisando, use `cancelar_compromisso`. Exige `confirmacao: true`. |
| `aceitar_evento` | Aceita convite recebido. Pode incluir comentário pro organizador. |
| `recusar_evento` | Recusa convite. Pode propor horário alternativo via `proposta_horario` + `proposta_duracao_minutos`. |
| `cancelar_compromisso` | Cancela evento que VOCÊ organizou e notifica os participantes. Diferente de `deletar`. |
| `verificar_disponibilidade` | Encontra horários livres em comum entre múltiplas pessoas (findMeetingTimes API). |

---

## Contatos (2)

| Ferramenta | O que faz |
|---|---|
| `buscar_contato` | Busca pelo nome no diretório Microsoft 365 (People API). Retorna e-mail, cargo, telefone. |
| `criar_contato` | Cria contato pessoal com nome, e-mail, telefone, empresa, cargo. |

---

## OneDrive (8)

| Ferramenta | O que faz |
|---|---|
| `onedrive_listar` | Lista arquivos e pastas em um diretório (vazio = raiz). |
| `onedrive_buscar` | Busca arquivos por nome ou conteúdo (full-text Microsoft Graph). |
| `onedrive_download` | Gera URL temporária (~1h) de download. Não baixa pra disco. |
| `onedrive_upload` | Upload de arquivo local pequeno (<4MB). |
| `onedrive_upload_grande` | Upload em chunks de 5MB para arquivos grandes (>4MB). |
| `onedrive_compartilhar` | Cria link de compartilhamento (view/edit, escopo organization/anonymous). |
| `onedrive_criar_pasta` | Cria pasta no OneDrive. |
| `onedrive_deletar` | Move pra Lixeira (recuperável 30 dias). Exige `confirmacao: true`. |

---

## Guardrails ativos

- **Rate limit anti-spam**: máximo 10 e-mails enviados / 10 eventos criados por hora. Acima disso, exige `confirmacao: true` na chamada.
- **Limite de destinatários**: para + CC + CCO ≤ 5 endereços (em `enviar_email` e `criar_rascunho_email`).
- **Eventos não recorrentes**: `criar_compromisso` e `atualizar_compromisso` rejeitam payloads com `recurrence` ou `seriesMasterId`.
- **Operações destrutivas exigem confirmação**: `deletar_compromisso`, `onedrive_deletar`.
