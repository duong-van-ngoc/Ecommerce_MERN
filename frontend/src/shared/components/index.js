/**
 * shared/components — Master barrel export.
 *
 * Sub-groups:
 *   @/shared/components/layout  → Navbar, Footer
 *   @/shared/components/ui      → PageTitle, Loader, Pagination, Rating
 *   @/shared/components/product → ProductCard, NoProducts
 *
 * This file re-exports everything so existing flat imports keep working:
 *   import Navbar from '@/shared/components/Navbar'       ✅ still works (file untouched)
 *   import { Navbar } from '@/shared/components/layout'  ✅ new preferred style
 *   import { Navbar, Footer } from '@/shared/components' ✅ also works via this barrel
 */

// ── Layout ──────────────────────────────────────────────────────────────────
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as BrandLogo } from './BrandLogo';

// ── UI Primitives ────────────────────────────────────────────────────────────
export { default as PageTitle } from './PageTitle';
export { default as Loader } from './Loader';
export { default as Pagination } from './Pagination';
export { default as Rating } from './Rating';

// ── Product ──────────────────────────────────────────────────────────────────
export { default as ProductCard } from './Product';
export { default as NoProducts } from './NoProducts';
