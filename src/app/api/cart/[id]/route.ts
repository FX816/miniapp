import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { cartUpdateSchema } from '@/lib/validations';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { quantity } = cartUpdateSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: cartItem } = await supabase
      .from('cart')
      .select('*, product:products(stock)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!cartItem) throw new Error('Cart item not found');
    if (cartItem.product && cartItem.product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
