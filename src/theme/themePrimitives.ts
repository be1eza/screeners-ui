import { alpha } from '@mui/material/styles';
import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';
import { brand, gray, polarity, surface } from './colors';

// Semantic diverging pair used for polarity across the app (breadth, movers,
// perf cells). Added as first-class palette tokens so components read them via
// theme.palette.up/down or the 'up.main' / 'down.main' sx strings — never hex.
//
// `raised` is the one *opaque* step off paper (chips, code blocks). Opaque, not an
// alpha tint, because those things sit on banded table rows as often as on plain
// paper and must read identically on both; a palette token rather than a
// per-component `applyStyles('dark')` because only tokens survive the inverted
// sidebar's nested color scheme (see ColorSchemeInverter).
declare module '@mui/material/styles' {
  // Opt the `Theme` type into the CSS-variables surface (`theme.vars`,
  // `theme.applyStyles`) that `createTheme({ cssVariables })` actually returns.
  interface CssThemeVariables {
    enabled: true;
  }
  interface Palette {
    up: PaletteColor;
    down: PaletteColor;
    raised: string;
  }
  interface PaletteOptions {
    up?: PaletteColorOptions;
    down?: PaletteColorOptions;
    raised?: string;
  }
}

/** The attribute MUI hangs each color scheme's CSS variables on. */
export const colorSchemeSelector = 'data-mui-color-scheme';

/**
 * The up/down tokens for one surface. `contrastText` carries that mode's in-bar
 * label ink, so a chart asks the palette for its label color rather than picking a
 * shade of the fill (see `polarity` in colors.ts).
 */
const polarityTokens = (mode: 'light' | 'dark') => ({
  up: {
    main: polarity[mode].up,
    light: brand.upLight,
    dark: brand.upDark,
    contrastText: polarity[mode].ink,
  },
  down: {
    main: polarity[mode].down,
    light: brand.downLight,
    dark: brand.downDark,
    contrastText: polarity[mode].ink,
  },
});

/**
 * No webfont: the OS UI face (SF on macOS, Segoe on Windows) is already the
 * crispest text available at 12–14px, and shipping one would add a network
 * dependency to an app whose whole point is that it owns nothing.
 */
export const fontFamily = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(', ');

/** For anything that must align in a column of characters (the copy preview). */
export const monoFontFamily =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

/**
 * Dense, strictly descending scale. A terminal reads small: body text is 14/13px
 * and the headings stop at 28px, so a card's title and its numbers stay in the
 * same visual family. `overline` is the micro-label (uppercase, wide-tracked)
 * used for section eyebrows and table headers.
 */
export const typography = {
  fontFamily,
  h1: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.021em',
  },
  h2: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.016em',
  },
  h3: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.011em',
  },
  h4: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.006em' },
  h5: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 },
  subtitle1: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.45 },
  subtitle2: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.45 },
  body1: { fontSize: '0.875rem', lineHeight: 1.55 },
  body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
  caption: { fontSize: '0.6875rem', lineHeight: 1.5, letterSpacing: '0.006em' },
  overline: {
    fontSize: '0.625rem',
    fontWeight: 700,
    lineHeight: 1.6,
    letterSpacing: '0.11em',
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0.006em',
    textTransform: 'none' as const,
  },
};

/**
 * Both schemes, defined side by side so the inverted sidebar (which renders the
 * *opposite* scheme in a nested CSS-var scope — see ColorSchemeInverter) gets a
 * fully-specified palette either way. `divider` is the solid hairline, not an
 * alpha of the text color: on a hairline-heavy layout an alpha rule shifts shade
 * with whatever it crosses, which is exactly the mush we're avoiding.
 */
export const colorSchemes = {
  light: {
    palette: {
      primary: {
        main: brand.up,
        light: brand.upLight,
        dark: brand.upDark,
        contrastText: '#fff',
      },
      ...polarityTokens('light'),
      grey: gray,
      raised: gray[100],
      divider: surface.light.hairline,
      background: { default: surface.light.default, paper: surface.light.paper },
      text: { primary: gray[900], secondary: gray[500], disabled: gray[400] },
      action: {
        hover: alpha(gray[500], 0.07),
        selected: alpha(brand.up, 0.1),
        disabledBackground: alpha(gray[500], 0.1),
      },
    },
  },
  dark: {
    palette: {
      primary: {
        main: brand.up,
        light: brand.upLight,
        dark: brand.upDark,
        contrastText: '#fff',
      },
      ...polarityTokens('dark'),
      grey: gray,
      raised: gray[800],
      divider: surface.dark.hairline,
      background: { default: surface.dark.default, paper: surface.dark.paper },
      text: { primary: '#e7ebf3', secondary: '#8b95a9', disabled: gray[500] },
      action: {
        hover: alpha('#ffffff', 0.06),
        selected: alpha(brand.up, 0.18),
        disabledBackground: alpha('#ffffff', 0.09),
      },
    },
  },
};

/** Cards and panels are flat; only things that float get a shadow. */
export const overlayShadow = '0 8px 28px -8px rgba(9, 12, 22, 0.34)';
