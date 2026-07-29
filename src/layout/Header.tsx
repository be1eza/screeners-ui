import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColorModeIconDropdown from '@/theme/ColorModeIconDropdown';
import { activeItem, groupOf } from './nav';

/**
 * Page chrome, driven off the nav's active entry: group eyebrow, then the title.
 * Reading it from one place is what lets the pages render nothing but their data —
 * no page owns (or can drift from) its own heading.
 */
export default function Header() {
  const item = activeItem(useLocation().pathname);

  return (
    <Stack
      component="header"
      direction="row"
      alignItems="flex-start"
      spacing={2}
      sx={{
        py: 2.5,
        mb: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled' }}>
          {groupOf(item)}
        </Typography>
        <Typography variant="h1" component="h1">
          {item.title}
        </Typography>
      </Box>
      {/* Mobile keeps the mode switch in AppNavbar, so it's desktop-only here. */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <ColorModeIconDropdown />
      </Box>
    </Stack>
  );
}
