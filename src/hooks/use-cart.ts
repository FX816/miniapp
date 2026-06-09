'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '@/types/database';
import { useTelegram } from '@/providers/telegram-provider';

export function useCart() {
  const { isAuthenticated, haptic } = useTelegram();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart');
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
        setTotal(json.data.total);
        setCount(json.data.count);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    const json = await res.json();
    if (json.success) {
      haptic('success');
      await fetchCart();
    } else {
      haptic('error');
      throw new Error(json.error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const res = await fetch(`/api/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    const json = await res.json();
    if (json.success) {
      haptic('light');
      await fetchCart();
    }
  };

  const removeItem = async (id: string) => {
    const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      haptic('medium');
      await fetchCart();
    }
  };

  return { items, total, count, isLoading, addToCart, updateQuantity, removeItem, refresh: fetchCart };
}
