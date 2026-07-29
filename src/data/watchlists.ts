import type { IndustryGroup, Screener, VaultFile, Watchlist } from '@/types';
import { fetchRaw } from './tree';
import { parseCsv } from './csv';
import { refsForSlug } from './snapshots';
import { tvToken } from './slug';

/** Parse a watchlist `.txt` (`EX:TICKER,EX:TICKER,...`) into a token list. */
export function parseWatchlistTxt(text: string): string[] {
  return text
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** Fetch an aggregate watchlist's flat token list. */
export async function fetchAggregate(slug: string): Promise<string[]> {
  return parseWatchlistTxt(await fetchRaw(`watchlists/${slug}/aggregate.txt`));
}

/**
 * Map each token to its industry by walking the slug's raw CSVs newest-first,
 * stopping as soon as every token is resolved (CLAUDE.md's early-exit walk).
 * Tokens never found in any snapshot fall through to 'Unknown' at group time.
 */
async function tokenIndustryMap(
  tree: VaultFile[],
  slug: string,
  tokens: string[],
): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  const remaining = new Set(tokens);

  for (const ref of refsForSlug(tree, slug)) {
    if (remaining.size === 0) break;
    const rows = parseCsv(await fetchRaw(ref.path));
    for (const row of rows) {
      const token = tvToken(row['Exchange'] ?? '', row['Ticker'] ?? '');
      if (remaining.has(token)) {
        found.set(token, row['Industry'] || 'Unknown');
        remaining.delete(token);
      }
    }
  }
  return found;
}

/** Group tokens under their industry, largest group first. */
export function groupByIndustry(
  tokens: string[],
  industryOf: Map<string, string>,
): IndustryGroup[] {
  const byIndustry = new Map<string, string[]>();
  for (const token of tokens) {
    const industry = industryOf.get(token) ?? 'Unknown';
    if (!byIndustry.has(industry)) byIndustry.set(industry, []);
    byIndustry.get(industry)!.push(token);
  }
  return [...byIndustry.entries()]
    .map(([industry, groupTokens]) => ({ industry, tokens: groupTokens }))
    .sort((a, b) => b.tokens.length - a.tokens.length || a.industry.localeCompare(b.industry));
}

/**
 * TradingView import string: each industry becomes a `###Section` header
 * followed by its symbols, all comma-joined into one line.
 */
export function toTradingView(groups: IndustryGroup[]): string {
  return groups.map((g) => [`###${g.industry}`, ...g.tokens].join(',')).join(',');
}

/** Build one industry-grouped, TradingView-ready aggregate watchlist. */
export async function fetchWatchlist(tree: VaultFile[], screener: Screener): Promise<Watchlist> {
  const slug = screener.slug ?? '';
  const tokens = await fetchAggregate(slug);
  const industryOf = await tokenIndustryMap(tree, slug, tokens);
  const groups = groupByIndustry(tokens, industryOf);
  return {
    name: screener.name,
    slug,
    groups,
    tokenCount: tokens.length,
    tradingView: toTradingView(groups),
  };
}
