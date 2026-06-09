import { z } from 'zod';

export const authSchema = z.object({
  initData: z.string().min(1, 'initData is required'),
});

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  contact_name: z.string().min(2).max(100),
  contact_phone: z.string().min(10).max(20),
  contact_email: z.string().email().optional().or(z.literal('')),
  delivery_address: z.string().min(10).max(500),
  delivery_notes: z.string().max(500).optional(),
});

export const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().min(0),
  old_price: z.coerce.number().min(0).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  attributes: z.record(z.string(), z.string()).default({}),
  stock: z.coerce.number().int().min(0).default(0),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  note: z.string().max(500).optional(),
});

export const favoriteSchema = z.object({
  product_id: z.string().uuid(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
