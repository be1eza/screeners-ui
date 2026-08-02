import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ColorModeIconDropdown from '@/theme/ColorModeIconDropdown';
import BrandMark from './BrandMark';
import SideMenuMobile from './SideMenuMobile';

export const MOBILE_APP_NAVBAR_HEIGHT = 48;

/** Mobile-only top bar: opens the rail as a drawer, and carries the mode switch. */
export default function AppNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        component="header"
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          alignItems: 'center',
          height: MOBILE_APP_NAVBAR_HEIGHT,
          gap: 1,
          px: 1.5,
          py: 1,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <MenuRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <BrandMark />
        <Box sx={{ flex: 1 }} />
        <ColorModeIconDropdown />
      </Box>
      <SideMenuMobile open={open} onClose={() => setOpen(false)} />
    </>
  );
}
