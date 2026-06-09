'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Heart, ShoppingBag, ChevronLeft, Minus, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Review } from '@/types/database';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/hooks/use-cart';
import { useFavorites } from '@/hooks/use-favorites';
import { useTelegram } from '@/providers/telegram-provider';
import { getInitials } from '@/lib/utils';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [emblaRef] = useEmblaCarousel({ loop: false });
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useTelegram();

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch(`/api/reviews?product_id=${id}`).then((r) => r.json()),
    ]).then(([productRes, reviewsRes]) => {
      if (productRes.success) setProduct(productRes.data);
      if (reviewsRes.success) setReviews(reviewsRes.data);
    }).finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите через Telegram');
      return;
    }
    try {
      await addToCart(id, quantity);
      toast.success('Добавлено в корзину');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Товар не найден</p>
        <Button variant="link" onClick={() => router.back()}>Назад</Button>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.old_price);
  const favorited = isFavorite(product.id);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-xl px-4 py-3 safe-top">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="flex-1 truncate font-medium">{product.name}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(product.id)}
          className={cn(favorited && 'text-red-500')}
        >
          <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
        </Button>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {(product.images.length ? product.images : ['/placeholder.svg']).map((img, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%] aspect-square">
              <Image src={img} alt={product.name} fill className="object-cover" sizes="100vw" priority={i === 0} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex gap-2">
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
          {product.is_new && <Badge variant="new">NEW</Badge>}
        </div>

        <h1 className="text-xl font-bold leading-tight">{product.name}</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.rating.toFixed(1)} · {product.review_count} отзывов
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
          {product.old_price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {product.description && (
          <div>
            <h3 className="mb-2 font-semibold">Описание</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}

        {Object.keys(product.attributes).length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold">Характеристики</h3>
            <div className="space-y-2 rounded-xl bg-secondary/50 p-3">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Количество:</span>
          <div className="flex items-center gap-2 rounded-xl border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">В наличии: {product.stock}</span>
        </div>

        {reviews.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">Отзывы ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.user?.photo_url || undefined} />
                      <AvatarFallback>{getInitials(review.user?.first_name || 'U')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.user?.first_name}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn('h-3 w-3', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted')}
                          />
                        ))}
                      </div>
                    </div>
                    {review.is_verified && (
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        <Check className="mr-1 h-3 w-3" /> Покупка
                      </Badge>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl p-4 safe-bottom">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={handleAddToCart}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            В корзину
          </Button>
          <Button variant="telegram" size="lg" className="flex-1" onClick={handleBuyNow}>
            Купить
          </Button>
        </div>
      </div>
    </div>
  );
}
