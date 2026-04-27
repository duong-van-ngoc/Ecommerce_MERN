/**
 * shared/components/product — Barrel export.
 * Product-related shared components used across features (home, products, admin...).
 *
 * Usage:
 *   import { ProductCard, NoProducts } from '@/shared/components/product';
 *
 * Note: ProductCard is the canonical name for Product.jsx
 */

// ProductCard: shared product card used in home + product list + related
export { default as ProductCard } from '../Product';

// NoProducts: empty-state placeholder used in product listing pages
export { default as NoProducts } from '../NoProducts';
