import type { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type SectionCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Consistent titled card for a dashboard widget — a data panel, not a content
 * card: a single-line title bar closed by a hairline, then the body. Every panel
 * on the page starts its data at the same offset from its own top edge, which is
 * what makes a grid of them scan as one instrument rather than a collage.
 *
 * Deliberately has no subtitle slot. A caption under every title turned the page
 * into a wall of grey hedging, and the panel's own contents — axis dates, column
 * headers, bar counts — already say what the numbers are.
 */
export default function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1.75,
          py: 1,
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" component="h2" noWrap>
          {title}
        </Typography>
        {action}
      </Stack>
      <CardContent sx={{ flex: 1, px: 1.75, py: 1.5, '&:last-child': { pb: 1.5 } }}>
        {children}
      </CardContent>
    </Card>
  );
}
