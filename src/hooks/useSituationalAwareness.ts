import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Basket,
  BasketRow,
  BreadthPoint,
  IndustryRank,
  Snapshot,
  VaultFile,
} from '@/types';
import { fetchTree } from '@/data/tree';
import { commonSnapshotDates, fetchSnapshot } from '@/data/snapshots';
import {
  basketPerformance,
  breadth,
  rankIndustries,
  BASKETS,
  UP_SLUG,
  DOWN_SLUG,
  HIGHS_SLUG,
} from '@/data/analytics';

const BREADTH_WINDOW = 30;
const REQUIRED_SLUGS: readonly string[] = [
  UP_SLUG,
  DOWN_SLUG,
  HIGHS_SLUG,
  ...BASKETS.map((basket) => basket.slug),
];
const BREADTH_SLUGS: readonly string[] = [UP_SLUG, DOWN_SLUG];

/** One ETF basket on the page's exact selected snapshot date. */
export type BasketView = {
  basket: Basket;
  rows: BasketRow[];
  date: string;
};

export type SituationalAwareness = {
  date: string;
  breadth: BreadthPoint[];
  /** Industries behind the selected date's ±20% movers. */
  movers20: { up: IndustryRank[]; down: IndustryRank[]; date: string };
  highs: IndustryRank[];
  highsDate: string;
  /** Markets → Sectors → Group Themes, broadest first (see BASKETS). */
  baskets: BasketView[];
};

export type SituationalAwarenessState = {
  /** Last complete bundle stays mounted while another date loads. */
  data: SituationalAwareness | null;
  /** Complete page dates, oldest first. */
  availableDates: string[];
  /** Exact target date; latest common date when the URL carries no date. */
  selectedDate: string | null;
  latestDate: string | null;
  loading: boolean;
  error: Error | null;
  /** Date whose exact bundle failed, including an invalid URL date. */
  failedDate: string | null;
  /** Re-run a failed tree or snapshot load; invalid catalog dates are not retryable. */
  retry: (() => void) | null;
};

type LoadFailure = { date: string; error: Error };

type TreeState =
  | { status: 'loading'; tree: null; error: null }
  | { status: 'success'; tree: VaultFile[]; error: null }
  | { status: 'error'; tree: null; error: Error };

async function requireSnapshot(
  tree: VaultFile[],
  slug: string,
  date: string,
): Promise<Snapshot> {
  const snapshot = await fetchSnapshot(tree, slug, date);
  if (!snapshot) throw new Error(`No ${slug} snapshot exists for ${date}`);
  return snapshot;
}

/** Fetch one atomic page bundle plus its stable 30-reading breadth block. */
async function loadSituationalAwareness(
  tree: VaultFile[],
  date: string,
  breadthDates: string[],
): Promise<SituationalAwareness> {
  const selectedIndex = breadthDates.indexOf(date);
  if (selectedIndex < 0) throw new Error(`Snapshot date ${date} is unavailable`);

  // Blocks are anchored from newest so selecting a bar leaves it in place. A
  // previous/next step only moves the plot when it crosses a 30-reading boundary.
  const block = Math.floor((breadthDates.length - 1 - selectedIndex) / BREADTH_WINDOW);
  const windowEnd = breadthDates.length - block * BREADTH_WINDOW;
  // Pull the oldest partial block forward to a full window. With 31 readings,
  // selecting the oldest shows 1–30 rather than a context-free single bar.
  const windowStart = Math.max(
    0,
    Math.min(windowEnd - BREADTH_WINDOW, breadthDates.length - BREADTH_WINDOW),
  );
  const windowDates = breadthDates.slice(windowStart, windowStart + BREADTH_WINDOW);

  const [upHistory, downHistory, highs, basketSnapshots] = await Promise.all([
    Promise.all(
      windowDates.map((windowDate) => requireSnapshot(tree, UP_SLUG, windowDate)),
    ),
    Promise.all(
      windowDates.map((windowDate) => requireSnapshot(tree, DOWN_SLUG, windowDate)),
    ),
    requireSnapshot(tree, HIGHS_SLUG, date),
    Promise.all(BASKETS.map((basket) => requireSnapshot(tree, basket.slug, date))),
  ]);

  const selectedUp = upHistory.find((snapshot) => snapshot.date === date);
  const selectedDown = downHistory.find((snapshot) => snapshot.date === date);
  if (!selectedUp || !selectedDown) {
    throw new Error(`Breadth snapshots are unavailable for ${date}`);
  }

  return {
    date,
    breadth: breadth(upHistory, downHistory),
    movers20: {
      up: rankIndustries([selectedUp]),
      down: rankIndustries([selectedDown]),
      date,
    },
    highs: rankIndustries([highs]),
    highsDate: date,
    baskets: BASKETS.map((basket, index) => ({
      basket,
      rows: basketPerformance(basketSnapshots[index]),
      date,
    })),
  };
}

