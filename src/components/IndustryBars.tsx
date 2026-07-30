import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, useTheme } from '@mui/material/styles';
import type { IndustryRank } from '@/types';
import Ticker from './Ticker';

/** Which palette hue the magnitude bars use — polarity, when the data has one. */
export type BarHue = 'primary' | 'up' | 'down';

type IndustryBarsProps = {
  data: IndustryRank[];
  topN?: number;
  hue?: BarHue;
};

/**
 * Industries ranked by watchlist presence: a horizontal magnitude bar per
 * industry (single hue — count is one measure) that expands to its tickers.
 * Shared by every "domination" card so the ranking reads identically everywhere.
 */
export default function IndustryBars({
  data,
  topN = 8,
  hue = 'primary',
}: IndustryBarsProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);
  const rows = data.slice(0, topN);
  const max = rows[0]?.count ?? 1;
  const color = theme.palette[hue].main;

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No data.
      </Typography>
    );
  }

  return (
    <Box>
      {rows.map((row) => (
        <Accordion
          key={row.industry}
          disableGutters
          elevation={0}
          square
          expanded={expanded === row.industry}
          onChange={(_, open) => setExpanded(open ? row.industry : false)}
          sx={{ bgcolor: 'transparent' }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: 16, opacity: 0.5 }} />}
            sx={{
              px: 0,
              minHeight: 0,
              '& .MuiAccordionSummary-content': { my: 0.6 },
              '& .MuiAccordionSummary-expandIconWrapper': { ml: 0.5 },
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" noWrap sx={{ mr: 1 }}>
                  {row.industry}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.secondary' }}
                >
                  {row.count}
                </Typography>
              </Stack>
              {/* magnitude bar: a thin hairline-radius fill anchored to a track */}
              <Box sx={{ height: 6, borderRadius: 0.5, bgcolor: alpha(color, 0.14) }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${(row.count / max) * 100}%`,
                    borderRadius: 0.5,
                    bgcolor: color,
                  }}
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0.5, pb: 1 }}>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.5}>
              {row.tokens.map((t) => (
                <Ticker key={t} value={t} />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
