import type { Basket, BasketRow, BreadthPoint, IndustryRank, Snapshot } from '@/types';
import { toBasketRow, toStockRow } from './rows';

/** Slugs of the "momentum" mover screeners aggregated for industry domination. */
export const MOMENTUM_SLUGS = [
  '1-week-mover-exceeding-20',
  '1-month-mover-exceeding-30',
  '1-month-mover-exceeding-50',
  '3-month-mover-exceeding-50',
  '6-month-mover-exceeding-100',
] as const;

export const UP_SLUG = '5-days-up-20';
export const DOWN_SLUG = '5-days-down-20';
export const HIGHS_SLUG = '52w-highs';
export const THEMES_SLUG = 'group-themes';

/**
 * The vault's rotation hierarchy, broadest first: asset class → GICS sector →
 * narrow theme. All three share the 21-col basket schema, so one reader and one
 * card serve all of them; only the ticker list differs.
 */
export const BASKETS: Basket[] = [
  {
    slug: 'markets',
    title: 'Markets',
    subtitle: 'Asset-class regime — is the tape risk-on, and where is the bid',
    hasTheme: false,
  },
  {
    slug: 'sectors',
    title: 'Sectors',
    subtitle: 'All 11 GICS sectors — the complete rotation partition',
    hasTheme: true,
  },
  {
    slug: THEMES_SLUG,
    title: 'Group themes',
    subtitle: 'Narrow thematic ETFs — the granular expression of a rotation',
    hasTheme: true,
    // 38 ETFs: the ends carry the signal, the middle is noise.
    topMovers: 5,
  },
];

/**
 * Breadth over time: pair up-20% and down-20% snapshot histories by date.
 * Both counts are returned positive — the chart groups them side by side off a
 * shared baseline, so neither is a negative magnitude.
 */
export function breadth(up: Snapshot[], down: Snapshot[]): BreadthPoint[] {
  const byDate = new Map<string, BreadthPoint>();
  for (const s of up) byDate.set(s.date, { date: s.date, up: s.rows.length, down: 0 });
  for (const s of down) {
    const point = byDate.get(s.date) ?? { date: s.date, up: 0, down: 0 };
    point.down = s.rows.length;
    byDate.set(s.date, point);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Rank industries by how many distinct tickers appear across the given snapshots,
 * newest wins for the industry label of a duplicate ticker. Sorted by count desc,
 * then industry name. Used for both 52w-highs and the momentum union.
 */
export function rankIndustries(snapshots: Snapshot[]): IndustryRank[] {
  // token → industry (first seen; callers pass newest-first when it matters)
  const industryOf = new Map<string, string>();
  const tokensByIndustry = new Map<string, Set<string>>();

  for (const snap of snapshots) {
    for (const raw of snap.rows) {
      const { token, industry } = toStockRow(raw);
      if (!token || token.endsWith(':')) continue;
      if (industryOf.has(token)) continue;
      const label = industry || 'Unknown';
      industryOf.set(token, label);
      if (!tokensByIndustry.has(label)) tokensByIndustry.set(label, new Set());
      tokensByIndustry.get(label)!.add(token);
    }
  }

  return [...tokensByIndustry.entries()]
    .map(([industry, tokens]) => ({
      industry,
      count: tokens.size,
      tokens: [...tokens].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.industry.localeCompare(b.industry));
}

/** A timeframe field on a BasketRow. */
export type PerfField = 'perfWeek' | 'perfMonth' | 'perfQuarter';

/** Project + sort an ETF basket's rows by a chosen timeframe, desc. */
export function basketPerformance(snapshot: Snapshot, by: PerfField = 'perfWeek'): BasketRow[] {
  return snapshot.rows
    .map(toBasketRow)
    .filter((r) => r.ticker !== '')
    .sort((a, b) => (b[by] ?? -Infinity) - (a[by] ?? -Infinity));
}

/**
 * Every ETF that has a reading for the timeframe, best-first. Small baskets
 * (Markets' 8, Sectors' 11) are shown whole — the full ranking *is* the rotation.
 */
export function rankedByPerf(rows: BasketRow[], field: PerfField): BasketRow[] {
  return rows
    .filter((r) => r[field] != null)
    .sort((a, b) => (b[field] as number) - (a[field] as number));
}

/**
 * The n best and n worst ETFs for a timeframe. `best` is highest-first,
 * `worst` is most-negative-first. Rows missing that timeframe are dropped.
 * For the 38-ETF Group Themes basket, where showing every row would be noise.
 */
export function basketMovers(
  rows: BasketRow[],
  field: PerfField,
  n = 5,
): { best: BasketRow[]; worst: BasketRow[] } {
  const ranked = rankedByPerf(rows, field);
  return {
    best: ranked.slice(0, n),
    worst: ranked.slice(-n).reverse(),
  };
}
