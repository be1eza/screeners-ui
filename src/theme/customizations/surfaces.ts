import { alpha } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';
import { gray } from '../colors';
import { overlayShadow } from '../themePrimitives';

/**
 * The crisp pass, applied once at the theme instead of per component: flat
 * surfaces separated by 1px hairlines, tight radii, no elevation except on
 * things that genuinely float (menus, tooltips). Numbers are tabular app-wide —
 * every figure on the page sits in a column that doesn't wobble when it changes.
 */
export const surfacesCustomizations: Components<Theme> = {
  MuiCssBaseline: {
    // `gray` straight from the tokens rather than `theme.vars.palette.grey`:
    // `alpha()` needs a parseable color and a CSS variable isn't one. Safe here
    // because the ramp is deliberately scheme-independent — a mid-grey at half
    // opacity reads on either surface, which is why the thumb can be one value.
    styleOverrides: {
      body: {
        fontVariantNumeric: 'tabular-nums',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      // Overlay scrollbars: a wall of data shouldn't be framed by chrome.
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${alpha(gray[500], 0.5)} transparent`,
      },
      '*::-webkit-scrollbar': { width: 10, height: 10 },
      '*::-webkit-scrollbar-track': { background: 'transparent' },
      '*::-webkit-scrollbar-thumb': {
        // Inset via a transparent border so the thumb reads as a thin pill.
        border: '3px solid transparent',
        borderRadius: 8,
        backgroundClip: 'content-box',
        backgroundColor: alpha(gray[500], 0.5),
      },
      '*::-webkit-scrollbar-thumb:hover': { backgroundColor: alpha(gray[500], 0.8) },
    },
  },

  MuiPaper: {
    styleOverrides: { root: { backgroundImage: 'none' } },
  },

  MuiCard: {
    defaultProps: { variant: 'outlined' },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        borderColor: (theme.vars || theme).palette.divider,
        boxShadow: 'none',
        backgroundImage: 'none',
      }),
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: { padding: 14, '&:last-child': { paddingBottom: 14 } },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 6 },
      sizeSmall: { padding: '3px 10px' },
      outlined: ({ theme }) => ({ borderColor: (theme.vars || theme).palette.divider }),
    },
  },

  MuiIconButton: {
    styleOverrides: { root: { borderRadius: 6 } },
  },

  MuiToggleButtonGroup: {
    styleOverrides: {
      grouped: ({ theme }) => ({ borderColor: (theme.vars || theme).palette.divider }),
    },
  },

  MuiToggleButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        textTransform: 'none',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '2px 9px',
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 6, fontWeight: 500 },
      sizeSmall: { height: 20, fontSize: '0.6875rem' },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({ borderColor: (theme.vars || theme).palette.divider }),
    },
  },

  MuiTooltip: {
    defaultProps: { arrow: true },
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        fontSize: '0.6875rem',
        fontWeight: 500,
        padding: '4px 8px',
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        fontSize: '0.8125rem',
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
      }),
    },
  },

  MuiPopover: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 8,
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
        boxShadow: overlayShadow,
      }),
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: { borderRadius: 6, fontSize: '0.8125rem', minHeight: 32, margin: '0 4px' },
    },
  },

  MuiAccordion: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: 'none',
        '&:before': { display: 'none' },
      },
    },
  },

  MuiLink: {
    defaultProps: { underline: 'hover' },
    styleOverrides: { root: { fontWeight: 500 } },
  },
};