/** Warm the exact adjacent page inputs; failed prefetches never affect the UI. */
function prefetchDate(tree: VaultFile[], date: string): void {
  void Promise.all(REQUIRED_SLUGS.map((slug) => fetchSnapshot(tree, slug, date))).catch(
    () => undefined,
  );
}

/**
 * One tree call builds the date catalog. Date changes then fetch an exact, complete
 * page bundle while retaining the previous bundle, so a reader can stay scrolled to
 * Sectors (or any other panel) without a layout-resetting loading screen.
 */
export function useSituationalAwareness(
  requestedDate: string | null,
): SituationalAwarenessState {
  const [treeState, setTreeState] = useState<TreeState>({
    status: 'loading',
    tree: null,
    error: null,
  });
  const [treeRetryKey, setTreeRetryKey] = useState(0);
  const [data, setData] = useState<SituationalAwareness | null>(null);
  const [loadingDate, setLoadingDate] = useState(false);
  const [loadFailure, setLoadFailure] = useState<LoadFailure | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchTree().then(
      (tree) => {
        if (active) setTreeState({ status: 'success', tree, error: null });
      },
      (error: unknown) => {
        if (!active) return;
        setTreeState({
          status: 'error',
          tree: null,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      },
    );
    return () => {
      active = false;
    };
  }, [treeRetryKey]);

  const availableDates = useMemo(
    () =>
      treeState.status === 'success'
        ? commonSnapshotDates(treeState.tree, REQUIRED_SLUGS)
        : [],
    [treeState],
  );
  const breadthDates = useMemo(
    () =>
      treeState.status === 'success'
        ? commonSnapshotDates(treeState.tree, BREADTH_SLUGS)
        : [],
    [treeState],
  );
  const latestDate = availableDates.at(-1) ?? null;
  const selectedDate = requestedDate ?? latestDate;
  const validDate = selectedDate !== null && availableDates.includes(selectedDate);
  const activeLoadFailure = loadFailure?.date === selectedDate ? loadFailure : null;

  const retryLoad = useCallback(() => {
    setLoadFailure(null);
    setLoadingDate(true);
    setRetryKey((key) => key + 1);
  }, []);
  const retryTree = useCallback(() => {
    setTreeState({ status: 'loading', tree: null, error: null });
    setTreeRetryKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (treeState.status !== 'success') return;

    if (!selectedDate || !validDate) {
      setLoadingDate(false);
      setLoadFailure(null);
      return;
    }

    let active = true;
    setLoadingDate(true);
    setLoadFailure(null);

    loadSituationalAwareness(treeState.tree, selectedDate, breadthDates).then(
      (nextData) => {
        if (!active) return;
        setData(nextData);
        setLoadingDate(false);
        setLoadFailure(null);

        const index = availableDates.indexOf(selectedDate);
        const previousDate = availableDates[index - 1];
        const nextDate = availableDates[index + 1];
        if (previousDate) prefetchDate(treeState.tree, previousDate);
        if (nextDate) prefetchDate(treeState.tree, nextDate);
      },
      (error: unknown) => {
        if (!active) return;
        setLoadingDate(false);
        setLoadFailure({
          date: selectedDate,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      },
    );

    return () => {
      active = false;
    };
  }, [availableDates, breadthDates, retryKey, selectedDate, treeState, validDate]);

  const catalogError =
    treeState.status === 'success' && !validDate
      ? selectedDate !== null
        ? new Error(`Snapshot date ${selectedDate} is unavailable`)
        : new Error('No complete Situational Awareness snapshot dates are available')
      : null;
  const pendingDate =
    validDate && data?.date !== selectedDate && activeLoadFailure === null;
  const error =
    treeState.status === 'error'
      ? treeState.error
      : (catalogError ?? activeLoadFailure?.error ?? null);
  const canRetryTree =
    treeState.status === 'error' ||
    (treeState.status === 'success' && availableDates.length === 0);

  return {
    data,
    availableDates,
    selectedDate: validDate ? selectedDate : null,
    latestDate,
    loading: treeState.status === 'loading' || loadingDate || pendingDate,
    error,
    failedDate:
      treeState.status === 'success' && !validDate
        ? selectedDate
        : (activeLoadFailure?.date ?? null),
    retry: activeLoadFailure ? retryLoad : canRetryTree ? retryTree : null,
  };
}
