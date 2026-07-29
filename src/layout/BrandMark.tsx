import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CandlestickChartRoundedIcon from '@mui/icons-material/CandlestickChartRounded';

/**
 * The app lockup: a filled glyph tile plus a tracked-out wordmark, one line. No
 * tagline under it — the same grey-caption-under-a-title pattern the panels drop.
 */
export default function BrandMark() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <CandlestickChartRoundedIcon sx={{ fontSize: 17 }} />
      </Box>
      <Typography
        noWrap
        sx={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.075em', lineHeight: 1.3 }}
      >
        SCREENERS
      </Typography>
    </Stack>
  );
}
