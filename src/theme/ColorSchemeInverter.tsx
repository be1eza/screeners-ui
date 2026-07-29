import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { colorSchemeSelector } from './themePrimitives';

type ColorSchemeInverterProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * Renders its subtree in the **opposite** color scheme: a dark panel when the app
 * is light, a light panel when the app is dark.
 *
 * How: MUI emits each scheme's CSS variables under an attribute selector
 * (`[data-mui-color-scheme="dark"] { --mui-palette-… }`), and an attribute
 * selector matches *any* element — not just `<html>`. Setting the attribute here
 * re-declares the whole palette on this Box, and everything inside inherits it.
 * The emitted rule carries the CSS `color-scheme` property too, so native bits
 * (scrollbars, focus rings) flip with it.
 *
 * The one rule for anything rendered inside: **read colors through variables** —
 * sx palette strings (`bgcolor: 'background.paper'`), `theme.vars.palette.…`, or
 * palette tokens. A static `theme.palette.x` is baked at theme-creation time and
 * `theme.applyStyles('dark', …)` keys off an *ancestor* attribute, so both would
 * report the page's scheme rather than this one.
 */
export default function ColorSchemeInverter({ children, sx }: ColorSchemeInverterProps) {
  const { colorScheme } = useColorScheme();
  const inverted = colorScheme === 'dark' ? 'light' : 'dark';

  return (
    <Box
      {...{ [colorSchemeSelector]: inverted }}
      // `color` is set here, not left to the caller: text color *inherits* as a
      // computed value, so an ancestor that already resolved `text.primary` in the
      // page's scheme would hand its ink down into this one. Re-resolving it on the
      // element that carries the attribute is what re-anchors inheritance.
      sx={[{ color: 'text.primary' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
}
