import type { BasketRow, CsvRow, SmaDistance, StockRow } from '@/types';
import { pct } from './csv';
import { tvToken } from './slug';

/**
 * The SMA-distance tail both schemas gained on 2026-07-25. Reading by header name
 * means older, narrower snapshots simply yield nulls instead of misaligning.
 */
function toSmaDistance(row: CsvRow): SmaDistance {
  return {
    sma20: pct(row['20-Day Simple Moving Average']),
    sma50: pct(row['50-Day Simple Moving Average']),
    sma200: pct(row['200-Day Simple Moving Average']),
  };
}

/** Project a company-schema CSV row into the fields the UI uses. */
export function toStockRow(row: CsvRow): StockRow {
  return {
    token: tvToken(row['Exchange'] ?? '', row['Ticker'] ?? ''),
    ticker: row['Ticker'] ?? '',
    company: row['Company'] ?? '',
    sector: row['Sector'] ?? '',
    industry: row['Industry'] ?? '',
    perfWeek: pct(row['Performance (Week)']),
    ...toSmaDistance(row),
  };
}

/** Project an ETF-basket CSV row (Sector/Theme, no Industry) — Markets · Sectors · Group Themes. */
export function toBasketRow(row: CsvRow): BasketRow {
  return {
    token: tvToken(row['Exchange'] ?? '', row['Ticker'] ?? ''),
    ticker: row['Ticker'] ?? '',
    theme: row['Sector/Theme'] ?? '',
    perfWeek: pct(row['Performance (Week)']),
    perfMonth: pct(row['Performance (Month)']),
    perfQuarter: pct(row['Performance (Quarter)']),
    ...toSmaDistance(row),
  };
}
