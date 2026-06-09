'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { BannerCarousel } from '@/components/home/banner-carousel';
import { CategoryScroll } from '@/components/home/category-scroll';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/products/product-grid';
import type { Banner, Category, Product } from '@/types/database';

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/banners').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products?featured=true&limit=6').then((r) => r.json()),
      fetch('/api/products?isNew=true&limit=6').then((r) => r.json()),
    ]).then(([bannersRes, categoriesRes, featuredRes, newRes]) => {
      if (bannersRes.success) setBanners(bannersRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (featuredRes.success) setFeatured(featuredRes.data.data);
      if (newRes.success) setNewProducts(newRes.data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Header showSearch />
      <div className="space-y-6 px-4 py-4">
        {banners.length > 0 && <BannerCarousel banners={banners} />}

        {categories.length > 0 && (
          <section>
            <SectionHeader title="Категории" href="/catalog" />
            <CategoryScroll categories={categories} />
          </section>
        )}

        <section>
          <SectionHeader title="Популярное" href="/catalog?featured=true" />
          <ProductGrid products={featured} isLoading={isLoading} />
        </section>

        <section>
          <SectionHeader title="Новинки" href="/catalog?isNew=true" />
          <ProductGrid products={newProducts} isLoading={isLoading} />
        </section>
      </div>
    </div>
  );
}
