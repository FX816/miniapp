'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Обзор' },
  { href: '/admin/products', icon: Package, label: 'Товары' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Заказы' },
  { href: '/admin/users', icon: Users, label: 'Пользователи' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Аналитика' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">Админ-панель</h1>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 scrollbar-hide">
        {adminNav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4">{children}</div>
    </div>
  );
}
