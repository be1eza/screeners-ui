import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Watchlist } from '@/types';
import { monoFontFamily } from '@/theme/themePrimitives';
import SectionCard from './SectionCard';
import CopyButton from './CopyButton';

type WatchlistCardProps = {
  watchlist: Watchlist;
};

/**
 * One aggregate watchlist: title, ticker/industry counts, a one-click
 * TradingView copy, and a preview box of the `###Industry,EX:TICKER,...` output
 * (grouped one industry per line for reading; the copy is the exact import string).
 */
export default function WatchlistCard({ watchlist }: WatchlistCardProps) {
  return (
    <SectionCard
      title={watchlist.name}
      action={<CopyButton text={watchlist.tradingView} label="Copy for TradingView" />}
    >
      <Box
        component="pre"
        sx={(theme) => ({
          m: 0,
          p: 1.5,
          maxHeight: 280,
          overflow: 'auto',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          // Opaque, so the import string reads as a terminal buffer rather than a
          // wash over the card.
          bgcolor: theme.vars.palette.raised,
          fontFamily: monoFontFamily,
          fontSize: '0.75rem',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        })}
      >
        {watchlist.groups.map((g) => (
          <Box component="div" key={g.industry}>
            <Typography
              component="span"
              sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              ###{g.industry}
            </Typography>
            ,{g.tokens.join(',')}
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}
