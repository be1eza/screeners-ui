/**
 * Brand color tokens — the single source of truth for the app's hues. Components
 * never hard-code hex (see CLAUDE.md); they read these through the MUI palette
 * (`theme.palette.up.main`, or the `'up.main'` sx string) wired up in AppTheme.
 *
 * `up`/`down` are a validated diverging pair (blue ↔ pink, CVD-safe on both light
 * and dark surfaces). The `light` steps are the "extreme" variants; `accent`/
 * `positive` are held for future encodings (e.g. heat, secondary series).
 */
export const brand = {
  background: '#0e111c',
  up: '#377ffc', // reference up hue — the app accent (palette.primary)
  down: '#bf3d91', // reference down hue
  upDark: '#0d2f80', // dark blue — the `up.dark` step
  downDark: '#7a1f58', // dark pink — the `down.dark` step
  upLight: '#a3cdff', // extreme up
  downLight: '#ff6dc7', // extreme down
  accentDark: '#ff9933', // "yellow dark"
  accentLight: '#ffcc99', // "yellow light"
  positiveDark: '#006064', // "green dark"
  positiveLight: '#66bb6a', // "green light"
} as const;

/**
 * The polarity fills, **stepped per surface instead of shared**. One pair can't
 * serve both: the reference hues each fail WCAG 4.5:1 as text on one of the two
 * surfaces (`#377ffc` is 3.75 on white, `#bf3d91` is 3.54 on `#141a2a`), so
 * whichever mode you're in, one pole was always the weak one. These steps hold the
 * same two hues and clear 4.5 on their own surface.
 *
 * `ink` is the label color for text set *inside* a fill (the breadth bar labels) —
 * white or near-black, chosen by the fills' luminance, so one value clears 4.5:1 on
 * both poles of that mode. It is NOT a shade of the fill's own hue: same-hue ink is
 * what made those labels muddy. Wired as `contrastText` on the up/down tokens.
 *
 * Both pairs pass all six checks of the dataviz skill's `validate_palette.js`
 * against their own surface (light ΔE 16.5 deutan, dark ΔE 13.9 protan).
 */
export const polarity = {
  light: { up: '#2f6ae0', down: '#a83280', ink: '#ffffff' },
  dark: { up: '#5490fa', down: '#d45ba6', ink: '#0e111c' },
} as const;

/**
 * The structural ramp: surfaces, hairlines, ink. Deliberately blue-tinted so it
 * sits *with* `brand.background` instead of fighting it — 900 **is** the dark
 * paper, and the dark page background is one step below it. Installed as MUI's
 * `palette.grey`, so `grey[100]` / `grey[800]` resolve to these in either scheme.
 */
export const gray = {
  50: '#f7f8fa',
  100: '#eceff4',
  200: '#dde2eb',
  300: '#c3cad8',
  400: '#98a1b3',
  500: '#6c7589',
  600: '#4b5468',
  700: '#2f3749',
  800: '#1e2434',
  900: '#141a2a',
} as const;

/**
 * Per-scheme surfaces. `hairline` is the 1px rule that does the crisp work:
 * a solid, slightly-cool line rather than an alpha wash, so borders stay exactly
 * as sharp over a card as over the page.
 */
export const surface = {
  light: { default: '#f5f6f9', paper: '#ffffff', hairline: '#e3e7ef' },
  dark: { default: brand.background, paper: gray[900], hairline: '#242c40' },
} as const;

/** A dark paper surface a touch lighter than the page background, for cards. */
export const backgroundPaper = surface.dark.paper;
