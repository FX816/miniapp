import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '@/lib/auth';

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(error.message, error.statusCode);
  }
  if (error instanceof ZodError) {
    return apiError(error.issues.map((i) => i.message).join(', '), 422);
  }
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    return apiError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500
    );
  }
  return apiError('Internal server error', 500);
}
