'use client';

import Link from 'next/link';
import { Package, Heart, Shield, ChevronRight, Wallet, Moon, Sun } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTelegram } from '@/providers/telegram-provider';
import { useTheme } from '@/providers/theme-provider';
import { formatPrice, getInitials } from '@/lib/utils';

const menuItems = [
  { href: '/orders', icon: Package, label: 'Мои заказы' },
  { href: '/favorites', icon: Heart, label: 'Избранное' },
];

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useTelegram();
  const { theme, setTheme } = useTheme();

  if (isLoading) {
    return (
      <div>
        <Header title="Профиль" />
        <div className="flex flex-col items-center p-6 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div>
        <Header title="Профиль" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-lg font-medium">Откройте в Telegram</p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Это приложение работает как Telegram Mini App
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  return (
    <div>
      <Header title="Профиль" />

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photo_url || undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(`${user.first_name} ${user.last_name || ''}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">
              {user.first_name} {user.last_name}
            </h2>
            {user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Баланс</p>
            <p className="text-lg font-bold">{formatPrice(user.balance)}</p>
          </div>
        </div>

        <div className="space-y-1">
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 font-medium">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="flex-1 text-left font-medium">
              {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            </span>
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
            >
              <Shield className="h-5 w-5 text-primary" />
              <span className="flex-1 font-medium">Админ-панель</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
