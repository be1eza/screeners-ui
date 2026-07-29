import { useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { alpha } from '@mui/material/styles';
import type { IndustryRank } from '@/types';
import IndustryBars from './IndustryBars';
import SectionCard from './SectionCard';

type Polarity = 'up' | 'down';

type BreadthIndustriesCardProps = {
  up: IndustryRank[];
  down: IndustryRank[];
  topN?: number;
};

const SIDES: { key: Polarity; label: string }[] = [
  { key: 'up', label: 'Up' },
  { key: 'down', label: 'Down' },
];

/**
 * Which industries the latest ±20% movers sit in — the composition behind the
 * breadth counts. One card, two sides: the toggle swaps the ranking and carries
 * the polarity hue into the bars, so up and down never read as the same measure.
 */
export default function BreadthIndustriesCard({ up, down, topN }: BreadthIndustriesCardProps) {
  const [side, setSide] = useState<Polarity>('up');
  const data = side === 'up' ? up : down;

  return (
    <SectionCard
      title="20 percenters"
      action={
        <ToggleButtonGroup
          size="small"
          exclusive
          value={side}
          onChange={(_, next: Polarity | null) => next && setSide(next)}
        >
          {SIDES.map(({ key, label }) => (
            <ToggleButton
              key={key}
              value={key}
              sx={(theme) => ({
                px: 1,
                py: 0.25,
                textTransform: 'none',
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  color: theme.palette[key].main,
                  bgcolor: alpha(theme.palette[key].main, 0.14),
                  '&:hover': { bgcolor: alpha(theme.palette[key].main, 0.2) },
                },
              })}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      }
    >
      <IndustryBars data={data} topN={topN} hue={side} />
    </SectionCard>
  );
}
