import type { SvgIconComponent } from '@mui/icons-material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

export type NavItem = {
  path: string;
  /** Sidebar label — kept short enough not to wrap at 232px. */
  label: string;
  /** Page title in the Header; may be longer than the sidebar label. */
  title: string;
  icon: SvgIconComponent;
  /** Route stub — navigable, but flagged so the nav doesn't promise data. */
  pending?: boolean;
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

/**
 * The nav is the single source of page chrome: the sidebar renders it, and the
 * Header reads the active entry for its eyebrow and title. Pages therefore don't
 * repeat their own heading — one definition, no drift.
 */
export const NAV: NavGroup[] = [
  {
    heading: 'Dashboards',
    items: [
      {
        path: '/',
        label: 'Situational Awareness',
        title: 'Situational Awareness & Themes',
        icon: InsightsRoundedIcon,
      },
      {
        path: '/watchlists',
        label: 'Watchlists',
        title: 'Watchlists',
        icon: FormatListBulletedRoundedIcon,
      },
    ],
  },
  {
    heading: 'Vault',
    items: [
      {
        path: '/snapshots',
        label: 'Snapshots',
        title: 'Snapshots',
        icon: HistoryRoundedIcon,
        pending: true,
      },
      {
        path: '/analysis',
        label: 'Analysis',
        title: 'Analysis',
        icon: DescriptionRoundedIcon,
        pending: true,
      },
    ],
  },
];

const ITEMS = NAV.flatMap((group) => group.items);

/**
 * Longest-prefix match, so `/` doesn't claim every route. Falls back to the
 * first item — the home dashboard — for anything unrouted.
 */
export function activeItem(pathname: string): NavItem {
  const matches = ITEMS.filter(
    (item) => item.path !== '/' && pathname.startsWith(item.path),
  ).sort((a, b) => b.path.length - a.path.length);
  return matches[0] ?? ITEMS[0];
}

/** The group heading an item sits under — the Header's eyebrow. */
export function groupOf(item: NavItem): string {
  return NAV.find((group) => group.items.includes(item))?.heading ?? '';
}
