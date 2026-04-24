import React from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  Grid3X3,
  Layers3,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserRound,
  Watch,
} from "lucide-react";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";

const CATEGORY_ICONS = {
  shirt: Shirt,
  user: UserRound,
  sparkles: Sparkles,
  layers: Layers3,
  bag: ShoppingBag,
  badge: BadgePercent,
  watch: Watch,
  grid: Grid3X3,
};

function HomeCategoryGrid({ categories }) {
  return (
    <section className="home-section" aria-labelledby="home-categories-title">
      <HomeSectionTitle
        title="Mua sắm theo danh mục"
        titleId="home-categories-title"
        actionLabel="Xem tất cả"
        actionTo="/products"
      />

      <div className="home-category-grid">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon] || Grid3X3;

          return (
            <Link key={category.id} to={category.to} className="home-category-item">
              <span>
                <Icon size={30} aria-hidden="true" />
              </span>
              <strong>{category.label}</strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(HomeCategoryGrid);
