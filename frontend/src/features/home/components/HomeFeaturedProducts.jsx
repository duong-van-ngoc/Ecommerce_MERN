import React from "react";
import Product from "@/shared/components/Product";
import HomeProductSkeleton from "@/features/home/components/HomeProductSkeleton";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function HomeFeaturedProducts({ products, loading }) {
  // Take only first 8 for home
  const displayProducts = products.slice(0, 8);

  return (
    <section className="max-w-[1440px] mx-auto px-8 py-24 sm:py-32 bg-white" aria-labelledby="home-featured-title">
      <div className="flex flex-col items-center mb-16">
        <HomeSectionTitle
          title="Bộ sưu tập mới"
          titleId="home-featured-title"
          centered={true}
        />
      </div>

      {loading ? (
        <HomeProductSkeleton count={8} />
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Product product={product} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-20 text-center shadow-sm">
          <h3 className="text-2xl font-black text-primary mb-3">Chưa có sản phẩm nào</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-10">Vui lòng quay lại sau để cập nhật bộ sưu tập mới nhất.</p>
        </div>
      )}

      <div className="mt-20 text-center">
        <Link 
          to="/products" 
          className="group inline-flex items-center gap-4 text-xs font-black text-primary hover:text-accent transition-all uppercase tracking-[0.3em] pb-2 border-b-2 border-primary/10 hover:border-accent"
        >
          Xem tất cả sản phẩm
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

export default React.memo(HomeFeaturedProducts);
