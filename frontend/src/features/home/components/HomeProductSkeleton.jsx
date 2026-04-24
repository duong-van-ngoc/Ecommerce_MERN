import React from "react";

function HomeProductSkeleton({ count = 4 }) {
  return (
    <div className="home-product-grid" aria-label="Đang tải sản phẩm">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="home-product-skeleton">
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export default React.memo(HomeProductSkeleton);
