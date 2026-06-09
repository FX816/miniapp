'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { useTelegram } from '@/providers/telegram-provider';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, total, isLoading, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useTelegram();

  if (!isAuthenticated) {
    return (
      <div>
        <Header title="Корзина" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium">Войдите через Telegram</p>
          <p className="text-sm text-muted-foreground">Для доступа к корзине</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Header title="Корзина" />
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <Header title="Корзина" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium">Корзина пуста</p>
          <p className="text-sm text-muted-foreground mb-4">Добавьте товары из каталога</p>
          <Button asChild>
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <Header title={`Корзина (${items.length})`} />

      <div className="space-y-3 p-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-2xl border border-border p-3">
            <Link href={`/product/${item.product_id}`} className="shrink-0">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={item.product?.images?.[0] || '/placeholder.svg'}
                  alt={item.product?.name || ''}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${item.product_id}`}>
                  <h3 className="text-sm font-medium line-clamp-2">{item.product?.name}</h3>
                </Link>
                <p className="mt-1 text-sm font-bold">
                  {formatPrice(item.product?.price || 0)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl p-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground">Итого:</span>
            <span className="text-xl font-bold">{formatPrice(total)}</span>
          </div>
          <Button variant="telegram" size="lg" className="w-full" asChild>
            <Link href="/checkout">Оформить заказ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
