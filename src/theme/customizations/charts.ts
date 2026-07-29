import '@mui/x-charts/themeAugmentation';
import type { Components, Theme } from '@mui/material/styles';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { overlayShadow } from '../themePrimitives';

/**
 * Charts follow the same rule as the grids: the data draws itself and the
 * scaffolding gets out of the way. Axis ink is secondary-weight and small,
 * lines and ticks are hairlines, bar labels are compact bold digits.
 */
export const chartsCustomizations: Components<Theme> = {
  MuiChartsAxis: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${axisClasses.tickLabel}`]: {
          fill: (theme.vars || theme).palette.text.secondary,
          fontSize: '0.6875rem',
          fontWeight: 500,
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

  MuiBarLabel: {
    styleOverrides: {
      root: { fontSize: '0.625rem', fontWeight: 700 },
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
