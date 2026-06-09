import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { favoriteSchema } from '@/lib/validations';

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('favorites')
      .select('*, product:products(*)')
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
    const { product_id } = favoriteSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return apiSuccess({ favorited: false });
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, product_id })
      .select()
      .single();

    if (error) throw error;
    return apiSuccess({ favorited: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
