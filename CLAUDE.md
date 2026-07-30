# screeners-ui

Read-only web UI for the **screeners vault** (`be1eza/screeners` — the Finviz→Obsidian
pipeline). Vite + React + TypeScript + MUI, deployed to GitHub Pages via Actions.

## The one rule

The **vault is the source of truth.** This app _reads_ the public vault over HTTP and
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

## What the vault serves (verified against the vault 2026-07-25)

The vault's own `CLAUDE.md` + `repo.md` are authoritative; this is the reader's-eye summary.

**16 screeners in `config/screeners.json`** — 13 company screeners + **3 ETF baskets**
(`Markets`, `Sectors`, `Group Themes`), distinguished by `"c": "basket"` on the registry entry.
The baskets are `watchlist: false, aggregate: null` → **snapshot-only**, no `watchlists/<slug>/`
dir. They form a rotation hierarchy, broadest first: Markets (asset-class regime) → Sectors
(all 11 GICS) → Group Themes (narrow thematic). Same 21 columns ⇒ directly comparable.

**Exactly two column sets**, named in `config/columns.json` (`company` / `basket`) and applied
by the vault workflow via Finviz's `c=`. This UI never fetches columns.json — both schemas are
read **by header name** — but the two shapes are what `src/data/rows.ts` projects:

- **company, 28 cols** — Ticker, Exchange, Company, Sector, Industry, Market Cap, Price, Change,
  Volume, Avg/Rel Vol, Perf (W/M/Q/HY/YTD/Y), Volatility (W), EPS Growth (This-Yr/QoQ/Next-5Y),
  Sales Growth QoQ, Institutional (Transactions/Ownership), Short Float, **SMA 20/50/200**.
- **basket, 21 cols** — Ticker, Exchange, Price, Change, Volume, Avg/Rel Vol, Perf (W/M/Q/HY/YTD/Y),
  **Sector/Theme**, Net Flows % (1M/3M/YTD/1Y), **SMA 20/50/200**. No Industry, no fundamentals.

**Reading the data — four rules that bite:**

- **SMA columns are % distance from price to that average, not the average** (`-0.81%` = 0.81%
  below the 20-day). Trend position, not price.
- **Tail-append, never reorder.** SMA landed 2026-07-25; every earlier snapshot is narrower
  (25-col company / 18-col Group Themes). Key by header _name_ and tolerate absent tail columns
  — never assume a fixed width. Missing → `null`, rendered `—`.
- **Hard vs soft fields.** A snapshot is as-of-_fetch_, not as-of-_date_: Finviz restates the
  soft ones. Hard (trust across dates): Price, Change, Volume, Avg/Rel Vol, Perf, SMA.
  Soft (restated, so day-over-day deltas are noisier): Net Flows %, EPS/Sales Growth.
- **`Sector/Theme` is empty for every Markets row** — broad-index/crypto ETFs have no sector.
  Expected, not missing data; populated for Sectors and most of Group Themes.

## Code conventions (enforced by eslint + tsconfig)

- **Never `React.FC`/`FC`.** Components are function declarations: `export default function
StatCard({ title }: StatCardProps) {}`. (Lint rule bans it.)
- **Props = a `type` alias**, destructured in the signature (matches the MUI template).
  `interface` only for extendable public contracts.
- **TS strict, no `any`** — use `unknown` + narrowing. Explicit return types in `src/data/`.
- **Styling is `sx` + the shared theme only.** No CSS files. `styled()` only for reused
  primitives. Colors via `theme.vars`/palette — never hard-coded hex. Light/dark through
  the template's `AppTheme` + `ColorModeIconDropdown`.
- **Inside `ColorSchemeInverter` (the sidebar), read colors through variables only** — sx
  palette strings (`bgcolor: 'background.paper'`), `theme.vars.palette.…`, or palette tokens.
  A static `theme.palette.x` is baked at theme-creation time and `theme.applyStyles('dark', …)`
  keys off an _ancestor_ attribute, so both report the page's scheme, not the inverted one.
- **`alpha()` can't take a CSS variable.** For a tint, either use a static token from
  `theme/colors.ts` or `theme.palette.x` (fine when the hue is scheme-independent, as the
  brand hues and the `gray` ramp are) — never `alpha(theme.vars.palette.…)`.
- **Panel-level styling belongs in `theme/customizations/`, not the component.** Grids and
  charts are themed once (rules off, banded rows, micro-label headers) so every one matches;
  components pass only their own data concerns.
- One component per file; PascalCase filename = component; default export for components.
- Path alias `@/` → `src/`.

## Styling basis

