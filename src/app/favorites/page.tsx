'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { ProductGrid } from '@/components/products/product-grid';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { useTelegram } from '@/providers/telegram-provider';

export default function FavoritesPage() {
  const { favorites, isLoading } = useFavorites();
  const { isAuthenticated } = useTelegram();

  const products = favorites.map((f) => f.product!).filter(Boolean);

  if (!isAuthenticated) {
    return (
      <div>
        <Header title="Избранное" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Heart className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium">Войдите через Telegram</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Избранное" />
      <div className="p-4">
        {products.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium">Список пуст</p>
            <p className="text-sm text-muted-foreground mb-4">Добавляйте товары в избранное</p>
            <Button asChild>
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={products} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
