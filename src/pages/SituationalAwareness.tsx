import { Fragment } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasketMoversCard from '@/components/BasketMoversCard';
import BasketPerformanceCard from '@/components/BasketPerformanceCard';
import BreadthCard from '@/components/BreadthCard';
import BreadthIndustriesCard from '@/components/BreadthIndustriesCard';
import IndustryDominationCard from '@/components/IndustryDominationCard';
import SectionHeading from '@/components/SectionHeading';
import type { PerfField } from '@/data/analytics';
import { useSituationalAwareness } from '@/hooks/useSituationalAwareness';

const TIMEFRAMES: { label: string; field: PerfField }[] = [
  { label: '1W', field: 'perfWeek' },
  { label: '1M', field: 'perfMonth' },
  { label: '3M', field: 'perfQuarter' },
];

/**
 * Situational Awareness & Themes — the home dashboard. Reads off the vault:
 * weekly breadth (±20%), 52w-high industry domination, momentum-watchlist
 * domination, then the three ETF baskets as one rotation stack, broadest first
 * (Markets → Sectors → Group Themes). They share a schema and identical cards,
 * so a rotation can be read straight down the page from asset class to theme.
 *
 * The page heading lives in the layout Header, driven off `layout/nav` — pages
 * render data only.
 */
export default function SituationalAwareness() {
  const state = useSituationalAwareness();

  return (
    <Box>
      {state.status === 'loading' && (
        <Stack alignItems="center" sx={{ py: 8 }} spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Reading the vault…</Typography>
        </Stack>
      )}

      {state.status === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Couldn’t load vault data: {state.error.message}
        </Alert>
      )}

      {state.status === 'success' && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <BreadthCard data={state.data.breadth} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BreadthIndustriesCard
              up={state.data.movers20.up}
              down={state.data.movers20.down}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <IndustryDominationCard title="52w highs" data={state.data.highs} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <IndustryDominationCard title="Movers watchlists" data={state.data.momentum} />
          </Grid>
          {/* One section per basket, broadest first: asset class → GICS sector → theme. */}
          {state.data.baskets.map(({ basket, rows, date }) => (
            <Fragment key={basket.slug}>
              <Grid size={12} sx={{ mt: 2.5 }}>
                <SectionHeading title={basket.title} meta={date} />
              </Grid>
              {TIMEFRAMES.map(({ label, field }) => (
                <Grid key={field} size={{ xs: 12, md: 4 }}>
                  <BasketMoversCard
                    label={label}
                    field={field}
                    rows={rows}
                    top={basket.topMovers}
                  />
                </Grid>
              ))}
              <Grid size={12}>
                <BasketPerformanceCard
                  basket={basket}
                  data={rows}
                  // The section heading already names the basket and dates it.
                  title="All timeframes & trend"
                />
              </Grid>
            </Fragment>
          ))}
        </Grid>
      )}
    </Box>
  );
}
