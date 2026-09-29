import { protectPublicRoute } from '@/lib/api-security';
import { getSpeakerBadgeByDownloadToken } from '@/lib/speaker-communications-db';
import { downloadSpeakerBadgeImage } from '@/lib/speaker-badge-storage';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { isValidDownloadToken, speakerBadgeDownloadFilename } =
  speakerCommunicationsUtils;

const NOT_FOUND_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function notFound() {
  return new Response('This badge link is not valid.', {
    status: 404,
    headers: { ...NOT_FOUND_HEADERS, 'Content-Type': 'text/plain' },
  });
}

// The link in each speaker's badge email. The token is the only credential,
// so it is long, random and never listed anywhere public.
export async function GET(request, context) {
  const protection = await protectPublicRoute(request, 'speaker-badge', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  if (!isValidDownloadToken(token)) return notFound();

  try {
    const badge = await getSpeakerBadgeByDownloadToken(token);
    if (!badge?.badge_path) return notFound();

    const image = await downloadSpeakerBadgeImage(badge.badge_path);
    const filename = speakerBadgeDownloadFilename({
      name: badge.speaker_name,
      edition: badge.edition,
      extension: badge.badge_path.endsWith('.jpg') ? 'jpg' : 'png',
    });
    return new Response(image, {
      headers: {
        ...protection.headers,
        'Content-Type': badge.badge_content_type || 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Unable to serve speaker badge download.', error);
    return new Response('The badge could not be loaded. Please try again.', {
      status: 500,
      headers: { ...NOT_FOUND_HEADERS, 'Content-Type': 'text/plain' },
    });
  }
}
