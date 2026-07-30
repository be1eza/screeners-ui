import '@mui/x-charts/themeAugmentation';
import type { Components, Theme } from '@mui/material/styles';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { overlayShadow } from '../themePrimitives';

/**
 * Charts follow the same rule as the grids: the data draws itself and the
 * scaffolding gets out of the way. Axis ink is secondary-weight and small,
 * lines and ticks are hairlines, and bar labels read as part of that same scaffolding.
 */
export const chartsCustomizations: Components<Theme> = {
  MuiChartsAxis: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${axisClasses.tickLabel}`]: {
          fill: (theme.vars || theme).palette.text.secondary,
          fontSize: '0.6875rem',
          fontWeight: 500,
          // So a chart that brightens one tick on hover (BreadthCard) fades into it,
          // the way the bar labels already do — the property has to carry the
          // transition at rest, or only the way in would animate.
          transition: 'fill 0.2s ease-in',
        },
        [`& .${axisClasses.label}`]: {
          fill: (theme.vars || theme).palette.text.secondary,
          fontSize: '0.6875rem',
        },
        [`& .${axisClasses.line}, & .${axisClasses.tick}`]: {
          stroke: (theme.vars || theme).palette.divider,
        },
      }),
    },
  },

  // Bar labels sit above their bars (BreadthCard lifts them), so they're axis ink,
  // not in-fill ink: the same secondary color and size as a tick label, and anchored
  // by their own baseline rather than centred, so the gap above the bar is the gap
  // you set.
  MuiBarLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        fill: (theme.vars || theme).palette.text.secondary,
        fontSize: '0.6875rem',
        fontWeight: 600,
        dominantBaseline: 'auto',
      }),
    },
  },

  // Solid hairlines, one step off the surface — never dashed, which reads as
  // "threshold" or "projection" when it's just a grid.
  MuiChartsGrid: {
    styleOverrides: {
      line: ({ theme }) => ({ stroke: (theme.vars || theme).palette.divider }),
    },
  },

  MuiChartsTooltip: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 8,
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
        boxShadow: overlayShadow,
        fontSize: '0.75rem',
      }),
    },
  },
};
