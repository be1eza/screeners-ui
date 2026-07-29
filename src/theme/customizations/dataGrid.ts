import '@mui/x-data-grid/themeAugmentation';
import { alpha } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';

/**
 * Every grid in the app is a quote board: rules off, tint on. Rows are separated
 * by an alternating wash of the brand hue instead of borders, so the eye tracks a
 * row by its band rather than by lines, and the tints are alpha over paper so
 * they hold in both schemes. Headers are micro-labels — quieter than the numbers
 * they label, which is the whole point of a data panel.
 *
 * Banding is opt-in per grid via `getRowClassName` → `row-band` on odd rows;
 * following the *rendered* order means it survives sorting, which an nth-child
 * rule would not with virtualized rows.
 */
export const dataGridCustomizations: Components<Theme> = {
  MuiDataGrid: {
    defaultProps: {
      rowHeight: 36,
      columnHeaderHeight: 34,
      disableColumnMenu: true,
      disableRowSelectionOnClick: true,
      hideFooter: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        border: 0,
        // Kill every rule the grid draws: cell, row, header and column separators.
        '--DataGrid-rowBorderColor': 'transparent',
        '& .MuiDataGrid-cell, & .MuiDataGrid-filler, & .MuiDataGrid-columnHeaders': {
          borderBottom: 'none',
          borderTop: 'none',
        },
        '& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnSeparator': { borderRight: 'none' },
        '& .MuiDataGrid-columnSeparator': { display: 'none' },
        [[
          '& .MuiDataGrid-cell:focus',
          '& .MuiDataGrid-cell:focus-within',
          '& .MuiDataGrid-columnHeader:focus',
          '& .MuiDataGrid-columnHeader:focus-within',
        ].join(', ')]: { outline: 'none' },

        '& .MuiDataGrid-columnHeaders': { background: 'transparent' },
        '& .MuiDataGrid-columnHeaderTitle': {
          ...theme.typography.overline,
          color: (theme.vars || theme).palette.text.secondary,
        },

        '& .MuiDataGrid-cell': { fontSize: '0.8125rem' },

        // The one rule the grid is allowed to draw: `group-start` on a column
        // (cell + header) fences off a new group of measures. Rows are contiguous,
        // so the per-cell borders stack into one continuous hairline down the table.
        '& .group-start': {
          borderLeft: '1px solid',
          borderLeftColor: (theme.vars || theme).palette.divider,
        },

        '& .MuiDataGrid-row': { borderRadius: 6 },
        '& .row-band': { backgroundColor: alpha(theme.palette.primary.main, 0.045) },
        '& .MuiDataGrid-row:hover, & .row-band:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
      }),
    },
  },
};