Adopt the **MUI Material UI "Dashboard" template** as the styling foundation:
https://mui.com/material-ui/getting-started/templates/dashboard/
Its `shared-theme/` (AppTheme, ColorModeIconDropdown, themePrimitives) lives in `src/theme/`,
its `theme/customizations/` in `src/theme/customizations/`, and its chrome (SideMenu,
SideMenuMobile, AppNavbar, Header, MenuContent) in `src/layout/`.

Deviations from the template, all deliberate:

- It uses one flat `components/`; we split `layout/` (chrome) · `pages/` (routes) ·
  `components/` (reusable widgets).
- **The sidebar renders the inverted color scheme** — dark rail on a light page, light rail on
  a dark one — via `theme/ColorSchemeInverter`, which sets `data-mui-color-scheme` to the
  opposite value on a Box. MUI emits each scheme's variables under that attribute selector, and
  an attribute selector matches _any_ element, so the whole palette is re-declared for that
  subtree (`color-scheme` included, so native scrollbars flip too). Chrome and data then read
  as two different materials.
- **Crisp over soft**, aiming at a trading terminal: flat surfaces separated by solid 1px
  hairlines (`divider` is a real color, not an alpha wash), no elevation except on things that
  float, dense type topping out at 28px, `tabular-nums` on `body` so no column ever wobbles,
  micro-labels (`overline`) for section eyebrows and table headers, thin overlay scrollbars.
- **Pages don't own their headings.** `layout/nav.ts` is the single definition of each route's
  label / title / icon; the sidebar renders it and `Header` reads the active entry. Pages render
  data only, so a title can't drift from the nav.
- **No subtitles.** Nothing carries a grey caption under its title — not panels (`SectionCard`
  has no subtitle slot at all), not section breaks, not the page header, not the sidebar. A
  panel's own contents carry the context: the breadth x-axis is dated, columns are labelled,
  bars are counted. Where a date genuinely needs stating, it rides _on_ the rule via
  `SectionHeading`'s `meta`, not on a second line.

## Structure

```
src/
├── main.tsx          # root + HashRouter + AppTheme                ✅
├── App.tsx           # sidebar shell + routes                      ✅
├── config.ts         # vault coordinates + URL builders            ✅
├── types.ts          # shared contracts (Screener, Basket, rows…)  ✅
├── theme/            # AppTheme · themePrimitives · colors ·       ✅
│                     #   ColorSchemeInverter · ColorModeIconDropdown
│   └── customizations/  # surfaces · dataGrid · charts             ✅
├── layout/           # nav · SideMenu · SideMenuMobile · AppNavbar  ✅
│                     #   Header · MenuContent · BrandMark · VaultLink
├── pages/            # SituationalAwareness · Watchlists (+ stubs) ✅
├── components/       # reusable widgets                            ✅
├── data/             # vault client — pure TS                      ✅
└── hooks/            # data hooks                                  ✅
```

## Routes

- `/` **Situational Awareness & Themes** — the home dashboard: ±20% weekly breadth over time,
  the industries behind each side of it (one card per polarity), 52w-high industry domination,
  and the three ETF baskets (Markets · Sectors · Group Themes) with perf and SMA distance.
- `/watchlists` **Watchlists** — copy-UI: industry-grouped, one-click TradingView-ready copy
  (`###Industry,EX:TICKER,...`). Only screeners with `watchlist && aggregate === true`.
- `/snapshots` **Snapshots** — browse dated raw CSVs; diff tickers entered/left over time. Stub.
- `/analysis` **Analysis** — renders the vault's `wiki/*.md` once that (deferred) layer exists;
  placeholder until then (`wiki/` currently holds only `.gitkeep`).

## Routing / deploy

- **HashRouter** (`/#/snapshots`) — zero Pages config, no deep-link 404s.
- Vite `base: '/screeners-ui/'` — MUST match the repo name (see `vite.config.ts`).
- `.github/workflows/deploy.yml` builds on push to `main` and deploys the artifact to Pages —
  **never commits `dist/`**. Enable once: Settings → Pages → Source = GitHub Actions.
- Site → `https://be1eza.github.io/screeners-ui/`.

## Status

Data layer, the two priority pages (Situational Awareness, Watchlists), and the `layout/` chrome
(inverted SideMenu · SideMenuMobile · AppNavbar · Header) are built. Still `[impl]`: the Snapshots
and Analysis pages, which are route stubs — they _do_ appear in the sidebar under **Vault**, tagged
`soon` (`pending: true` in `layout/nav.ts`), so the nav shows the shape of the app without
promising data that isn't there yet.
