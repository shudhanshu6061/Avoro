import type { Product } from '@/types/product';
import type { ProductPageContent } from '@/lib/productPageContentData';
import { getPageContentPreset } from '@/lib/productPageContentData';

export type { ProductPageContent };

export function resolveProductPageContent(product: Product): ProductPageContent | null {
  if (product.pageContent) {
    return product.pageContent as unknown as ProductPageContent;
  }
  return getPageContentPreset(product.slug);
}