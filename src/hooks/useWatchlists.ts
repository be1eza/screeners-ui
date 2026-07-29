import type { Watchlist } from '@/types';
import { fetchTree } from '@/data/tree';
import { fetchRegistry } from '@/data/registry';
import { fetchWatchlist } from '@/data/watchlists';
import { useAsync, type AsyncState } from './useAsync';

/** Fetch every aggregate watchlist, industry-grouped and TradingView-ready. */
async function loadWatchlists(): Promise<Watchlist[]> {
  const [tree, registry] = await Promise.all([fetchTree(), fetchRegistry()]);
  // Only screeners that publish an aggregate.txt (watchlist + aggregate).
  const aggregates = registry.filter((s) => s.watchlist && s.aggregate === true);
  return Promise.all(aggregates.map((s) => fetchWatchlist(tree, s)));
}

export function useWatchlists(): AsyncState<Watchlist[]> {
  return useAsync(loadWatchlists, []);
}
