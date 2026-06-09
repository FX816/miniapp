import { createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { productFiltersSchema, productSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = rateLimit(`products:${ip}`);
    if (!success) return handleApiError(new Error('Too many requests'));

    const { searchParams } = new URL(request.url);
    const filters = productFiltersSchema.parse(Object.fromEntries(searchParams));

    const supabase = createServiceClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_active', true);

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters.isNew) {
      query = query.eq('is_new', true);
    }

    switch (filters.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'popular':
        query = query.order('sales_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const from = (filters.page - 1) * filters.limit;
    query = query.range(from, from + filters.limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return apiSuccess({
      data: data || [],
      total: count || 0,
      page: filters.page,
      limit: filters.limit,
      hasMore: (count || 0) > filters.page * filters.limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = productSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
