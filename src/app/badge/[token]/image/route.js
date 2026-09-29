import { protectPublicRoute } from '@/lib/api-security';
import { getSpeakerBadgeByDownloadToken } from '@/lib/speaker-communications-db';
import { downloadSpeakerBadgeImage } from '@/lib/speaker-badge-storage';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const { isValidDownloadToken, speakerBadgeDownloadFilename } =
  speakerCommunicationsUtils;

const ERROR_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'text/plain',
  'X-Robots-Tag': 'noindex, nofollow',
};

// Serves a speaker's badge for their badge page, social link previews and
// the "Download your badge" button (?download=1). The token is the only
// credential, so it is long, random and never listed anywhere public.
export async function GET(request, context) {
  // Link previews from social platforms fetch this too, so the limit is
  // generous; it still stops token guessing at scale.
  const protection = await protectPublicRoute(request, 'speaker-badge-image', {
    windowMs: 10 * 60 * 1000,
    maxRequests: 120,
  });
  if (!protection.ok) return protection.response;

  const { token } = await context.params;
  if (!isValidDownloadToken(token)) {
    return new Response('This badge link is not valid.', {
      status: 404,
      headers: ERROR_HEADERS,
    });
  }

  try {
    const badge = await getSpeakerBadgeByDownloadToken(token);
    if (!badge?.badge_path) {
      return new Response('This badge link is not valid.', {
        status: 404,
        headers: ERROR_HEADERS,
      });
    }

    const image = await downloadSpeakerBadgeImage(badge.badge_path);
    const download = new URL(request.url).searchParams.get('download') === '1';
    const filename = speakerBadgeDownloadFilename({
      name: badge.speaker_name,
      edition: badge.edition,
      extension: badge.badge_path.endsWith('.jpg') ? 'jpg' : 'png',
    });
    return new Response(image, {
      headers: {
        ...protection.headers,
        'Content-Type': badge.badge_content_type || 'image/png',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
        'Cache-Control': 'public, max-age=300',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Unable to serve speaker badge image.', error);
    return new Response('The badge could not be loaded. Please try again.', {
      status: 500,
      headers: ERROR_HEADERS,
    });
  }
}
