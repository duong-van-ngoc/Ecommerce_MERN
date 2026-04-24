import NoProducts from "@/shared/components/NoProducts";

import RelatedProductsSection from "./RelatedProductsSection";

function ProductEmptyState({ keyword, onResetFilters, relatedProducts }) {
  return (
    <>
      <NoProducts keyword={keyword} onResetFilters={onResetFilters} />
      <RelatedProductsSection
        products={relatedProducts}
        title="SẢN PHẨM LIÊN QUAN"
      />
    </>
  );
}

export default ProductEmptyState;
