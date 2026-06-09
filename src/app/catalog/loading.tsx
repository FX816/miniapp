import { Header } from '@/components/layout/header';
import { ProductSkeleton } from '@/components/products/product-skeleton';

export default function CatalogLoading() {
  return (
    <div>
      <Header title="Каталог" showSearch />
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
