'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/types/database';
import { formatPrice, formatDate } from '@/lib/utils';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'sale' | 'new' }> = {
  pending: { label: 'Ожидает', variant: 'secondary' },
  confirmed: { label: 'Подтверждён', variant: 'default' },
  processing: { label: 'В обработке', variant: 'default' },
  shipped: { label: 'Отправлен', variant: 'new' },
  delivered: { label: 'Доставлен', variant: 'new' },
  cancelled: { label: 'Отменён', variant: 'sale' },
  refunded: { label: 'Возврат', variant: 'sale' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Header title="Мои заказы" />

      <div className="space-y-3 p-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium">Заказов пока нет</p>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusLabels[order.status] || statusLabels.pending;
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-secondary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{order.id.slice(0, 8)}</span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(order.total_amount)}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
