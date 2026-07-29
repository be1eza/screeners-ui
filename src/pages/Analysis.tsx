import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

/**
 * Renders the vault's `wiki/*.md` once that (deferred) layer exists. The vault's
 * `wiki/` currently holds only a `.gitkeep`, so this stays a placeholder.
 */
export default function Analysis() {
  return (
    <Card sx={{ p: 3, borderStyle: 'dashed' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Renders the vault&apos;s wiki notes. Awaiting the vault&apos;s wiki layer.
      </Typography>
    </Card>
  );
}
