'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types/database';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
  electronics: '📱',
  clothing: '👕',
  shoes: '👟',
  beauty: '💄',
  home: '🏠',
  sport: '⚽',
};

interface CategoryScrollProps {
  categories: Category[];
}

export function CategoryScroll({ categories }: CategoryScrollProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalog?category=${category.id}`}
          className="flex shrink-0 flex-col items-center gap-2"
        >
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl',
            'bg-secondary text-2xl transition-transform hover:scale-105'
          )}>
            {category.image_url ? (
              <Image src={category.image_url} alt={category.name} width={32} height={32} />
            ) : (
              categoryIcons[category.slug] || '📦'
            )}
          </div>
          <span className="max-w-[72px] truncate text-center text-xs font-medium">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
