import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function isAuthorizedCronRequest(request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get('authorization') || '';

  if (!cronSecret) {
    return false;
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const provided = Buffer.from(authorization);

  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

// The free Supabase project pauses after 7 days without activity. This daily
// Vercel cron makes one small read so the database stays awake between
// editions. It reads no personal data and stores nothing.
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from('form_settings')
      .select('form_key')
      .limit(1);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Supabase keep-alive failed', { message: error?.message });
    return Response.json(
      { success: false, error: 'Keep-alive failed' },
      { status: 500 }
    );
  }
}
