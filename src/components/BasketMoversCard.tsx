import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { BasketRow } from '@/types';
import { basketMovers, rankedByPerf, type PerfField } from '@/data/analytics';
import SectionCard from './SectionCard';
import Ticker from './Ticker';

type BasketMoversCardProps = {
  label: string; // "1W" | "1M" | "3M"
  field: PerfField;
  rows: BasketRow[];
  /**
   * Show only the n best and n worst, split by a divider. Omit to rank every
   * ticker in one list — right for Markets (8) and Sectors (11), where the whole
   * basket fits and the complete ordering is the signal.
   */
  top?: number;
};

/** One ETF as a zero-centered diverging bar: right/green up, left/red down. */
function MoverRow({ row, field, max }: { row: BasketRow; field: PerfField; max: number }) {
  const value = row[field] ?? 0;
  const positive = value >= 0;
  const width = max > 0 ? (Math.abs(value) / max) * 50 : 0;
  const color = positive ? 'up.main' : 'down.main';

  return (
    // Row-wide tooltip carries the theme + full token, so the chip stays bare
    // (nesting a second tooltip inside this one would fight it). Markets rows have
    // no Sector/Theme, so the token stands alone rather than trailing a stray dot.
    <Tooltip
      title={row.theme ? `${row.theme} · ${row.token}` : row.token}
      placement="left"
      arrow
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.3 }}>
        <Box sx={{ width: 60, flexShrink: 0 }}>
          <Ticker value={row.ticker} />
        </Box>
        <Box sx={{ flex: 1, position: 'relative', height: 10, minWidth: 0 }}>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 1,
              bottom: 1,
              width: `${width}%`,
              bgcolor: color,
              borderRadius: 0.375,
              ...(positive ? { left: '50%' } : { right: '50%' }),
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ width: 62, textAlign: 'right', fontWeight: 600, color }}>
          {positive ? '+' : ''}
          {value.toFixed(2)}%
        </Typography>
      </Stack>
    </Tooltip>
  );
}

/**
 * One basket ranked on one timeframe, as zero-centered diverging bars —
 * either the whole basket best-first, or its best & worst `top` split by a divider.
 */
export default function BasketMoversCard({ label, field, rows, top }: BasketMoversCardProps) {
  const { best, worst } = top != null ? basketMovers(rows, field, top) : { best: [], worst: [] };
  const all = top == null ? rankedByPerf(rows, field) : [];

  // Shared scale so bar lengths are comparable across every row in this card.
  const max = Math.max(...[...all, ...best, ...worst].map((r) => Math.abs(r[field] ?? 0)), 1);

  return (
    <SectionCard title={label}>
      {top == null ? (
        all.map((r) => <MoverRow key={r.ticker} row={r} field={field} max={max} />)
      ) : (
        <>
          {best.map((r) => (
            <MoverRow key={r.ticker} row={r} field={field} max={max} />
          ))}
          <Divider sx={{ my: 1 }} />
          {worst.map((r) => (
            <MoverRow key={r.ticker} row={r} field={field} max={max} />
          ))}
        </>
      )}
    </SectionCard>
  );
}
