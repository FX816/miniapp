import { createServiceClient } from '@/lib/supabase/server';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return apiSuccess(data || []);
  } catch (error) {
    return handleApiError(error);
  }
}
