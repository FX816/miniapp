-- Seed categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Электроника', 'electronics', 'Смартфоны, ноутбуки и гаджеты', 1),
  ('Одежда', 'clothing', 'Модная одежда для всех', 2),
  ('Обувь', 'shoes', 'Кроссовки и обувь', 3),
  ('Красота', 'beauty', 'Косметика и уход', 4),
  ('Дом', 'home', 'Товары для дома', 5),
  ('Спорт', 'sport', 'Спортивные товары', 6);

-- Seed banners
INSERT INTO banners (title, subtitle, image_url, link_url, link_type, sort_order) VALUES
  ('Летняя распродажа', 'Скидки до 50%', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800', '/catalog?sale=true', 'catalog', 1),
  ('Новинки недели', 'Только лучшее', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', '/catalog?new=true', 'catalog', 2),
  ('Бесплатная доставка', 'От 5000 ₽', 'https://images.unsplash.com/photo-1563013547-7f1bf05dd975?w=800', '/catalog', 'catalog', 3);

-- Seed products
INSERT INTO products (category_id, name, slug, description, price, old_price, images, attributes, stock, is_featured, is_new, rating, review_count, sales_count)
SELECT
  c.id,
  p.name,
  p.slug,
  p.description,
  p.price,
  p.old_price,
  p.images,
  p.attributes::jsonb,
  p.stock,
  p.is_featured,
  p.is_new,
  p.rating,
  p.review_count,
  p.sales_count
FROM categories c
CROSS JOIN (VALUES
  ('electronics', 'iPhone 15 Pro', 'iphone-15-pro', 'Флагманский смартфон Apple с титановым корпусом и камерой 48MP', 99990.00, 119990.00, ARRAY['https://images.unsplash.com/photo-1695048133142-1c204c0e0b8b?w=600','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'], '{"color":"Natural Titanium","storage":"256GB","display":"6.1 inch"}', 25, true, true, 4.8, 124, 89),
  ('electronics', 'MacBook Air M3', 'macbook-air-m3', 'Ультратонкий ноутбук с чипом M3', 129990.00, 149990.00, ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'], '{"color":"Midnight","ram":"16GB","storage":"512GB"}', 15, true, false, 4.9, 87, 56),
  ('electronics', 'AirPods Pro 2', 'airpods-pro-2', 'Беспроводные наушники с шумоподавлением', 24990.00, 29990.00, ARRAY['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'], '{"color":"White","anc":"Active"}', 50, true, false, 4.7, 203, 312),
  ('clothing', 'Куртка Premium', 'premium-jacket', 'Стильная куртка из премиальных материалов', 12990.00, 18990.00, ARRAY['https://images.unsplash.com/photo-1551028711-00167b16eac5?w=600'], '{"size":"M,L,XL","material":"Cotton blend"}', 30, false, true, 4.5, 45, 78),
  ('clothing', 'Джинсы Slim Fit', 'jeans-slim-fit', 'Классические джинсы slim fit', 4990.00, 6990.00, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'], '{"size":"28-36","color":"Blue"}', 100, false, false, 4.3, 67, 145),
  ('shoes', 'Nike Air Max 90', 'nike-air-max-90', 'Легендарные кроссовки Nike', 14990.00, 17990.00, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], '{"size":"40-45","color":"White/Red"}', 40, true, false, 4.6, 156, 234),
  ('shoes', 'Adidas Ultraboost', 'adidas-ultraboost', 'Беговые кроссовки с технологией Boost', 16990.00, NULL, ARRAY['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'], '{"size":"39-44","color":"Black"}', 35, false, true, 4.7, 89, 112),
  ('beauty', 'Набор ухода за кожей', 'skincare-set', 'Полный набор для ежедневного ухода', 5990.00, 8990.00, ARRAY['https://images.unsplash.com/photo-1556228578-0d95b1a55884?w=600'], '{"items":"5","skin_type":"All"}', 60, true, true, 4.4, 78, 167),
  ('home', 'Умная колонка', 'smart-speaker', 'Голосовой помощник с отличным звуком', 8990.00, 11990.00, ARRAY['https://images.unsplash.com/photo-1543512214-318855644a0e?w=600'], '{"assistant":"Built-in","color":"Black"}', 45, false, false, 4.2, 34, 89),
  ('sport', 'Фитнес-браслет', 'fitness-band', 'Трекер активности с пульсометром', 3990.00, 5490.00, ARRAY['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600'], '{"waterproof":"IP68","battery":"14 days"}', 80, true, true, 4.5, 112, 198)
) AS p(cat_slug, name, slug, description, price, old_price, images, attributes, stock, is_featured, is_new, rating, review_count, sales_count)
WHERE c.slug = p.cat_slug;
