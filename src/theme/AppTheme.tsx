import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { colorSchemes, colorSchemeSelector, typography } from './themePrimitives';
import { chartsCustomizations } from './customizations/charts';
import { dataGridCustomizations } from './customizations/dataGrid';
import { surfacesCustomizations } from './customizations/surfaces';

type AppThemeProps = {
  children: ReactNode;
  /** Skip the ThemeProvider (used by nested previews). */
  disableCustomTheme?: boolean;
};

/**
 * Port of the MUI Dashboard template's shared-theme entry point: CSS variables
 * for both schemes plus the `customizations/` component overrides.
 *
 * `noSsr` matters here beyond the usual perf note — this app is client-rendered
 * only, and it makes `useColorScheme()` report the resolved scheme on the *first*
 * render instead of `undefined`, which is what lets the inverted sidebar come up
 * already flipped rather than correcting itself a frame later.
 */
export default function AppTheme({ children, disableCustomTheme }: AppThemeProps) {
  const theme = useMemo(
    () =>
      disableCustomTheme
        ? createTheme()
        : createTheme({
            cssVariables: { colorSchemeSelector },
            colorSchemes,
            typography,
            shape: { borderRadius: 8 },
            components: {
              ...surfacesCustomizations,
              ...dataGridCustomizations,
              ...chartsCustomizations,
            },
          }),
    [disableCustomTheme],
  );

  if (disableCustomTheme) return <>{children}</>;

  return (
    <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange noSsr>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
