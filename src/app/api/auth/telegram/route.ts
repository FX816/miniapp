import { authenticateWithTelegram, setSessionCookie } from '@/lib/auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { authSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = rateLimit(`auth:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!success) return apiError('Too many requests', 429);

    const body = await request.json();
    const { initData } = authSchema.parse(body);

    const user = await authenticateWithTelegram(initData);
    await setSessionCookie(user.id);

    return apiSuccess({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
