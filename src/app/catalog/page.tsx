'use client';

import { Suspense, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ProductGrid } from '@/components/products/product-grid';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/use-products';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import type { Category } from '@/types/database';
import { useState } from 'react';

const sortOptions = [
  { value: 'newest', label: 'Новинки' },
  { value: 'popular', label: 'Популярные' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'rating', label: 'По рейтингу' },
] as const;

function CatalogContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const observerRef = useRef<HTMLDivElement>(null);

  const initialFilters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    featured: searchParams.get('featured') === 'true' || undefined,
    isNew: searchParams.get('new') === 'true' || searchParams.get('isNew') === 'true' || undefined,
    sort: (searchParams.get('sort') as 'newest') || 'newest',
  };

  const { products, isLoading, hasMore, filters, updateFilters, loadMore } = useProducts(initialFilters);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div>
      <Header title="Каталог" showSearch />

      <div className="space-y-4 px-4 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Button
            variant={!filters.category ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ category: undefined })}
          >
            Все
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filters.category === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ category: cat.id })}
              className="shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {sortOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={filters.sort === opt.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => updateFilters({ sort: opt.value })}
                className="shrink-0 text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <ProductGrid products={products} isLoading={isLoading} />

        {hasMore && (
          <div ref={observerRef} className="flex justify-center py-4">
            {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Товары не найдены</p>
            <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogContent />}>
      <CatalogContent />
    </Suspense>
  );
}
