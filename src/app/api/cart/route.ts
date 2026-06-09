import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { cartItemSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items = (data || []).filter((item) => item.product?.is_active);
    const total = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    return apiSuccess({ items, total, count: items.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { product_id, quantity } = cartItemSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: product } = await supabase
      .from('products')
      .select('id, stock, is_active')
      .eq('id', product_id)
      .single();

    if (!product?.is_active) throw new Error('Product not available');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) throw new Error('Insufficient stock');

      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: newQty })
        .eq('id', existing.id)
        .select('*, product:products(*)')
        .single();

      if (error) throw error;
      return apiSuccess(data);
    }

    const { data, error } = await supabase
      .from('cart')
      .insert({ user_id: user.id, product_id, quantity })
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    const supabase = createServiceClient();

    const { error } = await supabase.from('cart').delete().eq('user_id', user.id);
    if (error) throw error;

    return apiSuccess({ cleared: true });
  } catch (error) {
    return handleApiError(error);
  }
}
