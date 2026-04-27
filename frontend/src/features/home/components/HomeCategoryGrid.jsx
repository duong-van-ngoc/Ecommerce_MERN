import React from "react";
import { Link } from "react-router-dom";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";
import { motion } from "framer-motion";

const CATEGORY_ICONS = {
  shirt: "apparel",
  user: "person",
  sparkles: "auto_awesome",
  layers: "layers",
  bag: "shopping_bag",
  badge: "sell",
  watch: "watch",
  grid: "grid_view",
};

function HomeCategoryGrid({ categories = [] }) {
  const displayCategories = categories.slice(0, 6);

  return (
    <section className="bg-bg-primary py-24 sm:py-32" aria-labelledby="home-categories-title">
      <div className="max-w-[1280px] mx-auto px-6">
        <HomeSectionTitle
          title="Bộ Sưu Tập"
          titleId="home-categories-title"
          centered={true}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 lg:gap-8">
          {displayCategories.map((category, index) => {
            const iconName = CATEGORY_ICONS[category.icon] || "grid_view";
            
            // Layout logic for bento style (some cards can be larger)
            const isLarge = index === 0 || index === 5;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`${isLarge ? "col-span-2 md:col-span-2" : "col-span-1 md:col-span-1"}`}
              >
                <Link 
                  to={category.to} 
                  className="group relative block aspect-[4/5] overflow-hidden bg-white shadow-soft hover:shadow-luxury transition-all duration-500 rounded-2xl"
                >
                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                      <span className="material-symbols-outlined !text-[24px] group-hover:scale-110 transition-transform">
                        {iconName}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2 block">
                        KHÁM PHÁ
                      </span>
                      <h3 className="text-lg font-black text-primary uppercase tracking-tight group-hover:text-accent transition-colors">
                        {category.label}
                      </h3>
                    </div>
                  </div>

                  {/* Aesthetic Background Pattern/Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50" />
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-500" />
                  
                  {/* Subtle border on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/10 transition-all rounded-2xl" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default React.memo(HomeCategoryGrid);
