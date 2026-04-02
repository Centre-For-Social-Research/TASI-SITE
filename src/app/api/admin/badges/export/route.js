import { requireAuthorizedOperator } from '@/lib/registration-auth';
import {
  listBadgeExportRegistrations,
  recordBadgeExport,
  setLastBadgeExportBatch,
} from '@/lib/registration-db';
import {
  buildBadgeExportRows,
  buildCsvExport,
  buildExcelExport,
  buildPdfMergeExport,
} from '@/lib/registration-pass';

function contentDisposition(filename) {
  return `attachment; filename="${filename}"`;
}

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.badges.export',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const registrations = await listBadgeExportRegistrations();
    const frozenAt = new Date().toISOString();
    const batchId = await recordBadgeExport({
      operator: authResult.operator,
      format,
      totalRegistrations: registrations.length,
      frozenAt,
    });
    await setLastBadgeExportBatch(
      batchId,
      registrations.map((registration) => registration.id)
    );
    const rows = buildBadgeExportRows(
      registrations.map((registration) => ({
        ...registration,
        last_badge_export_batch_id: batchId,
      }))
    );

    if (format === 'xlsx') {
      const excel = await buildExcelExport(rows);
      return new Response(excel, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': contentDisposition(
            `tasi-2026-badges-${batchId}.xlsx`
          ),
        },
      });
    }

    if (format === 'pdf') {
      const pdf = await buildPdfMergeExport(registrations);
      return new Response(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': contentDisposition(
            `tasi-2026-badges-${batchId}.pdf`
          ),
        },
      });
    }

    const csv = buildCsvExport(rows);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': contentDisposition(
          `tasi-2026-badges-${batchId}.csv`
        ),
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to export badges.',
      },
      { status: 500 }
    );
  }
}
