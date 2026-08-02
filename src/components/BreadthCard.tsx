import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  BarLabel,
  barElementClasses,
  barLabelClasses,
} from '@mui/x-charts/BarChart';
import type { BarLabelProps } from '@mui/x-charts/BarChart';
import type { AxisConfig, ChartsXAxisProps } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useHighlighted } from '@mui/x-charts/context';
import { useDrawingArea } from '@mui/x-charts/hooks';
import type { BreadthPoint } from '@/types';
import { usePolarity } from '@/theme/usePolarity';
import SectionCard from './SectionCard';

/** Air between a bar's top edge and the digits sitting above it. */
const LABEL_GAP = 5;

/**
 * A live react-spring value. x-charts types `style.y` as the plain SVG attribute,
 * but at runtime it's whatever the label's transition is animating — so narrow to
 * the one method we need (`to`, which derives a value from it) instead of guessing.
 */
type Fluid = { to: (interpolate: (value: number) => number) => unknown };

function isFluid(value: unknown): value is Fluid {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'to') === 'function'
  );
}

/**
 * Labels sit *above* their bars rather than inside them: at slab width the digits
 * were riding on the fill, which needed a contrasting ink and still fought the hue.
 * Outside, they read as the axis does — one quiet secondary ink for both poles,
 * leaving the fill to carry the polarity on its own (see `charts.ts` for the ink).
 *
 * x-charts centres a bar label: `y` = barTop + barHeight/2. Columns grow from the
 * zero baseline at the bottom of the plot, so barHeight = baseline − barTop and
 * therefore barTop = 2y − baseline — which lifts the label with only the `y` spring,
 * animation intact. `style.y` is a react-spring value on mount, a plain number when
 * animation is skipped, hence the `to` check.
 *
 * Hovering a bar brings both of that date's counts up to full-strength ink — the whole
 * band, keyed on `dataIndex`, because the two series share it. That's a per-index state,
 * so it can't live in the theme the way the resting ink does.
 */
function BreadthBarLabel(props: BarLabelProps) {
  const theme = useTheme();
  const { top, height } = useDrawingArea();
  const { highlightedItem } = useHighlighted();
  const baseline = top + height;
  const lift = (barCentre: number) => 2 * barCentre - baseline - LABEL_GAP;

  const y: unknown = props.style?.y;
  const lifted = isFluid(y) ? y.to(lift) : typeof y === 'number' ? lift(y) : y;
  const lit = highlightedItem?.dataIndex === props.dataIndex;

  return (
    <BarLabel
      {...props}
      style={{
        ...props.style,
        // Cast back: the attribute type says `number`; a spring value stands in for one.
        y: lifted as number,
        ...(lit && { fill: (theme.vars || theme).palette.text.primary }),
      }}
    />
  );
}

type BreadthCardProps = {
  data: BreadthPoint[];
  /** Dates with a complete page bundle; older breadth-only bars remain context. */
  selectableDates: readonly string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

/**
 * The band axis pinned to `'band'` rather than the union of every scale name.
 * x-charts types the `xAxis` prop over all scales at once, and `Omit` across that
 * union keeps only the keys they share — which drops band-only props like
 * `categoryGapRatio`. Naming the scale puts them back.
 */
type BandAxis = Partial<AxisConfig<'band', string, ChartsXAxisProps>>;

/** Number of dated vault readings shown at once. */
const WINDOW_SIZE = 30;
const MIN_PLOT_WIDTH = 320;
const MIN_BAND_WIDTH = 40;

const SELECTED_LABEL_CLASS = 'BreadthCard-selectedLabel';
const UNSELECTABLE_BAR_CLASS = 'BreadthCard-unselectableBar';
const UNSELECTABLE_LABEL_CLASS = 'BreadthCard-unselectableLabel';

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
      <Box
        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }}
      />
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
 * The window shows a stable block of up to 30 snapshots around the page's selected
 * date. Clicking either bar selects that date for the entire page without moving the
 * block; long-range navigation lives in the page-level snapshot navigator.
 */
