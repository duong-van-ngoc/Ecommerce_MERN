import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BrandLogo from "@/shared/components/BrandLogo";

const BANNERS = [
  {
    id: 1,
    image: "/images/banner_1.png",
    subtitle: "Phiên bản giới hạn",
    title: "BỘ SƯU TẬP MỚI",
    year: "2024",
    description:
      "Khám phá phong cách thời trang tối giản, sang trọng và định hình dấu ấn cá nhân cùng TOBI SHOP.",
  },
  {
    id: 2,
    image: "/images/banner_2.png",
    subtitle: "Chất lượng cao cấp",
    title: "PHONG CÁCH TINH TẾ",
    year: "CỐT LÕI",
    description:
      "Sự kết hợp hoàn hảo giữa chất liệu cao cấp và thiết kế tinh tế trong từng đường nét.",
  },
  {
    id: 3,
    image: "/images/banner_3.png",
    subtitle: "Ra mắt độc quyền",
    title: "THỜI TRANG ĐƯỜNG PHỐ",
    year: "CAO CẤP",
    description:
      "Nâng tầm phong cách đường phố với những thiết kế đột phá, dẫn đầu xu hướng thời trang.",
  },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % BANNERS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const activeBanner = BANNERS[current];

  return (
    <section className="relative h-[560px] overflow-hidden bg-[#111827] md:h-[640px] lg:h-[680px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanner.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeBanner.image}
            alt={activeBanner.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-[1280px] items-center px-5 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeBanner.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-xl pt-14 text-white md:pt-20"
          >
            <BrandLogo to={null} size="sm" tone="light" className="mb-4" />
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Bộ sưu tập mới
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
              Khám phá những thiết kế tối giản, hiện đại và dễ mặc mỗi ngày.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E85D75] px-6 text-sm font-semibold text-white transition-all hover:bg-[#d84f67] focus:outline-none focus:ring-4 focus:ring-[#E85D75]/30"
              >
                Mua ngay
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/products"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white hover:text-[#111827]"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-7 left-5 z-20 flex items-center gap-3 md:left-auto md:right-8">
        {BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => setCurrent(index)}
            className="group flex h-6 items-center"
            aria-label={`Chuyển đến banner ${index + 1}`}
          >
            <span
              className={`h-0.5 rounded-full transition-all duration-300 ${
                current === index ? "w-12 bg-[#E85D75]" : "w-7 bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default HeroSection;
