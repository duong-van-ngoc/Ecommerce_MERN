import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MotionSlide = motion.div;
const MotionContent = motion.div;

const TOBI_BANNER_SLIDES = [
  {
    id: 1,
    image: "/images/banner4.jpg",
    title: "Bộ sưu tập mới 2026",
    subtitle: "Giảm giá lên đến 50%",
    description:
      "Chọn ngay những set đồ được yêu thích nhất cho mùa mua sắm mới tại ToBi Shop.",
    ctaLabel: "Mua ngay",
    ctaHref: "/products",
  },
  {
    id: 2,
    image: "/images/banner5.jpg",
    title: "Phong cách tối giản, mặc đẹp mỗi ngày",
    subtitle: "Ưu đãi cho BST công sở và streetwear",
    description:
      "Chất liệu dễ mặc, tông màu dễ phối và các item sẵn sàng cho tuần mới của bạn.",
    ctaLabel: "Khám phá ngay",
    ctaHref: "/products",
  },
  {
    id: 3,
    image: "/images/banner6.jpg",
    title: "Sale giữa mùa, deal đẹp mỗi ngày",
    subtitle: "Tặng thêm ưu đãi cho đơn hàng từ 499K",
    description:
      "Từ áo thun, áo khoác đến phụ kiện, tất cả đều sẵn sàng lên slider khuyến mãi nổi bật.",
    ctaLabel: "Xem ưu đãi",
    ctaHref: "/products",
  },
];

const DEFAULT_AUTO_PLAY_DELAY_MS = 4500;
const DRAG_OFFSET_THRESHOLD_PX = 80;
const SWIPE_POWER_THRESHOLD = 12000;
const SLIDE_TRANSITION = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
};

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 72 : -72,
    scale: 1.03,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -72 : 72,
    scale: 0.98,
  }),
};

const normalizeIndex = (index, total) => {
  if (total <= 0) return 0;
  return (index + total) % total;
};

const getSwipePower = (offset, velocity) =>
  Math.abs(offset) * Math.abs(velocity);

function BannerSlider({
  banners,
  autoPlayDelayMs = DEFAULT_AUTO_PLAY_DELAY_MS,
  className = "",
  showNavigation = true,
  showIndicators = true,
}) {
  const slides = useMemo(
    () => (Array.isArray(banners) && banners.length > 0 ? banners : TOBI_BANNER_SLIDES),
    [banners]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  const hasMultipleSlides = slides.length > 1;
  const activeSlide = slides[activeIndex] ?? TOBI_BANNER_SLIDES[0];
  const activeImageKey = String(activeSlide.id);
  const isActiveImageLoaded = loadedImages[activeImageKey] ?? false;

  useEffect(() => {
    setActiveIndex((currentIndex) => Math.min(currentIndex, slides.length - 1));
  }, [slides.length]);

  const goToSlide = (nextIndex) => {
    if (nextIndex === activeIndex || !hasMultipleSlides) return;

    startTransition(() => {
      setDirection(nextIndex > activeIndex ? 1 : -1);
      setActiveIndex(nextIndex);
    });
  };

  const paginate = useEffectEvent((nextDirection) => {
    if (!hasMultipleSlides) return;

    startTransition(() => {
      setDirection(nextDirection);
      setActiveIndex((currentIndex) =>
        normalizeIndex(currentIndex + nextDirection, slides.length)
      );
    });
  });

  const markImageAsLoaded = useEffectEvent((bannerId) => {
    const imageKey = String(bannerId);

    setLoadedImages((currentState) => {
      if (currentState[imageKey]) return currentState;
      return { ...currentState, [imageKey]: true };
    });
  });

  useEffect(() => {
    if (!hasMultipleSlides || isPaused) return undefined;

    const intervalId = window.setInterval(() => {
      paginate(1);
    }, autoPlayDelayMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoPlayDelayMs, hasMultipleSlides, isPaused, paginate]);

  const handleDragEnd = (_event, info) => {
    if (!hasMultipleSlides) return;

    const swipePower = getSwipePower(info.offset.x, info.velocity.x);

    if (
      info.offset.x <= -DRAG_OFFSET_THRESHOLD_PX ||
      (info.offset.x < 0 && swipePower > SWIPE_POWER_THRESHOLD)
    ) {
      paginate(1);
      return;
    }

    if (
      info.offset.x >= DRAG_OFFSET_THRESHOLD_PX ||
      (info.offset.x > 0 && swipePower > SWIPE_POWER_THRESHOLD)
    ) {
      paginate(-1);
    }
  };

  if (!activeSlide) return null;

  return (
    <section
      aria-label="Banner khuyến mãi ToBi Shop"
      className={`w-full ${className}`.trim()}
    >
      <div
        className="group relative overflow-hidden rounded-xl bg-stone-950 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <div className="relative aspect-[16/9] w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[520px]">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <MotionSlide
              key={activeSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_TRANSITION}
              drag={hasMultipleSlides ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={handleDragEnd}
              className="absolute inset-0"
            >
              {!isActiveImageLoaded ? (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300" />
              ) : null}

              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => markImageAsLoaded(activeSlide.id)}
                className={`h-full w-full object-cover transition-opacity duration-500 ${
                  isActiveImageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-950/35 to-stone-950/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_32%)]" />

              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto flex h-full w-full max-w-7xl items-end px-5 py-6 sm:items-center sm:px-8 lg:px-12">
                  <MotionContent
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.12 }}
                    className="max-w-[min(92%,34rem)] text-white"
                  >
                    <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/70 sm:text-xs">
                      ToBi Shop
                    </p>

                    <h2 className="text-3xl font-black leading-[0.95] sm:text-4xl lg:text-6xl">
                      {activeSlide.title}
                    </h2>

                    <p className="mt-3 text-base font-medium text-amber-200 sm:text-lg lg:text-2xl">
                      {activeSlide.subtitle}
                    </p>

                    {activeSlide.description ? (
                      <p className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                        {activeSlide.description}
                      </p>
                    ) : null}

                    <a
                      href={activeSlide.ctaHref ?? "/products"}
                      className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-white/80 sm:mt-8 sm:px-6 sm:py-3.5"
                    >
                      {activeSlide.ctaLabel ?? "Mua ngay"}
                      <span aria-hidden="true" className="text-base">
                        →
                      </span>
                    </a>
                  </MotionContent>
                </div>
              </div>
            </MotionSlide>
          </AnimatePresence>

          {showNavigation && hasMultipleSlides ? (
            <>
              <button
                type="button"
                aria-label="Banner trước"
                onClick={() => paginate(-1)}
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/14 text-white backdrop-blur-md transition hover:bg-white/24 focus:outline-none focus:ring-2 focus:ring-white/70 sm:left-5"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Banner tiếp theo"
                onClick={() => paginate(1)}
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/14 text-white backdrop-blur-md transition hover:bg-white/24 focus:outline-none focus:ring-2 focus:ring-white/70 sm:right-5"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {showIndicators && hasMultipleSlides ? (
            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-950/35 px-3 py-2 backdrop-blur-md">
                {slides.map((banner, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={banner.id}
                      type="button"
                      aria-label={`Chuyển đến banner ${index + 1}`}
                      onClick={() => goToSlide(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/70 ${
                        isActive ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/75"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default BannerSlider;
