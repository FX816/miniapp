# TG Market — Telegram Mini App Маркетплейс

Полноценный маркетплейс в формате Telegram Mini App, вдохновлённый MRKT, Uzum и Wildberries.

## Стек технологий

- **Frontend:** Next.js 15+ (App Router), TypeScript, TailwindCSS, Shadcn/UI
- **Backend:** Supabase (PostgreSQL, Storage, Auth)
- **Auth:** Telegram WebApp initData validation
- **Deploy:** Vercel

## Функционал

- Регистрация и авторизация через Telegram
- Каталог с фильтрацией, сортировкой и бесконечной прокруткой
- Карточка товара с галереей, отзывами и характеристиками
- Корзина и оформление заказа
- Избранное, профиль, история заказов
- Админ-панель: товары, заказы, пользователи, аналитика
- Dark/Light mode, skeleton loading, haptic feedback

## Быстрый старт

### 1. Клонирование и установка

```bash
cd tg-market
npm install
cp .env.example .env.local
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в **SQL Editor** и выполните миграции по порядку:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
3. Скопируйте ключи из **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Storage (опционально)

1. Создайте bucket `products` в **Storage**
2. Настройте публичный доступ для чтения
3. Используйте URL из Storage для изображений товаров

### 3. Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите `TELEGRAM_BOT_TOKEN`
3. Настройте Mini App:
   ```
   /newapp
   /setmenubutton — укажите URL вашего приложения
   ```

### 4. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

> Для полноценного тестирования Telegram SDK откройте приложение через бота в Telegram.

### 5. Назначение администратора

После первого входа через Telegram выполните в Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE telegram_id = YOUR_TELEGRAM_ID;
```

## Структура проекта

```
tg-market/
├── supabase/migrations/     # SQL миграции
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes
│   │   ├── admin/           # Админ-панель
│   │   ├── catalog/         # Каталог
│   │   ├── product/         # Карточка товара
│   │   ├── cart/            # Корзина
│   │   ├── checkout/        # Оформление заказа
│   │   ├── profile/         # Профиль
│   │   ├── favorites/       # Избранное
│   │   └── orders/          # Заказы
│   ├── components/          # React компоненты
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Утилиты, auth, supabase
│   ├── providers/           # Context providers
│   └── types/               # TypeScript типы
├── public/
├── .env.example
└── README.md
```

## API Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/auth/telegram` | Авторизация через Telegram |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/products` | Список товаров (фильтры, пагинация) |
| GET | `/api/products/[id]` | Товар по ID |
| GET/POST | `/api/cart` | Корзина |
| GET/POST | `/api/favorites` | Избранное |
| GET/POST | `/api/orders` | Заказы |
| GET | `/api/reviews` | Отзывы |
| GET | `/api/admin/analytics` | Аналитика (admin) |

## Безопасность

- Валидация Telegram `initData` через HMAC-SHA256
- Rate limiting на API endpoints
- Zod валидация всех входных данных
- Row Level Security (RLS) в PostgreSQL
- HttpOnly session cookies
- Parameterized queries через Supabase client (защита от SQL Injection)

## Деплой на Vercel

### Шаг 1: Подготовка

```bash
# Убедитесь что проект собирается
npm run build
```

### Шаг 2: Vercel

1. Импортируйте репозиторий на [vercel.com](https://vercel.com)
2. Root Directory: `tg-market`
3. Framework Preset: **Next.js**

### Шаг 3: Environment Variables

Добавьте в Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Шаг 4: Telegram Mini App URL

1. В BotFather обновите URL Mini App на ваш Vercel домен
2. `/setmenubutton` → укажите `https://your-app.vercel.app`

### Шаг 5: Supabase

1. В Supabase → Authentication → URL Configuration добавьте Vercel домен
2. Убедитесь что миграции применены на production базе

### Шаг 6: Проверка

1. Откройте бота в Telegram
2. Нажмите кнопку меню / Mini App
3. Проверьте авторизацию, каталог, корзину

## База данных

### Таблицы

- `users` — пользователи Telegram
- `categories` — категории товаров
- `products` — товары
- `banners` — промо-баннеры
- `cart` — корзина
- `favorites` — избранное
- `orders` — заказы
- `order_items` — позиции заказа
- `reviews` — отзывы
- `notifications` — уведомления

Все таблицы имеют индексы, foreign keys и RLS policies.

## Лицензия

MIT
