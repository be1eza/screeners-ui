import { useId, useMemo } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { MOBILE_APP_NAVBAR_HEIGHT } from '@/layout/AppNavbar';

type SnapshotDateNavigatorProps = {
  /** Available vault dates in ascending order. */
  availableDates: string[];
  /** `null` means the latest available snapshot. */
  selectedDate: string | null;
  loading: boolean;
  errorMessage?: string | null;
  onSelect: (date: string) => void;
  onLatest: () => void;
  onRetry?: (() => void) | null;
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const monthYearFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseDate(iso: string): Date | null {
  const match = ISO_DATE.exec(iso);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

/** Format a vault ISO date without letting the browser's timezone move the day. */
function formatDate(iso: string): string {
  const date = parseDate(iso);
  return date ? dateFormatter.format(date) : iso;
}

function formatMonthYear(iso: string): string {
  const date = parseDate(iso);
  return date ? monthYearFormatter.format(date) : iso;
}

const filterDates = createFilterOptions<string>({
  // Match both the vault's ISO value and the localized label shown in the field.
  stringify: (date) => `${date} ${formatDate(date)}`,
});

/** Page-level snapshot control; stays within reach while the dashboard scrolls. */
export default function SnapshotDateNavigator({
  availableDates,
  selectedDate,
  loading,
  errorMessage,
  onSelect,
  onLatest,
  onRetry,
}: SnapshotDateNavigatorProps) {
  const inputId = useId();
  const options = useMemo(() => [...availableDates].reverse(), [availableDates]);
  const selectedIndex =
    selectedDate === null
      ? availableDates.length - 1
      : availableDates.indexOf(selectedDate);
  const effectiveDate = selectedIndex >= 0 ? availableDates[selectedIndex] : null;
  const previousDate = selectedIndex > 0 ? availableDates[selectedIndex - 1] : null;
  const nextDate =
    selectedIndex >= 0 && selectedIndex < availableDates.length - 1
      ? availableDates[selectedIndex + 1]
      : null;

  return (
    <Box
      component="nav"
      aria-label="Snapshot date navigation"
      aria-busy={loading}
      sx={{
        position: 'sticky',
        top: { xs: `${MOBILE_APP_NAVBAR_HEIGHT}px`, md: 0 },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        mb: 2,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.5, sm: 0.75 }}
        sx={{ py: 1, minWidth: 0 }}
      >
        <Typography
          component="label"
          htmlFor={inputId}
          variant="overline"
          sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}
        >
          As of
        </Typography>

        <Tooltip title={previousDate ? `Previous · ${formatDate(previousDate)}` : ''}>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <IconButton
              aria-label={
                previousDate
                  ? `Show previous snapshot: ${formatDate(previousDate)}`
                  : 'No previous snapshot available'
              }
              size="small"
              disabled={previousDate === null}
              onClick={() => previousDate && onSelect(previousDate)}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Tooltip>

        <Autocomplete
          id={inputId}
          size="small"
          options={options}
          value={effectiveDate}
          filterOptions={filterDates}
          groupBy={formatMonthYear}
          getOptionLabel={formatDate}
          isOptionEqualToValue={(option, value) => option === value}
          disabled={availableDates.length === 0}
          disableClearable={effectiveDate !== null}
          onChange={(_event, date) => {
            if (date === null) onLatest();
            else onSelect(date);
          }}
          renderInput={(params) => <TextField {...params} placeholder="Select date" />}
          sx={{
            flex: { xs: 1, sm: '0 0 210px' },
            minWidth: 0,
            '& .MuiInputBase-root': {
              height: 32,
              bgcolor: 'background.paper',
              fontSize: '0.8125rem',
            },
            '& .MuiAutocomplete-input': { minWidth: '0 !important' },
          }}
        />

        <Tooltip title={nextDate ? `Next · ${formatDate(nextDate)}` : ''}>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <IconButton
              aria-label={
                nextDate
                  ? `Show next snapshot: ${formatDate(nextDate)}`
                  : 'No next snapshot available'
              }
              size="small"
              disabled={nextDate === null}
              onClick={() => nextDate && onSelect(nextDate)}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Tooltip>

        <Button
          size="small"
          variant={selectedDate === null ? 'contained' : 'outlined'}
          aria-label="Show latest snapshot"
          disabled={selectedDate === null || availableDates.length === 0}
          onClick={onLatest}
          sx={{ flexShrink: 0 }}
        >
          Latest
        </Button>
      </Stack>

      {errorMessage && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ pb: 1, minWidth: 0 }}
        >
          <Typography
            role="status"
            aria-live="polite"
            variant="caption"
            color="error.main"
            sx={{ flex: 1, minWidth: 0 }}
          >
            {errorMessage}
          </Typography>
          {onRetry && (
            <Button size="small" color="error" onClick={onRetry}>
              Retry
            </Button>
          )}
        </Stack>
      )}

      {loading && (
        <LinearProgress
          aria-label="Loading snapshot"
          sx={{ position: 'absolute', right: 0, bottom: -1, left: 0, height: 2 }}
        />
      )}
    </Box>
  );
}
