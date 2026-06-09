import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 401);
  return apiSuccess({ user });
}
