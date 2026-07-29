import type { CsvRow } from '@/types';

/**
 * Parse a Finviz-style CSV into rows keyed by header name. Handles double-quoted
 * fields, embedded commas, and `""` escapes. Pure string cells — numeric coercion
 * is the caller's job (see `pct`), since columns differ per screener schema.
 */
export function parseCsv(text: string): CsvRow[] {
  const records = splitRecords(text);
  if (records.length === 0) return [];
  const header = records[0];
  return records.slice(1).map((cells) => {
    const row: CsvRow = {};
    header.forEach((key, i) => {
      row[key] = cells[i] ?? '';
    });
    return row;
  });
}

/** Split CSV text into records of fields, honoring quotes and CRLF/LF. */
function splitRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      record.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      // End of record on \n; swallow the \n of a \r\n pair.
      if (ch === '\r' && text[i + 1] === '\n') i++;
      record.push(field);
      field = '';
      if (record.some((c) => c !== '')) records.push(record);
      record = [];
    } else {
      field += ch;
    }
  }
  // Trailing field/record with no closing newline.
  if (field !== '' || record.length > 0) {
    record.push(field);
    if (record.some((c) => c !== '')) records.push(record);
  }
  return records;
}

/**
 * Coerce a Finviz percentage/number cell to a number. `"-1.77%"` → -1.77,
 * `"3705.86"` → 3705.86, empty/`"-"` → null.
 */
export function pct(cell: string | undefined): number | null {
  if (cell == null) return null;
  const trimmed = cell.trim().replace(/%$/, '');
  if (trimmed === '' || trimmed === '-') return null;
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
}
