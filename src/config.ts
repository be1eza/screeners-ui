/**
 * Where the durable data lives. This UI is a read-only reader of the public
 * `screeners` vault repo — it fetches over HTTP and writes nothing.
 *
 * - Enumerate files with one git-tree API call (cheap, exact, not rate-limited for a personal tool).
 * - Fetch file contents from raw.githubusercontent (public, CORS-enabled, ~5-min CDN cache).
 */
export const VAULT = {
  owner: 'be1eza',
  repo: 'screeners',
  branch: 'main',
} as const;

export const treeUrl = () =>
  `https://api.github.com/repos/${VAULT.owner}/${VAULT.repo}/git/trees/${VAULT.branch}?recursive=1`;

export const rawUrl = (path: string) =>
  `https://raw.githubusercontent.com/${VAULT.owner}/${VAULT.repo}/${VAULT.branch}/${path}`;
