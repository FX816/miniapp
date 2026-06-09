'use client';

import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

interface Analytics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue30d: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: 'Пользователи', value: data?.totalUsers, icon: Users },
    { label: 'Товары', value: data?.totalProducts, icon: Package },
    { label: 'Заказы', value: data?.totalOrders, icon: ShoppingCart },
    { label: 'Выручка (30д)', value: data?.revenue30d, icon: TrendingUp, format: true },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Обзор</h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, format }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">
                  {format ? formatPrice(value || 0) : value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
