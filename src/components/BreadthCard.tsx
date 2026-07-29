import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { BarChart, BarLabel } from '@mui/x-charts/BarChart';
import type { BarLabelProps } from '@mui/x-charts/BarChart';
import type { AxisConfig, ChartsXAxisProps } from '@mui/x-charts';
import type { BreadthPoint } from '@/types';
import { usePolarity } from '@/theme/usePolarity';
import SectionCard from './SectionCard';

/**
 * Bar-label ink: one value for both series — white or near-black by the fills'
 * luminance, so it clears 4.5:1 on either pole. Not a dark shade of each bar's own
 * hue, which is same-hue-on-hue and read as mud at both ends.
 */
function BreadthBarLabel(props: BarLabelProps) {
  const { ink } = usePolarity();
  return <BarLabel {...props} style={{ ...props.style, fill: ink }} />;
}

type BreadthCardProps = {
  data: BreadthPoint[];
};

/**
 * The band axis pinned to `'band'` rather than the union of every scale name.
 * x-charts types the `xAxis` prop over all scales at once, and `Omit` across that
 * union keeps only the keys they share — which drops band-only props like
 * `categoryGapRatio`. Naming the scale puts them back.
 */
type BandAxis = Partial<AxisConfig<'band', string, ChartsXAxisProps>>;

/** Snapshots in view. `'all'` is the whole history the vault has. */
type Range = 30 | 90 | 'all';

const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: '30' },
  { value: 90, label: '90' },
  { value: 'all', label: 'All' },
];

/** The narrowest range — below this much history there's nothing to pan or zoom. */
const MIN_RANGE = 30;

/**
 * Past this many columns an in-bar label has no room, so the values move to the
 * y-axis instead. Labelling every bar *and* showing an axis is redundant; doing
 * neither would leave the tooltip as the only way to read a value.
 */
const MAX_LABELLED = 12;

