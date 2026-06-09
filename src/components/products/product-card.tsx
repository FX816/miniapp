'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types/database';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/use-favorites';
import { useTelegram } from '@/providers/telegram-provider';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useTelegram();
  const discount = calculateDiscount(product.price, product.old_price);
  const favorited = isFavorite(product.id);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    await toggleFavorite(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
              {product.is_new && <Badge variant="new">NEW</Badge>}
            </div>
            <button
              onClick={handleFavorite}
              className={cn(
                'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all',
                favorited && 'text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
            </button>
          </div>

          <div className="p-3">
            <h3 className="line-clamp-2 text-sm font-medium leading-tight">{product.name}</h3>

            <div className="mt-1.5 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ({product.review_count})
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-base font-bold">{formatPrice(product.price)}</span>
              {product.old_price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
