'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductFilters } from '@/types/database';

export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries({ ...filters, page: pageNum }).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.set(key, String(value));
          }
        });

        const res = await fetch(`/api/products?${params}`);
        const json = await res.json();

        if (json.success) {
          setProducts((prev) => (append ? [...prev, ...json.data.data] : json.data.data));
          setHasMore(json.data.hasMore);
          setPage(pageNum);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchProducts(page + 1, true);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return { products, isLoading, hasMore, filters, updateFilters, loadMore, refresh: () => fetchProducts(1) };
}
