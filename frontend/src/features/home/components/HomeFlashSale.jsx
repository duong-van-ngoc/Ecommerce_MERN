import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import Product from "@/shared/components/Product";
import HomeProductSkeleton from "@/features/home/components/HomeProductSkeleton";
import useCountdown from "@/features/home/hooks/useCountdown";

function CountdownBox({ value }) {
  return <span className="home-countdown-box">{value}</span>;
}

function HomeFlashSale({ products, loading, saleEndsAt }) {
  const countdown = useCountdown(saleEndsAt);

  return (
    <section className="home-flash-section" aria-labelledby="home-flash-title">
      <div className="home-flash-header">
        <div className="home-flash-title-group">
          <Zap size={40} fill="currentColor" aria-hidden="true" />
          <h2 id="home-flash-title">Khuyến mãi chớp nhoáng</h2>
          <div className="home-countdown" aria-label="Đếm ngược khuyến mãi">
            <CountdownBox value={countdown.hours} />
            <b>:</b>
            <CountdownBox value={countdown.minutes} />
            <b>:</b>
            <CountdownBox value={countdown.seconds} />
          </div>
        </div>

        <Link to="/products?sort=price_asc" className="home-section-link">
          Xem tất cả
        </Link>
      </div>

      {loading ? (
        <HomeProductSkeleton count={4} />
      ) : products.length > 0 ? (
        <div className="home-product-grid home-flash-grid">
          {products.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="home-empty-state">
          <h3>Chưa có sản phẩm khuyến mãi</h3>
          <p>Danh sách này sử dụng dữ liệu sản phẩm thực tế và không tạo trạng thái khuyến mãi giả.</p>
        </div>
      )}
    </section>
  );
}

export default React.memo(HomeFlashSale);
