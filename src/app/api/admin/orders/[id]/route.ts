import { createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { orderStatusSchema } from '@/lib/validations';
import type { StatusHistoryEntry } from '@/types/database';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status, note } = orderStatusSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: order } = await supabase
      .from('orders')
      .select('status_history, user_id')
      .eq('id', id)
      .single();

    if (!order) throw new Error('Order not found');

    const history = (order.status_history as StatusHistoryEntry[]) || [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || undefined,
    });

    const { data, error } = await supabase
      .from('orders')
      .update({ status, status_history: history })
      .eq('id', id)
      .select('*, items:order_items(*)')
      .single();

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: order.user_id,
      type: 'order',
      title: 'Статус заказа обновлён',
      message: `Ваш заказ #${id.slice(0, 8)} — ${status}`,
      data: { order_id: id, status },
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
