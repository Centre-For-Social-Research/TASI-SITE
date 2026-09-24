import rosterExport from '@/lib/admin-roster-export.cjs';
import { ADMIN_NO_STORE_HEADERS } from '@/lib/admin-api-cache';

const { buildRosterCsv, buildRosterExcel } = rosterExport;

export async function rosterExportResponse({
  format,
  columns,
  rows,
  basename,
  sheetName,
}) {
  const isExcel = format === 'xlsx';
  const file = isExcel
    ? await buildRosterExcel(columns, rows, sheetName)
    : buildRosterCsv(columns, rows);
  return new Response(file, {
    headers: {
      ...ADMIN_NO_STORE_HEADERS,
      'Content-Disposition': `attachment; filename="${basename}.${format}"`,
      'Content-Type': isExcel
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv; charset=utf-8',
      'X-Export-Row-Count': String(rows.length),
    },
  });
}
