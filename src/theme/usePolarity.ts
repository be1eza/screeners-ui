import { useColorScheme } from '@mui/material/styles';
import { polarity } from './colors';

/** Widened off the `as const` tokens — the two modes are different literals. */
type Polarity = { up: string; down: string; ink: string };

/**
 * The resolved up/down fills (and their contrast ink) for the *current* scheme.
 *
 * Needed because `theme.palette.up.main` is baked to the default (light) scheme at
 * theme-creation time — fine for sx, which resolves through `theme.vars` to a CSS
 * variable, but not for an SVG chart that wants a real color it can compute with.
 * So: read the scheme, hand back concrete hex.
 */
export function usePolarity(): Polarity {
  const { colorScheme } = useColorScheme();
  return polarity[colorScheme === 'dark' ? 'dark' : 'light'];
}
