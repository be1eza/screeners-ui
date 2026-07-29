import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type SectionHeadingProps = {
  title: string;
  /** Right-aligned context on the rule — a snapshot date, typically. */
  meta?: string | null;
};

/**
 * Divides a page into stacked sections: a tracked-out label, a hairline rule
 * running to the right edge, and optional meta parked at its end. The rule does
 * the work a bigger typeface would otherwise have to — the heading stays the same
 * weight as the panel titles beneath it, so nothing shouts.
 *
 * One line, by design: `meta` rides *on* the rule rather than sitting under the
 * title, so a section break never adds a second row of grey text.
 */
export default function SectionHeading({ title, meta }: SectionHeadingProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography variant="overline" component="h2" sx={{ flexShrink: 0 }}>
        {title}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      {meta && (
        <Typography variant="caption" sx={{ flexShrink: 0, color: 'text.disabled' }}>
          {meta}
        </Typography>
      )}
    </Stack>
  );
}
