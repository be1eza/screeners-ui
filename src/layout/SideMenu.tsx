import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import ColorSchemeInverter from '@/theme/ColorSchemeInverter';
import BrandMark from './BrandMark';
import MenuContent from './MenuContent';
import VaultLink from './VaultLink';

export const SIDEBAR_WIDTH = 232;

/**
 * The permanent desktop sidebar — and the app's one deliberate deviation from the
 * template's chrome: it renders the **inverted** color scheme, so the rail is dark
 * against a light page and light against a dark one. Navigation and data then read
 * as two different materials, which is the trick that keeps a dense dashboard
 * legible: you never have to work out whether a panel is chrome or content.
 *
 * The Drawer paper is stripped to a transparent, border-less shell; the inverter
 * inside paints the surface, because only an element carrying the color-scheme
 * attribute resolves its own variables in the flipped scheme.
 */
export default function SideMenu() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
      }}
      slotProps={{
        paper: {
          sx: {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 0,
            bgcolor: 'transparent',
          },
        },
      }}
    >
      <ColorSchemeInverter
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
          <BrandMark />
        </Box>
        <MenuContent />
        <VaultLink />
      </ColorSchemeInverter>
    </Drawer>
  );
}
