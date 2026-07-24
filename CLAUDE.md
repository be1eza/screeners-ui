# screeners-ui

Read-only web UI for the **screeners vault** (`be1eza/screeners` — the Finviz→Obsidian
pipeline). Vite + React + TypeScript + MUI, deployed to GitHub Pages via Actions.

## The one rule
The **vault is the source of truth.** This app *reads* the public vault over HTTP and
**writes nothing** — no API keys, no mutations, no persisted state. It is disposable,
swappable compute; deleting and rebuilding it loses nothing. (Mirrors the vault's governing
principle: durable state lives in the repo; everything else only renders it.)

## Data source (see `src/config.ts`)
- **Enumerate** files with ONE git-tree API call (`/git/trees/<branch>?recursive=1`).
- **Fetch contents** from `raw.githubusercontent.com` (public, CORS-ok, ~5-min CDN cache —
  a push shows up within minutes, not instantly).
- Reuse the verified logic from the vault's `index.html`: slugify (repo.md rule), newest-first
  raw-CSV walk with early-exit to map ticker→industry, industry grouping.
- All fetching/parsing lives in `src/data/` as **pure TS** (no React, no MUI). React consumes
  it through `src/hooks/`.

## Code conventions (enforced by eslint + tsconfig)
- **Never `React.FC`/`FC`.** Components are function declarations: `export default function
  StatCard({ title }: StatCardProps) {}`. (Lint rule bans it.)
- **Props = a `type` alias**, destructured in the signature (matches the MUI template).
  `interface` only for extendable public contracts.
- **TS strict, no `any`** — use `unknown` + narrowing. Explicit return types in `src/data/`.
- **Styling is `sx` + the shared theme only.** No CSS files. `styled()` only for reused
  primitives. Colors via `theme.vars`/palette — never hard-coded hex. Light/dark through
  the template's `AppTheme` + `ColorModeSelect`.
- One component per file; PascalCase filename = component; default export for components.
- Path alias `@/` → `src/`.

## Styling basis
Adopt the **MUI Material UI "Dashboard" template** verbatim as the styling foundation:
https://mui.com/material-ui/getting-started/templates/dashboard/
Port its `shared-theme/` (AppTheme, ColorModeSelect, themePrimitives) into `src/theme/`, its
`theme/customizations/` (dataGrid, charts) as-is, and its chrome (SideMenu, AppNavbar, Header,
MenuContent) into `src/layout/`. Deviation from the template: it uses one flat `components/`;
we split `layout/` (chrome) · `pages/` (routes) · `components/` (reusable widgets).

## Structure
```
src/
├── main.tsx          # root + HashRouter + AppTheme            [impl]
├── App.tsx           # routes + dashboard layout shell          [impl]
├── config.ts         # vault coordinates + URL builders         ✅
├── types.ts          # shared contracts (Screener, View, …)     ✅
├── theme/            # ported shared-theme + customizations/     [impl]
├── layout/           # SideMenu · AppNavbar · Header · MenuContent [impl]
├── pages/            # Watchlists · Snapshots · Analysis         [impl]
├── components/       # reusable widgets                          [impl]
├── data/             # vault client — pure TS                    [impl]
└── hooks/            # data hooks                                [impl]
```

## Routes (map to the three UI scopes)
- `/` **Watchlists** — copy-UI: aggregate/daily toggle, industry-grouped, one-click
  TradingView-ready copy (`###Industry,EX:TICKER,...`).
- `/snapshots` **Snapshots** — browse dated raw CSVs; diff tickers entered/left over time.
- `/analysis` **Analysis** — renders the vault's `wiki/*.md` once that (deferred) layer exists;
  placeholder until then.

## Routing / deploy
- **HashRouter** (`/#/snapshots`) — zero Pages config, no deep-link 404s.
- Vite `base: '/screeners-ui/'` — MUST match the repo name (see `vite.config.ts`).
- `.github/workflows/deploy.yml` builds on push to `main` and deploys the artifact to Pages —
  **never commits `dist/`**. Enable once: Settings → Pages → Source = GitHub Actions.
- Site → `https://be1eza.github.io/screeners-ui/`.

## Status
Skeleton + conventions only. Feature code (`[impl]` above) is deliberately not written yet.
