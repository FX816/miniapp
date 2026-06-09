'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Favorite } from '@/types/database';
import { useTelegram } from '@/providers/telegram-provider';

export function useFavorites() {
  const { isAuthenticated, haptic } = useTelegram();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/favorites');
      const json = await res.json();
      if (json.success) {
        setFavorites(json.data);
        setFavoriteIds(new Set(json.data.map((f: Favorite) => f.product_id)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    const json = await res.json();
    if (json.success) {
      haptic(json.data.favorited ? 'success' : 'light');
      await fetchFavorites();
      return json.data.favorited;
    }
    return false;
  };

  const isFavorite = (productId: string) => favoriteIds.has(productId);

  return { favorites, favoriteIds, isLoading, toggleFavorite, isFavorite, refresh: fetchFavorites };
}
