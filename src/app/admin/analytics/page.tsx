'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/database';

interface AnalyticsData {
  revenue30d: number;
  ordersByStatus: Record<string, number>;
  dailyRevenue: Record<string, number>;
  topProducts: Product[];
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  refunded: 'Возврат',
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Аналитика</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Выручка за 30 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatPrice(data?.revenue30d || 0)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Заказы по статусам</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => (
            <div key={status} className="flex justify-between text-sm">
              <span>{statusLabels[status] || status}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Топ товаров</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.topProducts || []).map((product, i) => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sales_count} продаж</p>
              </div>
              <p className="text-sm font-bold">{formatPrice(product.price)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
