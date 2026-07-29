import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { tickerParts } from '@/data/slug';

type TickerProps = {
  /** A TradingView token (`NASDAQ:AAPL`) or a bare symbol (`XLK`). */
  value: string;
  /** Extra context for the tooltip (e.g. company or theme name). */
  title?: string;
};

/**
 * The one way a ticker is rendered: a tight rounded label carrying just the
 * symbol, tracked out so a wall of them stays readable at 11px. The exchange
 * prefix is dropped from the face — it's noise when reading a list of names — and
 * preserved in the tooltip so the TradingView token stays legible.
 */
export default function Ticker({ value, title }: TickerProps) {
  const { exchange, symbol } = tickerParts(value);
  const tooltip = [title, exchange ? `${exchange}:${symbol}` : null].filter(Boolean).join(' · ');

  const chip = (
    <Chip
      label={symbol}
      size="small"
      // `raised` is the palette's one opaque step off paper (see themePrimitives):
      // opaque, not an alpha tint, so the label reads identically on plain paper
      // and on the banded rows of a table.
      sx={(theme) => ({
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.035em',
        border: 'none',
        // Rounded rect, not a pill: 0.75 × the theme's 8px radius.
        borderRadius: 0.75,
        bgcolor: theme.vars.palette.raised,
        color: theme.vars.palette.text.primary,
      })}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{chip}</Tooltip> : chip;
}
