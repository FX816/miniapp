# Пошаговая инструкция деплоя TG Market

## Предварительные требования

- Аккаунт [Supabase](https://supabase.com)
- Аккаунт [Vercel](https://vercel.com)
- Telegram бот через [@BotFather](https://t.me/BotFather)
- Git репозиторий (GitHub/GitLab/Bitbucket)

---

## Шаг 1: Supabase

### 1.1 Создание проекта

1. Войдите в [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New Project** → укажите имя, пароль БД, регион
3. Дождитесь создания проекта (~2 мин)

### 1.2 Миграции базы данных

1. Откройте **SQL Editor**
2. Скопируйте и выполните `supabase/migrations/001_initial_schema.sql`
3. Затем выполните `supabase/migrations/002_seed_data.sql`
4. Проверьте в **Table Editor** — должны появиться таблицы и тестовые данные

### 1.3 Storage (для загрузки изображений)

1. **Storage** → **New bucket** → имя `products`
2. Сделайте bucket публичным (Public bucket)
3. Policy для загрузки (только service role через API):

```sql
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Service upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');
```

### 1.4 Ключи API

**Settings → API** — скопируйте:

| Переменная | Где найти |
|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (секретный!) |

---

## Шаг 2: Telegram Bot

### 2.1 Создание бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/newbot` → имя и username
3. Сохраните **Bot Token** → `TELEGRAM_BOT_TOKEN`

### 2.2 Mini App

```
/newapp
→ Выберите бота
→ Название: TG Market
→ Описание: Маркетплейс
→ Фото (опционально)
→ GIF (опционально)
→ URL: https://your-app.vercel.app (обновите после деплоя)
→ Short name: tgmarket
```

### 2.3 Кнопка меню

```
/setmenubutton
→ Выберите бота
→ URL: https://your-app.vercel.app
→ Текст кнопки: 🛒 Открыть магазин
```

---

## Шаг 3: Vercel

### 3.1 Импорт проекта

1. [vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. **Root Directory:** `tg-market`
4. Framework: Next.js (автоопределение)

### 3.2 Environment Variables

Добавьте все переменные из `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot
```

### 3.3 Deploy

1. Нажмите **Deploy**
2. Дождитесь завершения (~2-3 мин)
3. Скопируйте production URL

---

## Шаг 4: Финальная настройка

### 4.1 Обновите Telegram Mini App URL

В BotFather обновите URL Mini App на ваш Vercel домен.

### 4.2 Назначьте администратора

1. Откройте Mini App через бота (первый вход создаст пользователя)
2. В Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE telegram_id = YOUR_TELEGRAM_ID;
```

Узнать свой Telegram ID: [@userinfobot](https://t.me/userinfobot)

### 4.3 Проверка

- [ ] Открывается через Telegram бота
- [ ] Авторизация работает
- [ ] Каталог загружает товары
- [ ] Корзина и заказы работают
- [ ] Админ-панель доступна (`/admin`)

---

## Шаг 5: Custom Domain (опционально)

1. Vercel → **Settings → Domains**
2. Добавьте домен, настройте DNS
3. Обновите URL в BotFather и `NEXT_PUBLIC_APP_URL`

---

## Troubleshooting

| Проблема | Решение |
|---------|---------|
| «Unauthorized» при входе | Проверьте `TELEGRAM_BOT_TOKEN`, открывайте только через Telegram |
| Товары не загружаются | Проверьте Supabase ключи и миграции |
| 403 в админке | Назначьте `role = 'admin'` в таблице users |
| Изображения не отображаются | Добавьте домен в `next.config.ts` → `images.remotePatterns` |

---

## CI/CD

Vercel автоматически деплоит при push в main. Для preview-деплоев создаются отдельные URL для каждого PR.
