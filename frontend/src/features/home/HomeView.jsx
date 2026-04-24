import Footer from "@/shared/components/Footer";
import PageTitle from "@/shared/components/PageTitle";
import HomeHeader from "@/features/home/components/HomeHeader";
import HomeCategoryGrid from "@/features/home/components/HomeCategoryGrid";
import HomeFlashSale from "@/features/home/components/HomeFlashSale";
import HomeFeaturedProducts from "@/features/home/components/HomeFeaturedProducts";
import HomeBenefits from "@/features/home/components/HomeBenefits";
import HomeTestimonials from "@/features/home/components/HomeTestimonials";
import HomeMobileBottomNav from "@/features/home/components/HomeMobileBottomNav";
import BannerSlider from "@/sections/home/banner/banner-slider";
import useHomeData from "@/features/home/hooks/useHomeData";
import {
  HOME_BENEFITS,
  HOME_CATEGORIES,
  HOME_TESTIMONIALS,
} from "@/features/home/constants/home.constants";
import "@/features/home/styles/home.css";

function HomeView() {
  const { loading, flashSaleProducts, featuredProducts, saleEndsAt } = useHomeData();

  return (
    <>
      <PageTitle title="Trang chủ | ToBi Shop" />
      <HomeHeader />

      <main className="home-page">
        <BannerSlider />
        <HomeCategoryGrid categories={HOME_CATEGORIES} />
        <HomeFlashSale
          products={flashSaleProducts}
          loading={loading}
          saleEndsAt={saleEndsAt}
        />
        <HomeFeaturedProducts products={featuredProducts} loading={loading} />
        <HomeBenefits benefits={HOME_BENEFITS} />
        <HomeTestimonials testimonials={HOME_TESTIMONIALS} />
      </main>

      <Footer />
      <HomeMobileBottomNav />
    </>
  );
}

export default HomeView;
