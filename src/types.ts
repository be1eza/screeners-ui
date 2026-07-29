/** Registry entry — mirrors config/screeners.json in the vault (see vault repo.md). */
export type Screener = {
  name: string;
  f: string;
  t: string;
  o: string;
  /**
   * Column-set selector, resolved by the vault workflow against `config/columns.json`.
   * Absent → the 28-col `company` set (the 13 company screeners); `'basket'` → the
   * 21-col ETF set (Markets · Sectors · Group Themes). We never fetch columns.json:
   * both schemas are read by header *name*, so the set only tells us which shape to expect.
   */
  c?: 'basket' | string;
  slug?: string;
  watchlist: boolean;
  aggregate: boolean | null;
};

/** The three ETF baskets — the vault's rotation hierarchy, broadest first. */
export type Basket = {
  slug: string;
  title: string;
  subtitle: string;
  /** Markets rows carry an empty `Sector/Theme` (broad index/crypto ETFs have none). */
  hasTheme: boolean;
  /**
   * In the per-timeframe movers cards, show only the n best and n worst. Omit to
   * rank the whole basket — right when it's small enough to read end to end.
   */
  topMovers?: number;
};

/** Which watchlist a card shows. */
export type View = 'aggregate' | 'daily';

/** A ticker grouped under its industry, TradingView-ready (EXCHANGE:TICKER). */
export type IndustryGroup = {
  industry: string;
  tokens: string[];
};

/** One file blob in the vault tree (from the git-tree API). */
export type VaultFile = {
  path: string;
  size: number;
};

/** A parsed dated CSV snapshot: header + rows keyed by column name. */
export type Snapshot = {
  slug: string;
  date: string; // YYYY-MM-DD
  rows: CsvRow[];
};

/** One CSV row keyed by its column header; raw string cells. */
export type CsvRow = Record<string, string>;

/**
 * Trend position: **% distance from price to each SMA**, not the SMA level
 * (`-0.81` = 0.81% below the 20-day). Both schemas gained these three columns as a
 * tail-append on 2026-07-25 — every earlier snapshot lacks them, hence `null`.
 */
export type SmaDistance = {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
};

/** A stock row's fields we care about (28-col company schema). */
export type StockRow = SmaDistance & {
  token: string; // EXCHANGE:TICKER (TradingView-ready)
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  perfWeek: number | null;
};

/**
 * One ETF-basket row (21-col schema: Sector/Theme + Net Flows, no Industry).
 * Shared verbatim by Markets, Sectors and Group Themes, which is what makes the
 * three baskets directly comparable.
 */
export type BasketRow = SmaDistance & {
  token: string;
  ticker: string;
  theme: string;
  perfWeek: number | null;
  perfMonth: number | null;
  perfQuarter: number | null;
};

/** Breadth: how many names are up vs down ≥20% on a given date. */
export type BreadthPoint = {
  date: string;
  up: number;
  down: number;
};

/** Industries ranked by how many watchlist names they contain. */
export type IndustryRank = {
  industry: string;
  count: number;
  tokens: string[];
};

/** An aggregate watchlist, industry-grouped and TradingView-ready. */
export type Watchlist = {
  name: string;
  slug: string;
  groups: IndustryGroup[];
  tokenCount: number;
  /** One-click copy string: `###Industry,EX:TICKER,...` (TradingView sections). */
  tradingView: string;
};
