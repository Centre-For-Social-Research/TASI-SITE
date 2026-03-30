import { getOperatorUiState } from '@/lib/registration-auth';

export async function GET() {
  const state = await getOperatorUiState();

  return Response.json(state, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
