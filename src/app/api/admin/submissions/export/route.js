import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { ADMIN_NO_STORE_HEADERS, adminJson } from '@/lib/admin-api-cache';
import { listAllSubmissions } from '@/lib/submission-db';
import submissionUtils from '@/lib/submission-utils.cjs';
import exportUtils from '@/lib/submission-export-utils.cjs';

const { SUBMISSION_TYPES, normalizeSubmissionType, submissionToExportRow } =
  submissionUtils;
const { buildSubmissionCsv, buildSubmissionExcel } = exportUtils;

function attachment(filename) {
  return `attachment; filename="${filename}"`;
}

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.submissions.export',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const params = new URL(request.url).searchParams;
    const type = normalizeSubmissionType(params.get('type'));
    const format = params.get('format') === 'xlsx' ? 'xlsx' : 'csv';
    const submissions = await listAllSubmissions({
      type,
      search: params.get('search'),
      dateFrom: params.get('dateFrom'),
      dateTo: params.get('dateTo'),
    });
    const rows = submissions.map(submissionToExportRow);
    const stamp = new Date().toISOString().slice(0, 10);
    const basename = `tasi-${type}-submissions-${stamp}`;
    const commonHeaders = {
      ...ADMIN_NO_STORE_HEADERS,
      'Content-Disposition': attachment(`${basename}.${format}`),
      'X-Export-Row-Count': String(rows.length),
    };

    if (format === 'xlsx') {
      const file = await buildSubmissionExcel(
        rows,
        SUBMISSION_TYPES[type].label
      );
      return new Response(file, {
        headers: {
          ...commonHeaders,
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    }

    return new Response(buildSubmissionCsv(rows), {
      headers: { ...commonHeaders, 'Content-Type': 'text/csv; charset=utf-8' },
    });
  } catch (error) {
    console.error('Unable to export admin submissions.', error);
    return adminJson(
      { ok: false, error: 'Unable to export submissions.' },
      { status: 500 }
    );
  }
}
