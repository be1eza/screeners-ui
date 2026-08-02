import type { CsvRow, Snapshot, VaultFile } from '@/types';
import { fetchRaw } from './tree';
import { parseCsv } from './csv';

const RAW_CSV_RE = /^raw\/(?<slug>[^/]+)\/\d{4}\/(?<date>\d{4}-\d{2}-\d{2})\.csv$/;

export type RawRef = { slug: string; date: string; path: string };

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

/** The dated CSV reference for one slug on an exact date, if it exists. */
export function refForDate(tree: VaultFile[], slug: string, date: string): RawRef | null {
  return rawRefs(tree).find((ref) => ref.slug === slug && ref.date === date) ?? null;
}

/** Dates represented by every requested slug, oldest date first. */
export function commonSnapshotDates(
  tree: VaultFile[],
  slugs: readonly string[],
): string[] {
  const uniqueSlugs = [...new Set(slugs)];
  if (uniqueSlugs.length === 0) return [];

  const datesBySlug = new Map(uniqueSlugs.map((slug) => [slug, new Set<string>()]));
  for (const { slug, date } of rawRefs(tree)) {
    datesBySlug.get(slug)?.add(date);
  }

  const [firstSlug, ...remainingSlugs] = uniqueSlugs;
  return [...datesBySlug.get(firstSlug)!]
    .filter((date) => remainingSlugs.every((slug) => datesBySlug.get(slug)!.has(date)))
    .sort((a, b) => a.localeCompare(b));
}

/** Fetch + parse one slug's snapshot on an exact date (null if absent). */
export async function fetchSnapshot(
  tree: VaultFile[],
  slug: string,
  date: string,
): Promise<Snapshot | null> {
  const ref = refForDate(tree, slug, date);
  if (!ref) return null;
  const rows = parseCsv(await fetchRaw(ref.path));
  return { slug, date, rows };
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
