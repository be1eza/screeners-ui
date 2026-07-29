import type { IndustryRank } from '@/types';
import IndustryBars, { type BarHue } from './IndustryBars';
import SectionCard from './SectionCard';

type IndustryDominationCardProps = {
  title: string;
  data: IndustryRank[];
  topN?: number;
  hue?: BarHue;
};

/** A titled ranking of the industries dominating one screener set. */
export default function IndustryDominationCard({
  title,
  data,
  topN,
  hue,
}: IndustryDominationCardProps) {
  return (
    <SectionCard title={title}>
      <IndustryBars data={data} topN={topN} hue={hue} />
    </SectionCard>
  );
}
