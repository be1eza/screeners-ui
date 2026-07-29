import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorSchemeInverter from '@/theme/ColorSchemeInverter';
import BrandMark from './BrandMark';
import MenuContent from './MenuContent';
import VaultLink from './VaultLink';

type SideMenuMobileProps = {
  open: boolean;
  onClose: () => void;
};

/** The same rail as SideMenu, as a temporary drawer under the `md` breakpoint. */
export default function SideMenuMobile({ open, onClose }: SideMenuMobileProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{ display: { xs: 'block', md: 'none' } }}
      slotProps={{
        paper: { sx: { width: 268, border: 0, bgcolor: 'transparent' } },
      }}
    >
      <ColorSchemeInverter
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ p: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <BrandMark />
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={onClose} aria-label="Close navigation">
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
        <MenuContent onNavigate={onClose} />
        <VaultLink />
      </ColorSchemeInverter>
    </Drawer>
  );
}
