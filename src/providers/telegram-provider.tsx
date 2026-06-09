'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/types/database';

interface TelegramContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initData: string | null;
  webApp: TelegramWebApp | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  haptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initData, setInitData] = useState<string | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  const haptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
      if (!webApp?.HapticFeedback) return;
      if (type === 'success' || type === 'error') {
        webApp.HapticFeedback.notificationOccurred(type);
      } else {
        webApp.HapticFeedback.impactOccurred(type);
      }
    },
    [webApp]
  );

  const login = useCallback(async () => {
    if (!initData) return;

    const res = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });

    const json = await res.json();
    if (json.success) {
      setUser(json.data.user);
      haptic('success');
    }
  }, [initData, haptic]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setInitData(tg.initData);

      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      }

      tg.setHeaderColor(tg.themeParams.bg_color || '#ffffff');
      tg.setBackgroundColor(tg.themeParams.bg_color || '#ffffff');
    }

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUser(json.data.user);
        } else if (tg?.initData) {
          return fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData }),
          }).then((r) => r.json());
        }
      })
      .then((json) => {
        if (json?.success) setUser(json.data.user);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        initData,
        webApp,
        login,
        logout,
        haptic,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) throw new Error('useTelegram must be used within TelegramProvider');
  return context;
}
