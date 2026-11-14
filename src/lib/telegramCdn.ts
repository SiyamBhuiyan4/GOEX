import { useEffect, useState } from "react";

/*
  Telegram channel used as a file CDN (verification documents, photos).

  Optimisations:
  - Resolved download links are cached in memory AND in localStorage, so a
    page reload does not hit Telegram's getFile again until the link expires.
  - Concurrent lookups for the same file share one request.
  - Photos are resized/compressed in the browser before upload (PDFs untouched).
  - Uploads skip the extra getFile round trip: the caller gets a local preview.
  - Requests retry on Telegram rate limits (429 retry_after) and network blips.
*/

export const TELEGRAM_BOT_TOKEN: string =
  (import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined) || "8819171458:AAHd3_pjEj2tEYfuB1zgJkznnSqPsisB6p0";
export const TELEGRAM_CHAT_ID: string =
  (import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined) || "-1004253971473";
export const TELEGRAM_PREFIX = "tg:";
export const CACHE_TTL_MS = 50 * 60 * 1000; // Telegram file links live ~1 hour

const API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const FILE_BASE = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/`;
const STORAGE_KEY = "goex.tgcdn.v1";
const MAX_PERSISTED = 300;

/** Photos larger than this (bytes) or wider/taller than MAX_DIM get compressed. */
const COMPRESS_OVER_BYTES = 350 * 1024;
const MAX_DIM = 1600;
const JPEG_QUALITY = 0.82;

export interface TelegramUploadResult {
  fileId: string;
  /** Local object URL for an instant preview (images only); revoke it when done. */
  url: string;
  storageId: string;
}

export interface CachedFileUrl {
  url: string;
  expiresAt: number;
}

const urlCache = new Map<string, CachedFileUrl>();
const inFlightRequests = new Map<string, Promise<string>>();
const urlToFileId = new Map<string, string>();

/* ---------------- persistent cache */

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const now = Date.now();
    const entries = JSON.parse(raw) as [string, CachedFileUrl][];
    for (const [id, entry] of entries) {
      if (entry && typeof entry.url === "string" && entry.expiresAt > now) {
        urlCache.set(id, entry);
        urlToFileId.set(entry.url, id);
      }
    }
  } catch {
    /* storage unavailable or corrupt: memory cache still works */
  }
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = undefined;
    try {
      const now = Date.now();
      const live = [...urlCache.entries()].filter(([, e]) => e.expiresAt > now).slice(-MAX_PERSISTED);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(live));
    } catch {
      /* ignore quota / private mode */
    }
  }, 300);
}

function remember(fileId: string, url: string) {
  urlCache.set(fileId, { url, expiresAt: Date.now() + CACHE_TTL_MS });
  urlToFileId.set(url, fileId);
  schedulePersist();
}

if (typeof window !== "undefined") loadPersisted();

/* ---------------- identifiers */

function stripPrefix(id: string) {
  return id.startsWith(TELEGRAM_PREFIX) ? id.slice(TELEGRAM_PREFIX.length) : id;
}

/** Formats a raw Telegram file_id into a unified storage identifier: "tg:<fileId>" */
export function formatTelegramIdentifier(fileId: string): string {
  if (!fileId) return "";
  return fileId.startsWith(TELEGRAM_PREFIX) ? fileId : `${TELEGRAM_PREFIX}${fileId}`;
}

const RAW_ID_PREFIXES = ["BQAC", "AgAC", "BAAC", "CQAC", "AwAC"];

/** Checks if a given string is a Telegram storage identifier, raw file_id or Telegram file URL. */
export function isTelegramIdentifier(identifierOrUrl: string): boolean {
  if (!identifierOrUrl || typeof identifierOrUrl !== "string") return false;
  const s = identifierOrUrl.trim();
  return s.startsWith(TELEGRAM_PREFIX) || RAW_ID_PREFIXES.some((p) => s.startsWith(p)) || s.includes("api.telegram.org/file/bot");
}

/** Extracts a clean Telegram fileId from an identifier or a known Telegram URL. */
export function extractTelegramFileId(identifierOrUrl: string): string | null {
  if (!identifierOrUrl || typeof identifierOrUrl !== "string") return null;
  const s = identifierOrUrl.trim();
  if (s.startsWith(TELEGRAM_PREFIX)) return s.slice(TELEGRAM_PREFIX.length);
  if (RAW_ID_PREFIXES.some((p) => s.startsWith(p))) return s;
  return urlToFileId.get(s) ?? null;
}

/** Synchronously returns a cached, unexpired Telegram URL if available. */
export function getCachedTelegramUrl(fileId: string): string | null {
  const entry = urlCache.get(stripPrefix(fileId));
  return entry && Date.now() < entry.expiresAt ? entry.url : null;
}

/** Clears both the memory and the persisted CDN cache. */
export function clearTelegramCdnCache(): void {
  urlCache.clear();
  inFlightRequests.clear();
  urlToFileId.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------------- network */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fetch + JSON with retries on 429 (honouring retry_after), 5xx and network errors. */
async function telegramCall<T>(url: string, init?: RequestInit, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; result?: T; description?: string; parameters?: { retry_after?: number } }
        | null;
      if (res.ok && data?.ok) return data.result as T;
      if (res.status === 429 || res.status >= 500) {
        const wait = (data?.parameters?.retry_after ?? 2 ** i) * 1000;
        lastErr = new Error(data?.description || `Telegram error ${res.status}`);
        await sleep(Math.min(wait, 10_000));
        continue;
      }
      throw new Error(data?.description || `Telegram error ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (err instanceof TypeError && i < attempts - 1) {
        await sleep(500 * 2 ** i); // network failure
        continue;
      }
      if (!(err instanceof TypeError)) throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Telegram request failed");
}

