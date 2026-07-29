import { useState } from 'react';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';

type CopyButtonProps = {
  text: string;
  label?: string;
};

/** Copy `text` to the clipboard with brief "Copied" feedback. */
export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — leave the label unchanged.
    }
  };

  return (
    <Button
      size="small"
      variant={copied ? 'contained' : 'outlined'}
      color={copied ? 'success' : 'primary'}
      startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
      onClick={handleCopy}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
}
