import React from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import Product from "@/shared/components/Product";
import HomeProductSkeleton from "@/features/home/components/HomeProductSkeleton";
import useCountdown from "@/features/home/hooks/useCountdown";
import { motion } from "framer-motion";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";

function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white border-2 border-primary text-primary w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-none text-2xl sm:text-3xl font-black shadow-[4px_4px_0px_0px_#0f172a]">
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-3">{label}</span>
    </div>
  );
}

function FlashSaleProgress({ sold = 0, total = 100 }) {
  const percentage = Math.min((sold / total) * 100, 100);
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-wider">Đã bán {sold}/{total}</span>
        <span className="text-[10px] font-black text-accent uppercase tracking-wider">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-accent"
        />
      </div>
    </div>
  );
}

function HomeFlashSale({ products, loading, saleEndsAt }) {
  const countdown = useCountdown(saleEndsAt);

  return (
    <section className="max-w-[1440px] mx-auto px-8 py-24 sm:py-32 bg-surface-bright" aria-labelledby="home-flash-title">
      <div className="flex flex-col items-center mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-px bg-primary/20"></div>
          <div className="flex items-center gap-2 text-accent">
            <Zap size={20} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Limited Time Only</span>
          </div>
          <div className="w-12 h-px bg-primary/20"></div>
        </div>

        <HomeSectionTitle
          title="Chương trình Flash Sale"
          titleId="home-flash-title"
          centered={true}
        />

        <div className="flex items-center gap-4 sm:gap-8 -mt-8">
          <CountdownBox value={countdown.hours} label="Giờ" />
          <span className="text-primary font-black text-4xl mb-6">:</span>
          <CountdownBox value={countdown.minutes} label="Phút" />
          <span className="text-primary font-black text-4xl mb-6">:</span>
          <CountdownBox value={countdown.seconds} label="Giây" />
        </div>
      </div>

      {loading ? (
        <HomeProductSkeleton count={4} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="flex flex-col">
              <Product product={product} />
              {/* Flash sale progress bar integration */}
              <div className="px-5 pb-5 bg-white border-x border-b border-slate-100 rounded-b-2xl -mt-5 pt-5">
                <FlashSaleProgress 
                  sold={product.sold || Math.floor(Math.random() * 40) + 10} 
                  total={product.stock + (product.sold || 0) || 100} 
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-20 text-center shadow-sm">
          <Zap size={48} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-2xl font-black text-primary mb-3">Chưa có Flash Sale nào diễn ra</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-10">Đừng bỏ lỡ các đợt giảm giá chớp nhoáng với ưu đãi cực khủng trong tương lai.</p>
          <Link to="/products" className="inline-block bg-primary text-white px-10 py-4 font-black uppercase tracking-widest text-xs">
            Mua sắm ngay
          </Link>
        </div>
      )}

      <div className="mt-20 text-center">
        <Link 
          to="/products?sort=price_asc" 
          className="group inline-flex items-center gap-4 text-xs font-black text-primary hover:text-accent transition-all uppercase tracking-[0.3em] pb-2 border-b-2 border-primary/10 hover:border-accent"
        >
          Khám phá tất cả ưu đãi
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

export default React.memo(HomeFlashSale);
