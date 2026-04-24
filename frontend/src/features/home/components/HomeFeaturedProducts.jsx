import React from "react";
import Product from "@/shared/components/Product";
import HomeProductSkeleton from "@/features/home/components/HomeProductSkeleton";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";

function HomeFeaturedProducts({ products, loading }) {
  return (
    <section className="home-section" aria-labelledby="home-featured-title">
      <HomeSectionTitle
        title="Sản phẩm nổi bật"
        titleId="home-featured-title"
        actionLabel="Xem tất cả"
        actionTo="/products"
      />

      {loading ? (
        <HomeProductSkeleton count={8} />
      ) : products.length > 0 ? (
        <div className="home-product-grid">
          {products.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="home-empty-state">
          <h3>Chưa có sản phẩm nổi bật</h3>
          <p>Sản phẩm sẽ hiển thị tại đây sau khi API trả dữ liệu.</p>
        </div>
      )}
    </section>
  );
}

export default React.memo(HomeFeaturedProducts);
