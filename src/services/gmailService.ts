/**
 * Client-side Gmail REST API v1 service.
 * Uses strictly in-memory OAuth access tokens passed via Authorization Bearer header.
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export class GmailApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GmailApiError';
    this.status = status;
  }
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId?: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  isUnread: boolean;
  isStarred: boolean;
}

export interface GmailMessageAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
}

export interface GmailMessageDetail extends GmailMessageSummary {
  messageIdHeader?: string;
  referencesHeader?: string;
  textBody: string;
  htmlBody: string;
  attachments: GmailMessageAttachment[];
}

export interface GmailVacationSettings {
  enableAutoReply: boolean;
  responseSubject?: string;
  responseBodyPlainText?: string;
  responseBodyHtml?: string;
  restrictToContacts?: boolean;
  restrictToDomain?: boolean;
}

interface GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Array<{ name: string; value: string }>;
  body?: {
    attachmentId?: string;
    size?: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

interface RawGmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
}

function decodeBase64UrlUtf8(data?: string): string {
  if (!data) return '';
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function encodeBase64UrlUtf8(str: string): string {
  return encodeBase64Utf8(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function encodeRfc2047Subject(subject: string): string {
  // Encode non-ASCII subjects safely using RFC 2047 UTF-8 Base64
  if (/^[\x20-\x7E]*$/.test(subject)) {
    return subject;
  }
  return `=?UTF-8?B?${encodeBase64Utf8(subject)}?=`;
}

function getHeader(
  headers: Array<{ name: string; value: string }> | undefined,
  name: string
): string {
  if (!headers) return '';
  const target = name.toLowerCase();
  const found = headers.find((h) => h.name.toLowerCase() === target);
  return found?.value ?? '';
}

function extractMessageBodies(
  part: GmailMessagePart | undefined,
  acc: { text: string[]; html: string[]; attachments: GmailMessageAttachment[] }
) {
  if (!part) return;
  const mime = (part.mimeType || '').toLowerCase();
  const filename = part.filename || '';

  if (filename && part.body) {
    acc.attachments.push({
      filename,
      mimeType: part.mimeType || 'application/octet-stream',
      size: part.body.size || 0,
      attachmentId: part.body.attachmentId,
    });
  } else if (mime === 'text/plain' && part.body?.data) {
    acc.text.push(decodeBase64UrlUtf8(part.body.data));
  } else if (mime === 'text/html' && part.body?.data) {
    acc.html.push(decodeBase64UrlUtf8(part.body.data));
  }

  if (part.parts && part.parts.length > 0) {
    for (const child of part.parts) {
      extractMessageBodies(child, acc);
    }
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function toMessageSummary(raw: RawGmailMessage): GmailMessageSummary {
  const headers = raw.payload?.headers;
  const labelIds = raw.labelIds ?? [];
  return {
    id: raw.id,
    threadId: raw.threadId,
    labelIds,
    snippet: decodeHtmlEntities(raw.snippet || ''),
    internalDate: raw.internalDate || '',
    subject: getHeader(headers, 'Subject') || '(No Subject)',
    from: getHeader(headers, 'From') || 'Unknown Sender',
    to: getHeader(headers, 'To') || '',
    date: getHeader(headers, 'Date') || '',
    isUnread: labelIds.includes('UNREAD'),
    isStarred: labelIds.includes('STARRED'),
  };
}

async function gmailFetch<T>(
  accessToken: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    let errMessage = `Gmail request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMessage = errJson.error.message;
      }
    } catch {
      // ignore json parse failure
    }
    throw new GmailApiError(errMessage, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  return gmailFetch<GmailProfile>(accessToken, '/profile');
}

export async function listGmailLabels(accessToken: string): Promise<GmailLabel[]> {
  const data = await gmailFetch<{ labels?: GmailLabel[] }>(accessToken, '/labels');
  return data.labels || [];
}

export async function createGmailLabel(accessToken: string, name: string): Promise<GmailLabel> {
  return gmailFetch<GmailLabel>(accessToken, '/labels', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show',
    }),
  });
}

export async function listGmailMessages(
  accessToken: string,
  options: {
    labelId?: string;
    query?: string;
    maxResults?: number;
    pageToken?: string;
  } = {}
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate?: number }> {
  const params = new URLSearchParams();
  params.set('maxResults', String(options.maxResults ?? 15));
  if (options.labelId && options.labelId !== 'ALL') {
    params.set('labelIds', options.labelId);
  }
  if (options.query && options.query.trim()) {
    params.set('q', options.query.trim());
  }
  if (options.pageToken) {
    params.set('pageToken', options.pageToken);
  }

  const listData = await gmailFetch<{
    messages?: Array<{ id: string; threadId: string }>;
    nextPageToken?: string;
    resultSizeEstimate?: number;
  }>(accessToken, `/messages?${params.toString()}`);

  const ids = listData.messages || [];
  if (ids.length === 0) {
    return {
      messages: [],
      nextPageToken: listData.nextPageToken,
      resultSizeEstimate: listData.resultSizeEstimate,
    };
  }

  const metadataParams = new URLSearchParams();
  metadataParams.set('format', 'metadata');
  metadataParams.append('metadataHeaders', 'Subject');
  metadataParams.append('metadataHeaders', 'From');
  metadataParams.append('metadataHeaders', 'To');
  metadataParams.append('metadataHeaders', 'Date');

  const details = await Promise.all(
    ids.map((m) =>
      gmailFetch<RawGmailMessage>(accessToken, `/messages/${m.id}?${metadataParams.toString()}`)
    )
  );

  return {
    messages: details.map(toMessageSummary),
    nextPageToken: listData.nextPageToken,
    resultSizeEstimate: listData.resultSizeEstimate,
  };
}

export async function getGmailMessageDetail(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetail> {
  const raw = await gmailFetch<RawGmailMessage>(
    accessToken,
    `/messages/${messageId}?format=full`
  );
  const summary = toMessageSummary(raw);
  const acc = { text: [] as string[], html: [] as string[], attachments: [] as GmailMessageAttachment[] };
  extractMessageBodies(raw.payload, acc);

  return {
    ...summary,
    messageIdHeader: getHeader(raw.payload?.headers, 'Message-ID') || undefined,
    referencesHeader: getHeader(raw.payload?.headers, 'References') || undefined,
    textBody: acc.text.join('\n\n'),
    htmlBody: acc.html.join('\n'),
    attachments: acc.attachments,
  };
}

function buildRawRfc2822Message(params: {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const headers: string[] = [
    `To: ${params.to.trim()}`,
    `Subject: ${encodeRfc2047Subject(params.subject.trim())}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ];
  if (params.inReplyTo) {
    headers.push(`In-Reply-To: ${params.inReplyTo}`);
  }
  if (params.references) {
    headers.push(`References: ${params.references}`);
  }
  const mimeMessage = `${headers.join('\r\n')}\r\n\r\n${params.body}`;
  return encodeBase64UrlUtf8(mimeMessage);
}

export async function sendGmailMessage(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
    inReplyTo?: string;
    references?: string;
  }
): Promise<{ id: string; threadId: string }> {
  const raw = buildRawRfc2822Message(params);
  return gmailFetch<{ id: string; threadId: string }>(accessToken, '/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      raw,
      ...(params.threadId ? { threadId: params.threadId } : {}),
    }),
  });
}

export async function createGmailDraft(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  }
): Promise<{ id: string }> {
  const raw = buildRawRfc2822Message(params);
  return gmailFetch<{ id: string }>(accessToken, '/drafts', {
    method: 'POST',
    body: JSON.stringify({
      message: {
        raw,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      },
    }),
  });
}

export async function modifyGmailMessageLabels(
  accessToken: string,
  messageId: string,
  changes: { addLabelIds?: string[]; removeLabelIds?: string[] }
): Promise<void> {
  await gmailFetch(accessToken, `/messages/${messageId}/modify`, {
    method: 'POST',
    body: JSON.stringify(changes),
  });
}

export async function trashGmailMessage(accessToken: string, messageId: string): Promise<void> {
  await gmailFetch(accessToken, `/messages/${messageId}/trash`, {
    method: 'POST',
  });
}

export async function deleteGmailMessage(accessToken: string, messageId: string): Promise<void> {
  await gmailFetch(accessToken, `/messages/${messageId}`, {
    method: 'DELETE',
  });
}

export async function getGmailVacationSettings(
  accessToken: string
): Promise<GmailVacationSettings> {
  return gmailFetch<GmailVacationSettings>(accessToken, '/settings/vacation');
}

export async function updateGmailVacationSettings(
  accessToken: string,
  settings: GmailVacationSettings
): Promise<GmailVacationSettings> {
  return gmailFetch<GmailVacationSettings>(accessToken, '/settings/vacation', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
