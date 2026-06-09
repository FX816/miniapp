import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { checkoutSchema } from '@/lib/validations';
import type { StatusHistoryEntry } from '@/types/database';

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
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
    const checkout = checkoutSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', user.id);

    if (cartError) throw cartError;
    if (!cartItems?.length) throw new Error('Cart is empty');

    const activeItems = cartItems.filter((item) => item.product?.is_active);
    if (!activeItems.length) throw new Error('No available items in cart');

    for (const item of activeItems) {
      if (!item.product || item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product?.name}`);
      }
    }

    const totalAmount = activeItems.reduce(
      (sum, item) => sum + item.product!.price * item.quantity,
      0
    );

    const statusHistory: StatusHistoryEntry[] = [
      { status: 'pending', timestamp: new Date().toISOString(), note: 'Заказ создан' },
    ];

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        contact_name: checkout.contact_name,
        contact_phone: checkout.contact_phone,
        contact_email: checkout.contact_email || null,
        delivery_address: checkout.delivery_address,
        delivery_notes: checkout.delivery_notes || null,
        status_history: statusHistory,
      })
      .select()
      .single();

    if (orderError || !order) throw orderError || new Error('Failed to create order');

    const orderItems = activeItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product!.name,
      product_image: item.product!.images?.[0] || null,
      price: item.product!.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    for (const item of activeItems) {
      await supabase
        .from('products')
        .update({
          stock: item.product!.stock - item.quantity,
          sales_count: (item.product!.sales_count || 0) + item.quantity,
        })
        .eq('id', item.product_id);
    }

    await supabase.from('cart').delete().eq('user_id', user.id);

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'order',
      title: 'Заказ оформлен',
      message: `Ваш заказ #${order.id.slice(0, 8)} на сумму ${totalAmount} ₽ успешно создан`,
      data: { order_id: order.id },
    });

    return apiSuccess(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
