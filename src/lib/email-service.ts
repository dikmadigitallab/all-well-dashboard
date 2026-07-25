/**
 * Serviço de busca de emails via IMAP.
 * Server-side apenas.
 */
import { ImapFlow } from "imapflow";
import { decryptPassword } from "./email-crypto";

export interface EmailSearchParams {
  host: string;
  port: number;
  email: string;
  password: string;
  folder?: string;
  searchTerm?: string | null;
  senderFilter?: string | null;
}

export interface EmailResult {
  id: number;
  subject: string;
  from: string;
  date: string;
  text: string;
  html: string | null;
}

export interface SearchResult {
  success: boolean;
  emails: EmailResult[];
  error?: string;
  debug?: Record<string, unknown>;
}

/**
 * Conecta ao servidor IMAP, busca emails não lidos que correspondem
 * aos filtros (termo e/ou remetente) e retorna os resultados.
 */
export async function searchEmails(params: EmailSearchParams): Promise<SearchResult> {
  const client = new ImapFlow({
    host: params.host,
    port: params.port,
    secure: params.port === 993,
    auth: {
      user: params.email,
      pass: params.password,
    },
    logger: false,
    connectionTimeout: 20000,
    authTimeout: 15000,
  });

  const debug: Record<string, unknown> = {};

  try {
    await client.connect();
    debug.connected = true;

    // Abre a mailbox (pasta)
    const mailboxName = params.folder || "INBOX";
    const lock = await client.getMailboxLock(mailboxName);
    debug.mailbox = mailboxName;

    try {
      // --- PASSO 1: Buscar UIDs não lidos ---
      // Primeiro, busca só os não lidos (sem filtros adicionais)
      const unseenQuery: Record<string, unknown> = { seen: false };
      debug.unseenQuery = unseenQuery;

      const unseenUids = await client.search(unseenQuery);
      debug.unseenUidsCount = unseenUids.length;
      debug.unseenUids = unseenUids.slice(0, 20);

      if (unseenUids.length === 0) {
        // Tenta buscar TUDO (inclusive lidos) pra ver se há emails na caixa
        const allUids = await client.search({ uid: true });
        debug.allUidsCount = allUids.length;

        return {
          success: true,
          emails: [],
          debug,
        };
      }

      // --- PASSO 2: Se tem filtros, refina a busca ---
      let targetUids = unseenUids;

      if (params.searchTerm || params.senderFilter) {
        // Monta query de busca com filtros
        const filterQuery: string[] = ["UNSEEN"];

        if (params.searchTerm) {
          // Escapa aspas no termo
          const term = params.searchTerm.replace(/"/g, '\\"');
          filterQuery.push(`(OR SUBJECT "${term}" BODY "${term}")`);
        }

        if (params.senderFilter) {
          const sender = params.senderFilter.replace(/"/g, '\\"');
          filterQuery.push(`FROM "${sender}"`);
        }

        const filterStr = filterQuery.join(" ");
        debug.filterString = filterStr;

        try {
          // Tenta busca com string IMAP nativa
          const filteredUids = await client.search(filterStr);
          debug.filteredUidsCount = filteredUids.length;
          debug.filteredUids = filteredUids.slice(0, 20);
          targetUids = filteredUids;
        } catch (searchErr) {
          debug.filterSearchError = String(searchErr);
          // Fallback: usa unseen e filtra manualmente depois
          targetUids = unseenUids;
        }
      }

      if (targetUids.length === 0) {
        return { success: true, emails: [], debug };
      }

      // --- PASSO 3: Buscar detalhes das mensagens ---
      const results: EmailResult[] = [];

      for await (const msg of client.fetch(
        { uid: targetUids },
        {
          uid: true,
          envelope: true,
          source: true,
          bodyStructure: true,
          labels: true,
        },
      )) {
        // Extrai conteúdo do source (raw)
        let textContent = "";
        let htmlContent: string | null = null;

        if (msg.source) {
          const raw = msg.source.toString();
          // Separa headers do body
          const headerEnd = raw.indexOf("\n\n");
          const body = headerEnd >= 0 ? raw.slice(headerEnd + 2) : raw;

          textContent = body
            .replace(/<[^>]+>/g, "") // remove tags HTML
            .replace(/\r?\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          // Se tem tags HTML, guarda versão HTML também
          if (/<html|<HTML|<div|<p|<br/i.test(body)) {
            htmlContent = body.trim();
          }
        }

        const fromAddr = msg.envelope?.from?.[0];
        const from = fromAddr
          ? `${fromAddr.name || ""} <${fromAddr.address || ""}>`.trim()
          : "desconhecido";

        const subject = msg.envelope?.subject || "(sem assunto)";

        // Filtro manual por termo (reforço)
        if (params.searchTerm) {
          const term = params.searchTerm.toLowerCase();
          const match =
            subject.toLowerCase().includes(term) || textContent.toLowerCase().includes(term);
          if (!match) continue;
        }

        // Filtro manual por remetente (reforço)
        if (params.senderFilter) {
          const filter = params.senderFilter.toLowerCase();
          if (!from.toLowerCase().includes(filter)) continue;
        }

        results.push({
          id: msg.uid,
          subject,
          from,
          date: msg.envelope?.date?.toISOString() || new Date().toISOString(),
          text: textContent.slice(0, 5000),
          html: htmlContent?.slice(0, 10000) ?? null,
        });
      }

      debug.resultsCount = results.length;

      return { success: true, emails: results, debug };
    } finally {
      lock.release();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao conectar IMAP";
    console.error("[email-service] search error:", message);
    return { success: false, emails: [], error: message, debug };
  } finally {
    try {
      await client.logout();
    } catch {
      // Ignora erro no logout
    }
  }
}

/**
 * Função de alto nível: busca as configurações do banco, descriptografa
 * a senha e executa a busca.
 */
export async function searchWithConfig(config: {
  email_address: string;
  email_password_enc: string;
  imap_host: string;
  imap_port: number;
  search_term: string | null;
  sender_filter: string | null;
  folder: string;
}): Promise<SearchResult> {
  const password = decryptPassword(config.email_password_enc);

  return searchEmails({
    host: config.imap_host,
    port: config.imap_port,
    email: config.email_address,
    password,
    folder: config.folder,
    searchTerm: config.search_term,
    senderFilter: config.sender_filter,
  });
}
