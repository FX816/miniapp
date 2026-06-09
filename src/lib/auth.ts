import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import { validateTelegramWebAppData } from '@/lib/telegram';
import type { User } from '@/types/database';

const SESSION_COOKIE = 'tg_market_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) return null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionToken)
    .eq('is_active', true)
    .single();

  return data as User | null;
}

export async function requireAuth(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'moderator') {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function authenticateWithTelegram(initData: string): Promise<User> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const validation = validateTelegramWebAppData(initData, botToken);
  if (!validation.valid || !validation.data?.user) {
    throw new AuthError(validation.error || 'Invalid Telegram data');
  }

  const tgUser = validation.data.user;
  const supabase = createServiceClient();

  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', tgUser.id)
    .single();

  if (existingUser) {
    const { data: updated } = await supabase
      .from('users')
      .update({
        username: tgUser.username || null,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name || null,
        photo_url: tgUser.photo_url || existingUser.photo_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    return (updated || existingUser) as User;
  }

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      telegram_id: tgUser.id,
      username: tgUser.username || null,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name || null,
      photo_url: tgUser.photo_url || null,
    })
    .select()
    .single();

  if (error || !newUser) {
    throw new Error('Failed to create user');
  }

  return newUser as User;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
