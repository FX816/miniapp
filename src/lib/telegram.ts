import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

const AUTH_MAX_AGE_SECONDS = 86400; // 24 hours

export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): { valid: boolean; data?: TelegramInitData; error?: string } {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return { valid: false, error: 'Missing hash' };
    }

    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid hash' };
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);

    if (now - authDate > AUTH_MAX_AGE_SECONDS) {
      return { valid: false, error: 'Auth data expired' };
    }

    const userStr = urlParams.get('user');
    let user: TelegramUser | undefined;

    if (userStr) {
      user = JSON.parse(userStr) as TelegramUser;
    }

    return {
      valid: true,
      data: {
        user,
        auth_date: authDate,
        hash,
        query_id: urlParams.get('query_id') || undefined,
        start_param: urlParams.get('start_param') || undefined,
      },
    };
  } catch {
    return { valid: false, error: 'Failed to parse init data' };
  }
}

export function getTelegramPhotoUrl(userId: number): string {
  return `https://t.me/i/userpic/320/${userId}.jpg`;
}
