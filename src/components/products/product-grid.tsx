'use client';

import type { Product } from '@/types/database';
import { ProductCard } from './product-card';
import { ProductSkeleton } from './product-skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({ products, isLoading, skeletonCount = 6 }: ProductGridProps) {
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
