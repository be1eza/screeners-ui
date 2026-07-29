/**
 * Slugify a screener name to its vault directory name. Mirrors the vault's
 * repo.md rule: lowercase, any run of non-alphanumerics → single `-`, trim `-`.
 * e.g. "1-Month Mover Exceeding 30%" → "1-month-mover-exceeding-30".
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Map a Finviz CSV exchange code to its TradingView prefix, matching how the
 * vault's watchlist `.txt` files are built (NASD → NASDAQ; others pass through).
 */
export function tvExchange(exchange: string): string {
  return exchange === 'NASD' ? 'NASDAQ' : exchange;
}

/** Build a TradingView token `EXCHANGE:TICKER` from raw CSV cells. */
export function tvToken(exchange: string, ticker: string): string {
  return `${tvExchange(exchange)}:${ticker}`;
}

/**
 * Split a token into its parts. Accepts both TradingView tokens
 * (`NASDAQ:AAPL` → `{ exchange: 'NASDAQ', symbol: 'AAPL' }`) and bare symbols
 * (`XLK` → `{ exchange: null, symbol: 'XLK' }`).
 */
export function tickerParts(token: string): { exchange: string | null; symbol: string } {
  const i = token.indexOf(':');
  return i === -1
    ? { exchange: null, symbol: token }
    : { exchange: token.slice(0, i), symbol: token.slice(i + 1) };
}
