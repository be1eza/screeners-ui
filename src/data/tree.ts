import { treeUrl, rawUrl } from '@/config';
import type { VaultFile } from '@/types';

type GitTreeEntry = { path: string; type: string; size?: number };
type GitTreeResponse = { tree?: GitTreeEntry[]; truncated?: boolean; message?: string };

const DATED_SNAPSHOT_RE = /^raw\/[^/]+\/\d{4}\/\d{4}-\d{2}-\d{2}\.csv$/;
const RAW_CACHE_LIMIT = 256;

/** Immutable dated snapshots get a bounded, disposable session cache. */
const rawTextCache = new Map<string, Promise<string>>();
let treeRequest: Promise<VaultFile[]> | null = null;

/**
 * Enumerate every file in the vault with ONE git-tree API call (recursive).
 * Blobs only. Throws on a non-OK response or a truncated tree (the vault is far
 * below GitHub's 100k-entry truncation limit, so truncation means something broke).
 */
export async function fetchTree(): Promise<VaultFile[]> {
  if (treeRequest) return treeRequest;

  const request = fetch(treeUrl()).then(async (res) => {
    if (!res.ok) {
      throw new Error(`git-tree fetch failed: ${res.status} ${res.statusText}`);
    }
    const data: unknown = await res.json();
    const body = data as GitTreeResponse;
    if (!body.tree) {
      throw new Error(
        `git-tree response missing tree${body.message ? `: ${body.message}` : ''}`,
      );
    }
    if (body.truncated) {
      throw new Error('git-tree response was truncated');
    }
    return body.tree
      .filter((entry) => entry.type === 'blob')
      .map((entry) => ({ path: entry.path, size: entry.size ?? 0 }));
  });
  treeRequest = request;

  try {
    return await request;
  } finally {
    if (treeRequest === request) treeRequest = null;
  }
}

function requestRaw(path: string): Promise<string> {
  return fetch(rawUrl(path)).then((res) => {
    if (!res.ok) {
      throw new Error(`raw fetch failed for ${path}: ${res.status} ${res.statusText}`);
    }
    return res.text();
  });
}

/**
 * Fetch a vault file from the CDN. Only immutable dated CSVs are cached: mutable
 * aggregates and config files must remain fresh when a route is revisited.
 */
export async function fetchRaw(path: string): Promise<string> {
  if (!DATED_SNAPSHOT_RE.test(path)) return requestRaw(path);

  const cached = rawTextCache.get(path);
  if (cached) {
    rawTextCache.delete(path);
    rawTextCache.set(path, cached);
    return cached;
  }

  const request = requestRaw(path);
  rawTextCache.set(path, request);
  if (rawTextCache.size > RAW_CACHE_LIMIT) {
    const oldest = rawTextCache.keys().next().value;
    if (oldest) rawTextCache.delete(oldest);
  }

  try {
    return await request;
  } catch (error: unknown) {
    rawTextCache.delete(path);
    throw error;
  }
}
