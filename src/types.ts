/** Registry entry — mirrors config/screeners.json in the vault (see vault repo.md). */
export type Screener = {
  name: string;
  f: string;
  t: string;
  o: string;
  c?: string;
  slug?: string;
  watchlist: boolean;
  aggregate: boolean | null;
};

/** Which watchlist a card shows. */
export type View = 'aggregate' | 'daily';

/** A ticker grouped under its industry, TradingView-ready (EXCHANGE:TICKER). */
export type IndustryGroup = {
  industry: string;
  tokens: string[];
};
