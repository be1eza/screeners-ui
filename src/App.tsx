import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AppNavbar from '@/layout/AppNavbar';
import Header from '@/layout/Header';
import SideMenu from '@/layout/SideMenu';

const SituationalAwareness = lazy(() => import('@/pages/SituationalAwareness'));
const Watchlists = lazy(() => import('@/pages/Watchlists'));
const Snapshots = lazy(() => import('@/pages/Snapshots'));
const Analysis = lazy(() => import('@/pages/Analysis'));

/**
 * Dashboard shell: the inverted rail on the left (a drawer under `md`), then one
 * content column that owns its own chrome via Header. Pages render data only.
 */
export default function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideMenu />
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <AppNavbar />
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 2, md: 3 }, pb: 8 }}>
          <Header />
          <Suspense
            fallback={
              <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
                <CircularProgress />
                <Typography color="text.secondary">Loading view…</Typography>
              </Stack>
            }
          >
            <Routes>
              <Route path="/" element={<SituationalAwareness />} />
              <Route path="/watchlists" element={<Watchlists />} />
              <Route path="/snapshots" element={<Snapshots />} />
              <Route path="/analysis" element={<Analysis />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
