import { createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalOrders },
      { data: recentOrders },
      { data: topProducts },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('products')
        .select('id, name, sales_count, price, images')
        .eq('is_active', true)
        .order('sales_count', { ascending: false })
        .limit(10),
    ]);

    const revenue = (recentOrders || [])
      .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const ordersByStatus = (recentOrders || []).reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const dailyRevenue = (recentOrders || []).reduce(
      (acc, o) => {
        if (o.status === 'cancelled' || o.status === 'refunded') return acc;
        const day = o.created_at.split('T')[0];
        acc[day] = (acc[day] || 0) + Number(o.total_amount);
        return acc;
      },
      {} as Record<string, number>
    );

    return apiSuccess({
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      revenue30d: revenue,
      ordersByStatus,
      dailyRevenue,
      topProducts: topProducts || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
