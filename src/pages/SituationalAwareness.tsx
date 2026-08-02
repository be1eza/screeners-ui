import { Fragment, lazy, Suspense, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasketMoversCard from '@/components/BasketMoversCard';
import BreadthCard from '@/components/BreadthCard';
import BreadthIndustriesCard from '@/components/BreadthIndustriesCard';
import IndustryDominationCard from '@/components/IndustryDominationCard';
import SectionHeading from '@/components/SectionHeading';
import SnapshotDateNavigator from '@/components/SnapshotDateNavigator';
import type { PerfField } from '@/data/analytics';
import { useSituationalAwareness } from '@/hooks/useSituationalAwareness';

const BasketPerformanceCard = lazy(() => import('@/components/BasketPerformanceCard'));

const TIMEFRAMES: { label: string; field: PerfField }[] = [
  { label: '1W', field: 'perfWeek' },
  { label: '1M', field: 'perfMonth' },
  { label: '3M', field: 'perfQuarter' },
];

/**
 * Situational Awareness & Themes — the home dashboard. Reads off the vault:
 * weekly breadth (±20%), the industries behind each side of it, 52w-high
 * domination, then the three ETF baskets as one rotation stack, broadest first
 * (Markets → Sectors → Group Themes). They share a schema and identical cards,
 * so a rotation can be read straight down the page from asset class to theme.
 *
 * The page heading lives in the layout Header, driven off `layout/nav` — pages
 * render data only.
 */
export default function SituationalAwareness() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDate = searchParams.get('date') || null;
  const state = useSituationalAwareness(requestedDate);
  const dateErrorMessage =
    state.error && state.failedDate !== null
      ? state.data && state.data.date !== state.failedDate
        ? `Couldn’t load ${state.failedDate}; still showing ${state.data.date}.`
        : `Couldn’t load ${state.failedDate}: ${state.error.message}`
      : null;

  const selectDate = useCallback(
    (date: string | null) => {
      const nextDate = date === state.latestDate ? null : date;
      if (nextDate === requestedDate) return;

      const nextParams = new URLSearchParams(searchParams);
      if (nextDate) nextParams.set('date', nextDate);
      else nextParams.delete('date');
      setSearchParams(nextParams, { preventScrollReset: true });
    },
    [requestedDate, searchParams, setSearchParams, state.latestDate],
  );

  return (
    <Box>
      {state.availableDates.length > 0 && (
        <SnapshotDateNavigator
          availableDates={state.availableDates}
          selectedDate={requestedDate}
          loading={state.loading}
          errorMessage={dateErrorMessage}
          onSelect={selectDate}
          onLatest={() => selectDate(null)}
          onRetry={state.retry}
        />
      )}

      {state.loading && !state.data && (
        <Stack alignItems="center" sx={{ py: 8 }} spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Reading the vault…</Typography>
        </Stack>
      )}

      {state.error && state.failedDate === null && (
        <Alert
          severity="error"
          action={
            state.retry ? (
              <Button color="inherit" size="small" onClick={state.retry}>
                Retry
              </Button>
            ) : undefined
          }
          sx={{ mt: 2 }}
        >
          Couldn’t load vault data: {state.error.message}
        </Alert>
      )}

      {state.data && (
        <Grid container spacing={2} aria-busy={state.loading}>
          <Grid size={12}>
            <BreadthCard
              data={state.data.breadth}
              selectableDates={state.availableDates}
              selectedDate={state.data.date}
              onSelectDate={selectDate}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BreadthIndustriesCard side="up" data={state.data.movers20.up} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BreadthIndustriesCard side="down" data={state.data.movers20.down} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <IndustryDominationCard title="52w highs" data={state.data.highs} />
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
                <Suspense
                  fallback={
                    <Card sx={{ display: 'grid', minHeight: 160, placeItems: 'center' }}>
                      <CircularProgress size={24} />
                    </Card>
                  }
                >
                  <BasketPerformanceCard basket={basket} data={rows} />
                </Suspense>
              </Grid>
            </Fragment>
          ))}
        </Grid>
      )}
    </Box>
  );
}
