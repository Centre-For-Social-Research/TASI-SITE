import { revalidatePath } from 'next/cache';
import { verifySanityWebhookSignature } from '@/lib/sanity-webhook';

// Needs the Node runtime (crypto) and must never be statically cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * On-demand revalidation endpoint for Sanity content.
 *
 * Configure a Sanity webhook (Manage → API → Webhooks) to POST here on
 * create/update/delete of `post` documents, with:
 *   - URL:        https://trustandsafetyindia.org/api/revalidate
 *   - Trigger on: Create, Update, Delete
 *   - Filter:     _type == "post"
 *   - Projection: {"slug": slug.current, "_type": _type}
 *   - Secret:     same value as SANITY_REVALIDATE_SECRET
 *
 * On a valid signed request we refresh the homepage news section, the blog
 * index, and the specific post page so new or edited posts appear within
 * seconds instead of waiting for the timed ISR window.
 */
export async function POST(request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: 'Revalidation secret is not configured.' },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const signature = request.headers.get('sanity-webhook-signature') || '';

  if (!verifySanityWebhookSignature({ payload, signature, secret })) {
    return Response.json(
      { ok: false, error: 'Invalid webhook signature.' },
      { status: 401 }
    );
  }

  let body = {};
  try {
    body = JSON.parse(payload);
  } catch {
    // A malformed body still lets us refresh the list/home routes below.
  }

  const slug =
    typeof body?.slug === 'string' ? body.slug : body?.slug?.current || null;

  // Homepage "Latest from TASI" section and the blog index.
  revalidatePath('/');
  revalidatePath('/blog');

  // The individual post page (covers new slugs too, thanks to dynamicParams).
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }

  return Response.json({
    ok: true,
    revalidated: true,
    slug,
    now: Date.now(),
  });
}
