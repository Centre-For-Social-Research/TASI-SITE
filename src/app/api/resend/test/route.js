import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { Resend } from 'resend';

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.resend.test',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return Response.json(
      {
        error:
          'Missing RESEND_API_KEY. Replace `re_xxxxxxxxx` in your local env with your real Resend API key.',
      },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL?.trim() ||
        'noreply@trustandsafetyindia.org',
      to: 'saquib@csrindia.org',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });

    if (error) {
      return Response.json(
        { error: error.message || 'Failed to send email.' },
        { status: 400 }
      );
    }

    return Response.json({ success: true, id: data?.id || null });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send email.',
      },
      { status: 500 }
    );
  }
}
