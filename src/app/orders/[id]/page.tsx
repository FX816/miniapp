'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Check } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/types/database';
import { formatPrice, formatDate, cn } from '@/lib/utils';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusLabels: Record<string, string> = {
  pending: 'Создан',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  refunded: 'Возврат',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center py-20">
        <p>Заказ не найден</p>
        <Button variant="link" onClick={() => router.back()}>Назад</Button>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-xl px-4 py-3 safe-top">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-medium">Заказ #{order.id.slice(0, 8)}</span>
      </div>

      <div className="space-y-6 p-4">
        {!['cancelled', 'refunded'].includes(order.status) && (
          <div className="rounded-2xl border border-border p-4">
            <h3 className="mb-4 font-semibold">Статус заказа</h3>
            <div className="flex justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      i <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i <= currentStep ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="mt-1 text-[10px] text-center text-muted-foreground">
                    {statusLabels[step]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border p-4 space-y-2">
          <h3 className="font-semibold mb-2">Товары</h3>
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3 py-2">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.product_image && (
                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 font-bold">
            <span>Итого</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-semibold">Доставка</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Имя:</span> {order.contact_name}</p>
            <p><span className="text-muted-foreground">Телефон:</span> {order.contact_phone}</p>
            <p><span className="text-muted-foreground">Адрес:</span> {order.delivery_address}</p>
            {order.delivery_notes && (
              <p><span className="text-muted-foreground">Комментарий:</span> {order.delivery_notes}</p>
            )}
          </div>
        </div>

        {order.status_history?.length > 0 && (
          <div className="rounded-2xl border border-border p-4">
            <h3 className="font-semibold mb-3">История статусов</h3>
            <div className="space-y-3">
              {order.status_history.map((entry, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="font-medium">{statusLabels[entry.status]}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                    {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
