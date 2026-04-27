import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const MotionSlide = motion.div;
const MotionContent = motion.div;

const TOBI_BANNER_SLIDES = [
  {
    id: 1,
    image: "/images/banner_1.png",
    tag: "Limited Edition",
    title: "NEW COLLECTION 2026",
    description: "Khám phá phong cách thời trang tối giản, sang trọng và định hình dấu ấn cá nhân cùng TOBI SHOP.",
    ctaLabel: "Khám Phá Ngay",
    ctaHref: "/products",
  },
];

const DEFAULT_AUTO_PLAY_DELAY_MS = 5000;
const SLIDE_TRANSITION = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    opacity: 0,
    scale: 0.9,
  }),
};

const normalizeIndex = (index, total) => {
  if (total <= 0) return 0;
  return (index + total) % total;
};

function BannerSlider({
  banners,
  autoPlayDelayMs = DEFAULT_AUTO_PLAY_DELAY_MS,
  className = "",
  showNavigation = false,
  showIndicators = false,
}) {
  const slides = useMemo(
    () => (Array.isArray(banners) && banners.length > 0 ? banners : TOBI_BANNER_SLIDES),
    [banners]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const hasMultipleSlides = slides.length > 1;
  const activeSlide = slides[activeIndex] ?? TOBI_BANNER_SLIDES[0];

  const paginate = useEffectEvent((nextDirection) => {
    if (!hasMultipleSlides) return;

    startTransition(() => {
      setDirection(nextDirection);
      setActiveIndex((currentIndex) =>
        normalizeIndex(currentIndex + nextDirection, slides.length)
      );
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

  if (!activeSlide) return null;

  return (
    <section
      aria-label="Hero Section"
      className={`relative w-full h-[600px] lg:h-[800px] overflow-hidden ${className}`.trim()}
    >
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <MotionSlide
          key={activeSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SLIDE_TRANSITION}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/30 to-transparent" />
          </div>

          {/* Content Area */}
          <div className="relative z-10 h-full max-w-[1280px] mx-auto px-6 flex flex-col justify-center items-start">
            <MotionContent
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl"
            >
              <span className="text-accent text-sm font-bold uppercase tracking-[0.4em] mb-6 block">
                {activeSlide.tag || "Tobi Selection"}
              </span>

              <h1 className="text-white text-5xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
                {activeSlide.title.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h1>

              <p className="text-white/80 text-base sm:text-lg max-w-lg mb-10 leading-relaxed font-light">
                {activeSlide.description}
              </p>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={activeSlide.ctaHref ?? "/products"}
                className="inline-flex items-center gap-3 bg-accent text-white px-10 py-5 rounded-none text-xs font-bold uppercase tracking-[0.2em] shadow-luxury transition-all hover:bg-white hover:text-primary"
              >
                <span>{activeSlide.ctaLabel ?? "Khám Phá Ngay"}</span>
                <ArrowRight size={16} />
              </motion.a>
            </MotionContent>
          </div>
        </MotionSlide>
      </AnimatePresence>

      {showNavigation && hasMultipleSlides && (
        <div className="absolute bottom-12 right-12 flex gap-4 z-20">
          <button
            onClick={() => paginate(-1)}
            className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all backdrop-blur-md"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all backdrop-blur-md"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {showIndicators && hasMultipleSlides && (
        <div className="absolute bottom-12 left-6 flex gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 transition-all duration-500 ${
                activeIndex === i ? "w-12 bg-accent" : "w-6 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default BannerSlider;
