import { treeUrl, rawUrl } from '@/config';
import type { VaultFile } from '@/types';

type GitTreeEntry = { path: string; type: string; size?: number };
type GitTreeResponse = { tree?: GitTreeEntry[]; truncated?: boolean; message?: string };

/**
 * Enumerate every file in the vault with ONE git-tree API call (recursive).
 * Blobs only. Throws on a non-OK response or a truncated tree (the vault is far
 * below GitHub's 100k-entry truncation limit, so truncation means something broke).
 */
export async function fetchTree(): Promise<VaultFile[]> {
  const res = await fetch(treeUrl());
  if (!res.ok) {
    throw new Error(`git-tree fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  const body = data as GitTreeResponse;
  if (!body.tree) {
    throw new Error(`git-tree response missing tree${body.message ? `: ${body.message}` : ''}`);
  }
  if (body.truncated) {
    throw new Error('git-tree response was truncated');
  }
  return body.tree
    .filter((e) => e.type === 'blob')
    .map((e) => ({ path: e.path, size: e.size ?? 0 }));
}

/** Fetch a single vault file's raw text from the CDN. */
export async function fetchRaw(path: string): Promise<string> {
  const res = await fetch(rawUrl(path));
  if (!res.ok) {
    throw new Error(`raw fetch failed for ${path}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}
