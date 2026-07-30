import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { Basket, BasketRow } from '@/types';
import Ticker from './Ticker';

type BasketPerformanceCardProps = {
  basket: Basket;
  data: BasketRow[];
};

/** Signed percentage in the theme's semantic up/down ink. */
function PerfCell({ value }: { value: number | null }) {
  if (value == null)
    return (
      <Typography variant="body2" component="span" sx={{ color: 'text.disabled' }}>
        —
      </Typography>
    );
  return (
    <Typography
      variant="body2"
      component="span"
      sx={{ color: value >= 0 ? 'up.main' : 'down.main', fontWeight: 600 }}
    >
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </Typography>
  );
}

type PerfColOptions = {
  width?: number;
  /**
   * Opens a new group of measures: draws the theme's hairline down this column's
   * left edge, header included. Both column blocks are signed percentages in the
   * same ink, so without a rule the eye reads six interchangeable numbers instead
   * of two different questions.
   */
  groupStart?: boolean;
};

const perfCol = (
  field: string,
  header: string,
  { width = 88, groupStart = false }: PerfColOptions = {},
): GridColDef<BasketRow> => ({
  field,
  headerName: header,
  type: 'number',
  width,
  ...(groupStart && { cellClassName: 'group-start', headerClassName: 'group-start' }),
  renderCell: (params: GridRenderCellParams<BasketRow, number | null>) => (
    <PerfCell value={params.value ?? null} />
  ),
});

/**
 * Identical for all three baskets — they share one 21-column schema. The only
 * difference: Markets has no Sector/Theme (broad index and crypto ETFs carry none),
 * so that column becomes an unlabelled spacer rather than an empty column.
 */
function columnsFor(basket: Basket): GridColDef<BasketRow>[] {
  return [
    {
      field: 'ticker',
      headerName: 'ETF',
      width: 88,
      renderCell: (params: GridRenderCellParams<BasketRow, string>) => (
        <Ticker value={params.row.token} />
      ),
    },
    {
      field: 'theme',
      headerName: basket.hasTheme ? 'Theme' : '',
      flex: 1,
      minWidth: basket.hasTheme ? 120 : 0,
      sortable: basket.hasTheme,
    },
    // Price change over time…
    perfCol('perfWeek', '1W'),
    perfCol('perfMonth', '1M'),
    perfCol('perfQuarter', '3M'),
    // …then trend position: distance from each average, a different question.
    perfCol('sma20', '20 SMA', { groupStart: true }),
    perfCol('sma50', '50 SMA'),
    perfCol('sma200', '200 SMA'),
  ];
}

/**
 * One ETF basket: performance across 1W / 1M / 3M plus SMA distance — how far price
 * sits above/below its 20/50/200-day average (the vault stores distance, not the SMA
 * level), which is the trend-position read. Sortable on any column; defaults to 1W
 * desc, matching the vault's `-perf1w` ordering. SMA cells show `—` for snapshots
 * written before 2026-07-25, which predate those columns.
 *
 * The rules-off, banded-row look lives in the theme (customizations/dataGrid) so
 * every grid in the app reads the same; only the banding opt-in is per grid.
 *
 * No title bar: the section heading above already names the basket and dates it, and
 * the columns are labelled, so a header rule here would only repeat one of them. The
 * card is the surface the table sits on, nothing more.
 */
export default function BasketPerformanceCard({
  basket,
  data,
}: BasketPerformanceCardProps) {
  return (
    <Card sx={{ px: 1.75, py: 1 }}>
      <DataGrid
        rows={data}
        columns={columnsFor(basket)}
        getRowId={(row) => row.ticker}
        // Banding follows the rendered order, so it survives sorting — a
        // nth-child rule would not, with virtualized rows.
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 ? 'row-band' : ''
        }
        autoHeight
        initialState={{
          sorting: { sortModel: [{ field: 'perfWeek', sort: 'desc' }] },
          pagination: { paginationModel: { pageSize: 100 } },
        }}
        pageSizeOptions={[100]}
      />
    </Card>
  );
}