/**
 * Fetches the live download URL for a Telegram file_id.
 * Cached (memory + localStorage), deduplicated, falls back to a stale URL on failure.
 */
export async function getTelegramFileUrl(fileId: string): Promise<string> {
  if (!fileId || typeof fileId !== "string") throw new Error("Invalid Telegram fileId provided");
  const cleanId = stripPrefix(fileId);

  const cached = urlCache.get(cleanId);
  if (cached && Date.now() < cached.expiresAt) return cached.url;

  const pending = inFlightRequests.get(cleanId);
  if (pending) return pending;

  const p = (async () => {
    try {
      const result = await telegramCall<{ file_path?: string }>(`${API}/getFile?file_id=${encodeURIComponent(cleanId)}`);
      if (!result?.file_path) throw new Error("Telegram did not return a valid file_path");
      const url = FILE_BASE + result.file_path;
      remember(cleanId, url);
      return url;
    } catch (err) {
      if (cached?.url) {
        console.warn(`[telegramCdn] getFile failed for ${cleanId}, using stale URL`, err);
        return cached.url;
      }
      throw err;
    } finally {
      inFlightRequests.delete(cleanId);
    }
  })();

  inFlightRequests.set(cleanId, p);
  return p;
}

/** True for values that need no Telegram lookup (local, data, or non-Telegram http URLs). */
function isPassThrough(s: string) {
  return (
    s.startsWith("blob:") ||
    s.startsWith("data:") ||
    s.startsWith("/") ||
    ((s.startsWith("http://") || s.startsWith("https://")) && !s.includes("api.telegram.org/file/bot"))
  );
}

/**
 * Resolves any media identifier or URL into a live URL.
 * Non-Telegram URLs pass through; Telegram ids/URLs are resolved via the cache.
 */
export async function resolveMediaUrl(identifierOrUrl: string, fallbackUrl?: string): Promise<string> {
  if (!identifierOrUrl || typeof identifierOrUrl !== "string") return fallbackUrl ?? "";
  const s = identifierOrUrl.trim();
  if (!s) return fallbackUrl ?? "";
  if (isPassThrough(s)) return s;

  const fileId = extractTelegramFileId(s);
  if (!fileId) return s.startsWith("http") ? s : fallbackUrl ?? s;
  try {
    return await getTelegramFileUrl(fileId);
  } catch (err) {
    console.warn(`[telegramCdn] Failed to resolve ${s}`, err);
    return s.startsWith("http") ? s : fallbackUrl ?? s;
  }
}

/** Resolves several identifiers in parallel (duplicates share one request). */
export async function resolveMediaUrls(identifiers: string[], fallbackUrl?: string): Promise<string[]> {
  return Promise.all(identifiers.map((id) => resolveMediaUrl(id, fallbackUrl)));
}

/* ---------------- upload */

/** Downscales and re-encodes large photos in the browser. Returns the original on any failure. */
export async function compressImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= COMPRESS_OVER_BYTES) {
      bitmap.close();
      return file;
    }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // PNG transparency → white for JPEG
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

/**
 * Uploads a file to the Telegram CDN channel.
 * Photos are compressed first. No extra getFile call: `url` is a local object
 * URL for previews (images) — the permanent reference is `storageId` ("tg:<id>").
 */
export async function uploadToTelegramCdn(file: File): Promise<TelegramUploadResult> {
  const toSend = await compressImage(file);
  const form = new FormData();
  form.append("chat_id", TELEGRAM_CHAT_ID);
  form.append("document", toSend, toSend.name);
  form.append("disable_notification", "true");

  const result = await telegramCall<{ document?: { file_id: string } }>(`${API}/sendDocument`, {
    method: "POST",
    body: form,
  });
  const fileId = result?.document?.file_id;
  if (!fileId) throw new Error("Telegram CDN did not return a file_id");

  const url = toSend.type.startsWith("image/") ? URL.createObjectURL(toSend) : "";
  return { fileId, url, storageId: formatTelegramIdentifier(fileId) };
}

/* ---------------- React */

function initialUrl(identifierOrUrl?: string | null, fallbackUrl?: string): string | null {
  if (!identifierOrUrl) return fallbackUrl ?? null;
  const s = identifierOrUrl.trim();
  if (isPassThrough(s)) return s;
  const fileId = extractTelegramFileId(s);
  return fileId ? getCachedTelegramUrl(fileId) : null;
}

/** Resolves a media identifier (e.g. "tg:<fileId>") to a live URL; instant when cached. */
export function useResolvedMediaUrl(identifierOrUrl?: string | null, fallbackUrl?: string) {
  const [url, setUrl] = useState<string | null>(() => initialUrl(identifierOrUrl, fallbackUrl));
  const [loading, setLoading] = useState<boolean>(!url && !!identifierOrUrl);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const instant = initialUrl(identifierOrUrl, fallbackUrl);
    if (!identifierOrUrl || instant) {
      setUrl(instant);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    resolveMediaUrl(identifierOrUrl, fallbackUrl)
      .then((resolved) => {
        if (active) {
          setUrl(resolved);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setUrl(fallbackUrl ?? identifierOrUrl);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [identifierOrUrl, fallbackUrl]);

  return { url, loading, error };
}
