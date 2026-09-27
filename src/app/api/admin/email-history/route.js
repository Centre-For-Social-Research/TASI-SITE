import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getResendClient } from '@/lib/resend';
import { adminJson } from '@/lib/admin-api-cache';

export async function GET(request) {
  const auth = await requireAuthorizedOperator({
    route: 'api.admin.email.history',
  });
  if (!auth.ok) return auth.response;

  const resend = getResendClient();
  if (!resend) {
    return adminJson({ error: 'Resend is not configured.' }, { status: 503 });
  }

  const cursor = new URL(request.url).searchParams.get('after') || '';
  if (cursor && !/^[a-zA-Z0-9_-]{1,128}$/.test(cursor)) {
    return adminJson(
      { error: 'Invalid email history cursor.' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await resend.emails.list({
      limit: 50,
      ...(cursor ? { after: cursor } : {}),
    });
    if (error) throw new Error(error.message);
    const emails = (data?.data || []).map((email) => ({
      id: email.id,
      to: email.to,
      from: email.from,
      subject: email.subject,
      createdAt: email.created_at,
      lastEvent: email.last_event,
    }));
    return adminJson({
      emails,
      hasMore: Boolean(data?.has_more),
      nextCursor: data?.has_more ? emails.at(-1)?.id || null : null,
    });
  } catch (error) {
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load email history.',
      },
      { status: 502 }
    );
  }
}
