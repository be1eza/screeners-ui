import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

/** Browse dated raw CSVs; diff tickers entered/left over time. Placeholder. */
export default function Snapshots() {
  return (
    // Dashed, not solid: the panel reads as a hole in the layout rather than a
    // finished surface holding one sentence.
    <Card sx={{ p: 3, borderStyle: 'dashed' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Dated raw CSVs and entered/left diffs. Data layer pending.
      </Typography>
    </Card>
  );
}
