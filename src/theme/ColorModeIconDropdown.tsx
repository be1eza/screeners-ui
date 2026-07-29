import { useState } from 'react';
import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { useColorScheme } from '@mui/material/styles';

const MODES = [
  { value: 'system', label: 'System', icon: SettingsBrightnessRoundedIcon },
  { value: 'light', label: 'Light', icon: LightModeRoundedIcon },
  { value: 'dark', label: 'Dark', icon: DarkModeRoundedIcon },
] as const;

type Mode = (typeof MODES)[number]['value'];

/**
 * The template's ColorModeIconDropdown: current scheme as the face, System /
 * Light / Dark in the menu. Worth having beyond taste — the sidebar renders the
 * *inverted* scheme, so switching modes swaps which half of the app is dark.
 */
export default function ColorModeIconDropdown() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  // No colorSchemes configured (e.g. AppTheme's disableCustomTheme path) — hold
  // the space so the header doesn't reflow.
  if (!mode) return <Box sx={{ width: 34, height: 34 }} />;

  const resolved = mode === 'system' ? systemMode : mode;
  const Face = resolved === 'dark' ? DarkModeRoundedIcon : LightModeRoundedIcon;

  const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);
  const choose = (next: Mode) => {
    setMode(next);
    setAnchor(null);
  };

  return (
    <>
      <Tooltip title={`Theme · ${mode}`}>
        <IconButton size="small" onClick={open} aria-label="Change color mode">
          <Face sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 148, mt: 0.5 } } }}
      >
        {MODES.map(({ value, label, icon: Icon }) => (
          <MenuItem key={value} selected={mode === value} onClick={() => choose(value)}>
            <ListItemIcon sx={{ minWidth: 0, mr: 1.25 }}>
              <Icon sx={{ fontSize: 16 }} />
            </ListItemIcon>
            {label}
            {mode === value && <CheckRoundedIcon sx={{ fontSize: 15, ml: 'auto', pl: 1 }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
