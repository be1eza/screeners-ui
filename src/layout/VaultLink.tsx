import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { VAULT } from '@/config';

/**
 * Sidebar footer. Where the user's avatar would sit in the template we name the
 * thing that actually owns the state: this app has no account and no storage, so
 * the only identity worth showing is the repo it reads.
 *
 * One line, branch included — the branch was a grey caption underneath, which is
 * the pattern the rest of the UI dropped.
 */
export default function VaultLink() {
  return (
    <Box sx={{ p: 1.75, borderTop: '1px solid', borderColor: 'divider' }}>
      <Link
        href={`https://github.com/${VAULT.owner}/${VAULT.repo}/tree/${VAULT.branch}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.primary' }}
      >
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {VAULT.owner}/{VAULT.repo}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: 'text.disabled' }}>
          {VAULT.branch}
        </Typography>
        <OpenInNewRoundedIcon sx={{ fontSize: 13, opacity: 0.55 }} />
      </Link>
    </Box>
  );
}
