import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { reviewSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    if (!productId) throw new Error('product_id is required');

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:users(first_name, last_name, photo_url, username)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return apiSuccess(data || []);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const review = reviewSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id, order:orders!inner(user_id, status)')
      .eq('product_id', review.product_id)
      .eq('order.user_id', user.id)
      .eq('order.status', 'delivered')
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        product_id: review.product_id,
        user_id: user.id,
        rating: review.rating,
        comment: review.comment || null,
        is_verified: !!orderItem,
      })
      .select('*, user:users(first_name, last_name, photo_url, username)')
      .single();

    if (error) throw error;
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
