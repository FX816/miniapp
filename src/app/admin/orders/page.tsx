'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/types/database';
import { formatPrice, formatDate } from '@/lib/utils';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  refunded: 'Возврат',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.data);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success('Статус обновлён');
      fetchOrders();
    } else {
      toast.error(json.error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Заказы</h2>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
      ) : (
        orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
              <Badge>{statusLabels[order.status]}</Badge>
            </div>
            <p className="text-sm font-bold">{formatPrice(order.total_amount)}</p>
            <p className="text-xs text-muted-foreground">{order.contact_name} · {order.contact_phone}</p>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <Button
                  key={s}
                  variant={order.status === s ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => updateStatus(order.id, s)}
                  disabled={order.status === s}
                >
                  {statusLabels[s]}
                </Button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
