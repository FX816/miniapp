import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return apiError('Order not found', 404);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
