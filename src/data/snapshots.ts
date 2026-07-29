import type { CsvRow, Snapshot, VaultFile } from '@/types';
import { fetchRaw } from './tree';
import { parseCsv } from './csv';

const RAW_CSV_RE = /^raw\/(?<slug>[^/]+)\/\d{4}\/(?<date>\d{4}-\d{2}-\d{2})\.csv$/;

type RawRef = { slug: string; date: string; path: string };

/** Extract every dated raw-CSV reference from the vault tree. */
export function rawRefs(tree: VaultFile[]): RawRef[] {
  const refs: RawRef[] = [];
  for (const { path } of tree) {
    const m = RAW_CSV_RE.exec(path);
    if (m?.groups) {
      refs.push({ slug: m.groups.slug, date: m.groups.date, path });
    }
  }
  return refs;
}

/** All dated CSV refs for one slug, newest date first. */
export function refsForSlug(tree: VaultFile[], slug: string): RawRef[] {
  return rawRefs(tree)
    .filter((r) => r.slug === slug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Fetch + parse the newest dated CSV for a slug (null if the slug has none). */
export async function fetchLatestSnapshot(
  tree: VaultFile[],
  slug: string,
): Promise<Snapshot | null> {
  const [newest] = refsForSlug(tree, slug);
  if (!newest) return null;
  const rows = parseCsv(await fetchRaw(newest.path));
  return { slug, date: newest.date, rows };
}

/** Fetch + parse every dated CSV for a slug, oldest→newest (for trend series). */
export async function fetchSnapshotHistory(
  tree: VaultFile[],
  slug: string,
): Promise<Snapshot[]> {
  const refs = refsForSlug(tree, slug).reverse(); // oldest first for charts
  const texts = await Promise.all(refs.map((r) => fetchRaw(r.path)));
  return refs.map((r, i) => ({ slug, date: r.date, rows: parseCsv(texts[i]) }));
}

/** Count of data rows in a snapshot (a screener's breadth on that date). */
export function rowCount(rows: CsvRow[]): number {
  return rows.length;
}
