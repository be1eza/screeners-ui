import { rawUrl } from '@/config';
import type { Screener } from '@/types';
import { slugify } from './slug';

/**
 * Fetch and parse the vault's screener registry (`config/screeners.json`).
 * Attaches the derived `slug` so callers never re-slugify. The vault serves this
 * as a bare JSON array of screener entries.
 */
export async function fetchRegistry(): Promise<Screener[]> {
  const res = await fetch(rawUrl('config/screeners.json'));
  if (!res.ok) {
    throw new Error(`registry fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('registry is not an array');
  }
  return data.map((entry) => {
    const s = entry as Screener;
    return { ...s, slug: s.slug ?? slugify(s.name) };
  });
}
