import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import WatchlistCard from '@/components/WatchlistCard';
import { useWatchlists } from '@/hooks/useWatchlists';

/**
 * Watchlists — the copy tool. Each aggregate watchlist rendered as an
 * industry-grouped, one-click TradingView-ready list (`###Industry,EX:TICKER,...`).
 *
 * The page heading lives in the layout Header, driven off `layout/nav`.
 */
export default function Watchlists() {
  const state = useWatchlists();

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
          Couldn’t load watchlists: {state.error.message}
        </Alert>
      )}

      {state.status === 'success' && (
        <Grid container spacing={2}>
          {state.data.map((watchlist) => (
            <Grid key={watchlist.slug} size={{ xs: 12, md: 6 }}>
              <WatchlistCard watchlist={watchlist} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