export default function BreadthCard({
  data,
  selectableDates,
  selectedDate,
  onSelectDate,
}: BreadthCardProps) {
  const { up, down } = usePolarity();
  const chartViewportRef = useRef<HTMLDivElement>(null);
  // Which band the pointer is on, so its date can answer with the counts above it.
  const [hovered, setHovered] = useState<number | null>(null);

  const visible = data.slice(-WINDOW_SIZE);
  const selectable = useMemo(() => new Set(selectableDates), [selectableDates]);
  const selectedVisibleIndex = visible.findIndex((point) => point.date === selectedDate);
  const selected = (selectedVisibleIndex >= 0
    ? visible[selectedVisibleIndex]
    : visible.at(-1)) ?? {
    up: 0,
    down: 0,
    date: '',
  };
  const plotMinWidth = Math.max(MIN_PLOT_WIDTH, visible.length * MIN_BAND_WIDTH);

  useEffect(() => {
    const viewport = chartViewportRef.current;
    if (!viewport || selectedVisibleIndex < 0 || visible.length === 0) return;

    const frame = window.requestAnimationFrame(() => {
      const selectedCentre =
        ((selectedVisibleIndex + 0.5) / visible.length) * viewport.scrollWidth;
      viewport.scrollTo({
        left: Math.max(0, selectedCentre - viewport.clientWidth / 2),
        behavior: 'auto',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedDate, selectedVisibleIndex, visible.length]);

  // Highest selected-date count on top.
  const counts = [
    { key: 'up', value: selected.up, color: up },
    { key: 'down', value: selected.down, color: down },
  ].sort((a, b) => b.value - a.value);

  const xAxis: BandAxis[] = [
    {
      scaleType: 'band',
      data: visible.map((d) => dayMonth(d.date)),
      // Keep the baseline (bars grow from it) but drop the tick marks.
      disableTicks: true,
      // Treat each date as one visual unit: the two poles nearly touch inside
      // their date band, while most of the air sits between adjacent dates.
      categoryGapRatio: 0.3,
      barGapRatio: 0.03,
    },
  ];

  return (
    <SectionCard
      title="20% in 5 days"
      action={
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <KeyDot label="Up" color={up} />
            <KeyDot label="Down" color={down} />
          </Stack>
        </Stack>
      }
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="stretch"
        spacing={{ xs: 1.5, sm: 2.5 }}
      >
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={{ xs: 2, sm: 2 }}
          justifyContent="center"
          // Centred on both axes: `justifyContent` down the column, `alignItems`
          // across it, so the pair sits in the middle of the fenced-off box rather
          // than hugging the hairline.
          alignItems="center"
          sx={{
            pr: { xs: 0, sm: 2.5 },
            pb: { xs: 1.5, sm: 0 },
            borderRight: { xs: 0, sm: '1px solid' },
            borderBottom: { xs: '1px solid', sm: 0 },
            borderColor: 'divider',
          }}
        >
          {counts.map((c) => (
            <CountStat key={c.key} value={c.value} color={c.color} />
          ))}
        </Stack>
        <Box
          ref={chartViewportRef}
          role="region"
          tabIndex={0}
          aria-label={`20 percent in 5 days breadth across ${visible.length} dated readings. Scroll horizontally to inspect dates; dimmed bars have breadth data only.`}
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            overflowX: 'auto',
            overflowY: 'hidden',
            overscrollBehaviorX: 'contain',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          <Box sx={{ width: '100%', minWidth: plotMinWidth }}>
            <BarChart
              aria-hidden="true"
              height={216}
              // 4px rounded cap, square where it meets the baseline.
              borderRadius={4}
              xAxis={xAxis}
              // The selected date stays labelled; another pair appears only while
              // its date is being inspected by hover.
              leftAxis={null}
              series={[
                { id: 'up', label: 'Up', data: visible.map((d) => d.up), color: up },
                {
                  id: 'down',
                  label: 'Down',
                  data: visible.map((d) => d.down),
                  color: down,
                },
              ]}
              barLabel={(item) =>
                item.value != null &&
                (item.dataIndex === selectedVisibleIndex || item.dataIndex === hovered)
                  ? String(item.value)
                  : null
              }
              slots={{ barLabel: BreadthBarLabel }}
              // The header carries the key instead — it survives at any plot width.
              slotProps={{
                legend: { hidden: true },
                bar: ({ dataIndex }) => {
                  const point = visible[dataIndex];
                  const unavailable = point && !selectable.has(point.date);

                  return {
                    className: unavailable ? UNSELECTABLE_BAR_CLASS : undefined,
                  };
                },
                barLabel: ({ dataIndex }) => {
                  const point = visible[dataIndex];
                  const classes = [
                    dataIndex === selectedVisibleIndex ? SELECTED_LABEL_CLASS : '',
                    point && !selectable.has(point.date) ? UNSELECTABLE_LABEL_CLASS : '',
                  ].filter(Boolean);

                  return {
                    className: classes.length > 0 ? classes.join(' ') : undefined,
                  };
                },
              }}
              // No tooltip or highlight wash: hovering reveals that date's two labels,
              // while the bars and surrounding plot stay visually still.
              tooltip={{ trigger: 'none' }}
              axisHighlight={{ x: 'none' }}
              onAxisClick={(_event, axis) => {
                const point = axis ? visible[axis.dataIndex] : undefined;
                if (point && selectable.has(point.date)) onSelectDate(point.date);
              }}
              // The reply to a hover instead: the band's counts and its date come up to
              // full-strength ink and everything else stays put. Nothing moves, nothing
              // is covered, and the numbers you're reading are the ones that brighten.
              onHighlightChange={(item) => setHovered(item?.dataIndex ?? null)}
              sx={(theme) => ({
                touchAction: 'pan-x pan-y',
                cursor: 'pointer',
                [`& .${barElementClasses.root}.${UNSELECTABLE_BAR_CLASS}`]: {
                  cursor: 'not-allowed',
                  opacity: 0.55,
                },
                [`& .${barLabelClasses.root}.${SELECTED_LABEL_CLASS}`]: {
                  fill: (theme.vars || theme).palette.text.primary,
                  fontWeight: 700,
                },
                [`& .${barLabelClasses.root}.${UNSELECTABLE_LABEL_CLASS}`]: {
                  fill: (theme.vars || theme).palette.text.disabled,
                },
                ...(selectedVisibleIndex >= 0 && {
                  [`& .${axisClasses.tickContainer}:nth-of-type(${selectedVisibleIndex + 1}) .${axisClasses.tickLabel}`]:
                    {
                      fill: (theme.vars || theme).palette.text.primary,
                      fontWeight: 700,
                    },
                }),
                // Band ticks come off the axis domain in order, so tick container n is
                // data index n. Matching printed text would light repeated dates once
                // the history spans more than a year.
                ...(hovered !== null && {
                  [`& .${axisClasses.tickContainer}:nth-of-type(${hovered + 1}) .${axisClasses.tickLabel}`]:
                    { fill: (theme.vars || theme).palette.text.primary },
                }),
              })}
              // The digits sit above the tallest bar, which can reach the plot's top.
              margin={{
                top: 22,
                right: 4,
                bottom: 24,
                left: 4,
              }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              p: 0,
              m: -1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            <table>
              <caption>20 percent in 5 days breadth values</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Up</th>
                  <th scope="col">Down</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((point) => (
                  <tr key={point.date}>
                    <th scope="row">
                      {point.date}
                      {point.date === selectedDate ? ' (selected)' : ''}
                      {!selectable.has(point.date) ? ' (breadth only)' : ''}
                    </th>
                    <td>{point.up}</td>
                    <td>{point.down}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      </Stack>
    </SectionCard>
  );
}
