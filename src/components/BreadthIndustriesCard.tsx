import Typography from '@mui/material/Typography';
import type { IndustryRank } from '@/types';
import IndustryBars from './IndustryBars';
import SectionCard from './SectionCard';

type BreadthIndustriesCardProps = {
  /** Which half of the ±20% move this card ranks — sets the hue and the label. */
  side: 'up' | 'down';
  data: IndustryRank[];
  topN?: number;
};

/**
 * Which industries the latest ±20% movers sit in — the composition behind the
 * breadth counts. One card per side, sitting next to each other so up and down
 * are read together instead of swapped; the polarity rides in the hue and in the
 * label on the title rule, never in a subtitle.
 */
export default function BreadthIndustriesCard({ side, data, topN }: BreadthIndustriesCardProps) {
  return (
    <SectionCard
      title="20% in 5 days"
      action={
        <Typography variant="overline" sx={{ color: `${side}.main`, lineHeight: 1 }}>
          {side}
        </Typography>
      }
    >
      <IndustryBars data={data} topN={topN} hue={side} />
    </SectionCard>
  );
}
