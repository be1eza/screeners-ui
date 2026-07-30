import type { Basket, BasketRow, BreadthPoint, IndustryRank } from '@/types';
import { fetchTree } from '@/data/tree';
import { fetchLatestSnapshot, fetchSnapshotHistory } from '@/data/snapshots';
import {
  basketPerformance,
  breadth,
  rankIndustries,
  BASKETS,
  UP_SLUG,
  DOWN_SLUG,
  HIGHS_SLUG,
} from '@/data/analytics';
import { useAsync, type AsyncState } from './useAsync';

/** One ETF basket's newest snapshot, projected and sorted. */
export type BasketView = {
  basket: Basket;
  rows: BasketRow[];
  date: string | null;
};

export type SituationalAwareness = {
  breadth: BreadthPoint[];
  /** Industries behind the newest ±20% movers (the breadth composition). */
  movers20: { up: IndustryRank[]; down: IndustryRank[]; date: string | null };
  highs: IndustryRank[];
  highsDate: string | null;
  /** Markets → Sectors → Group Themes, broadest first (see BASKETS). */
  baskets: BasketView[];
};

/** Fetch every SA&T input in parallel off one tree call, then compute metrics. */
async function loadSituationalAwareness(): Promise<SituationalAwareness> {
  const tree = await fetchTree();

  const [up, down, highs, basketSnaps] = await Promise.all([
    fetchSnapshotHistory(tree, UP_SLUG),
    fetchSnapshotHistory(tree, DOWN_SLUG),
    fetchLatestSnapshot(tree, HIGHS_SLUG),
    Promise.all(BASKETS.map((b) => fetchLatestSnapshot(tree, b.slug))),
  ]);

  // Histories arrive oldest→newest, so the last entry is the current snapshot.
  const newestUp = up.at(-1) ?? null;
  const newestDown = down.at(-1) ?? null;

  return {
    breadth: breadth(up, down),
    movers20: {
      up: newestUp ? rankIndustries([newestUp]) : [],
      down: newestDown ? rankIndustries([newestDown]) : [],
      date: newestUp?.date ?? newestDown?.date ?? null,
    },
    highs: highs ? rankIndustries([highs]) : [],
    highsDate: highs?.date ?? null,
    baskets: BASKETS.map((basket, i) => {
      const snap = basketSnaps[i];
      return {
        basket,
        rows: snap ? basketPerformance(snap) : [],
        date: snap?.date ?? null,
      };
    }),
  };
}

export function useSituationalAwareness(): AsyncState<SituationalAwareness> {
  return useAsync(loadSituationalAwareness, []);
}
