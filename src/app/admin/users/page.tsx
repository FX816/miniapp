'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/types/database';
import { formatPrice, getInitials, formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setUsers(json.data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Пользователи</h2>

      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
      ) : (
        users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Avatar>
              <AvatarImage src={user.photo_url || undefined} />
              <AvatarFallback>{getInitials(user.first_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{user.first_name} {user.last_name}</p>
                {user.role !== 'user' && <Badge variant="secondary">{user.role}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.username ? `@${user.username}` : `ID: ${user.telegram_id}`} · {formatDate(user.created_at)}
              </p>
            </div>
            <p className="text-sm font-bold">{formatPrice(user.balance)}</p>
          </div>
        ))
      )}
    </div>
  );
}
