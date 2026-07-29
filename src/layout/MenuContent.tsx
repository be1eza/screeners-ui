import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NAV } from './nav';

type MenuContentProps = {
  /** Close the mobile drawer after a jump; omitted on the permanent sidebar. */
  onNavigate?: () => void;
};

/**
 * The nav list, shared by the permanent sidebar and the mobile drawer.
 *
 * Every color here is a palette *string* (`'text.secondary'`, `'primary.main'`),
 * never `theme.palette.…` or `applyStyles` — those resolve against the page's
 * scheme, and this list renders inside ColorSchemeInverter's flipped one.
 */
export default function MenuContent({ onNavigate }: MenuContentProps) {
  return (
    <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.25, py: 1.5, gap: 2.5 }}>
      {NAV.map((group) => (
        <Box key={group.heading}>
          <Typography
            variant="overline"
            sx={{ display: 'block', px: 1.25, mb: 0.75, color: 'text.disabled' }}
          >
            {group.heading}
          </Typography>
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {group.items.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  // NavLink matches by prefix; the root would otherwise stay lit
                  // on every page.
                  end={item.path === '/'}
                  onClick={onNavigate}
                  sx={{
                    gap: 1.25,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 1,
                    color: 'text.secondary',
                    // `.active` is NavLink's own class for the matched route.
                    '&.active': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.main' },
                    },
                  }}
                >
                  <item.icon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, flex: 1 }}>
                    {item.label}
                  </Typography>
                  {item.pending && (
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      soon
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Stack>
  );
}