/** ISO `YYYY-MM-DD` → European `D/M` (e.g. "2026-07-27" → "27/7"). */
function dayMonth(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${Number(day)}/${Number(month)}`;
}

/**
 * Latest count in view, carried entirely by the hue of its own polarity. The key in
 * the card header says which hue is which, so these don't repeat it.
 */
function CountStat({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{ minWidth: 76 }}>
      <Typography
        component="p"
        sx={{
          fontSize: '1.875rem',
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          color,
          textAlign: 'center',
          // Opt out of the app-wide tabular figures: equal-width digits make a
          // standalone number this size read loose. Tabular is for columns.
          fontVariantNumeric: 'normal',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/** A dot in the series hue plus its name — the legend, inline in the header. */
function KeyDot({ label, color }: { label: string; color: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.625}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Stack>
  );
}

/**
 * Weekly breadth: names up ≥20% against names down ≥20%, over the vault's dated
 * snapshots, as **grouped** columns — the two counts side by side per date, both
 * growing from one baseline, so the day's balance is a direct height comparison.
 *
 * Because the poles no longer sit on opposite sides of a zero line, position stops
 * carrying the polarity and hue becomes the only thing distinguishing them — which
 * is why the header carries a key. Without it the chart would be color-alone.
 *
 * The window shows the newest 30 snapshots by default and pans back through
 * history; the vault keeps every dated CSV, so the range grows on its own. Note the
 * unit is *snapshots*, not calendar days — the vault only writes on fetch days, so
 * "30" is 30 readings, which is why the toggle is unlabelled rather than "30D".
 */
export default function BreadthCard({ data }: BreadthCardProps) {
  const { up, down } = usePolarity();
  const [range, setRange] = useState<Range>(30);
  // Snapshots back from the newest. 0 == showing the most recent window.
  const [offset, setOffset] = useState(0);

  const size = range === 'all' ? data.length : Math.min(range, data.length);
  const maxOffset = Math.max(0, data.length - size);
  const clamped = Math.min(offset, maxOffset);
  const start = maxOffset - clamped;
  const visible = data.slice(start, start + size);
  const labelled = visible.length <= MAX_LABELLED;

  // Half a window per press: enough to move, little enough to keep your bearings.
  const step = Math.max(1, Math.floor(size / 2));
  const panBack = () => setOffset(Math.min(clamped + step, maxOffset));
  const panForward = () => setOffset(Math.max(clamped - step, 0));

  const changeRange = (next: Range) => {
    // Hold the reader's position where the new range still reaches it, rather
    // than snapping back to "now" on every zoom.
    const nextSize = next === 'all' ? data.length : Math.min(next, data.length);
    setOffset(Math.min(clamped, Math.max(0, data.length - nextSize)));
    setRange(next);
  };

  const latest = visible.at(-1) ?? { up: 0, down: 0, date: '' };
  // Highest count on top.
  const counts = [
    { key: 'up', value: latest.up, color: up },
    { key: 'down', value: latest.down, color: down },
  ].sort((a, b) => b.value - a.value);

  const xAxis: BandAxis[] = [
    {
      scaleType: 'band',
      data: visible.map((d) => dayMonth(d.date)),
      // Keep the baseline (bars grow from it) but drop the tick marks.
      disableTicks: true,
      // Most of each band is air, and the pair inside it is split by a real gap:
      // saturated fills read loud at slab width however good the hue is.
      categoryGapRatio: 0.6,
      barGapRatio: 0.3,
    },
  ];

  return (
    <SectionCard
      title="20 percenters"
      action={
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <KeyDot label="Up" color={up} />
            <KeyDot label="Down" color={down} />
          </Stack>
          {/* Hidden until there's more history than the narrowest window — dead
              controls that can't move anything are worse than no controls. */}
          {data.length > MIN_RANGE && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={range}
                onChange={(_, next: Range | null) => next !== null && changeRange(next)}
              >
                {RANGES.map(({ value, label }) => (
                  <ToggleButton key={String(value)} value={value}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Stack direction="row">
                <Tooltip title="Earlier snapshots">
                  <IconButton size="small" onClick={panBack} disabled={clamped >= maxOffset}>
                    <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Later snapshots">
                  <IconButton size="small" onClick={panForward} disabled={clamped === 0}>
                    <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          )}
        </Stack>
      }
    >
      <Stack direction="row" alignItems="stretch" spacing={2.5}>
        <Stack
          spacing={2}
          justifyContent="center"
          // Centred on both axes: `justifyContent` down the column, `alignItems`
          // across it, so the pair sits in the middle of the fenced-off box rather
          // than hugging the hairline.
          alignItems="center"
          sx={{ pr: 2.5, borderRight: '1px solid', borderColor: 'divider' }}
        >
          {counts.map((c) => (
            <CountStat key={c.key} value={c.value} color={c.color} />
          ))}
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BarChart
            height={216}
            // 4px rounded cap, square where it meets the baseline.
            borderRadius={4}
            xAxis={xAxis}
            // Values live either on the bars or on the axis, never both and never
            // neither — see MAX_LABELLED. When the axis carries them it's ticks
            // only; the horizontal grid does the reaching-across, not a rule.
            leftAxis={labelled ? null : { disableLine: true, disableTicks: true }}
            grid={labelled ? undefined : { horizontal: true }}
            series={[
              { id: 'up', label: 'Up', data: visible.map((d) => d.up), color: up },
              { id: 'down', label: 'Down', data: visible.map((d) => d.down), color: down },
            ]}
            barLabel={labelled ? (item) => (item.value ? String(item.value) : null) : undefined}
            slots={{ barLabel: BreadthBarLabel }}
            // The header carries the key instead — it survives at any plot width.
            slotProps={{ legend: { hidden: true } }}
            margin={{ top: 12, right: 4, bottom: 24, left: labelled ? 4 : 34 }}
          />
        </Box>
      </Stack>
    </SectionCard>
  );
}
