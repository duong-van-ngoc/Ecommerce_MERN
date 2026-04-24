import ProductCategoryFilter from "./ProductCategoryFilter";
import ProductPriceFilter from "./ProductPriceFilter";
import ProductRatingFilter from "./ProductRatingFilter";

function ProductFilters({
  handleApplyPrice,
  handleCategoryToggle,
  handlePresetClick,
  handleRatingChange,
  isMobile = false,
  priceError,
  priceRange,
  selectedCategories,
  selectedRating,
  setPriceError,
  setPriceRange,
}) {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
          .heading-serif { font-family: 'Playfair+Display', serif; }
        `}
      </style>

      <ProductCategoryFilter
        handleCategoryToggle={handleCategoryToggle}
        selectedCategories={selectedCategories}
      />
      <ProductPriceFilter
        handleApplyPrice={handleApplyPrice}
        handlePresetClick={handlePresetClick}
        priceError={priceError}
        priceRange={priceRange}
        setPriceError={setPriceError}
        setPriceRange={setPriceRange}
      />
      <ProductRatingFilter
        handleRatingChange={handleRatingChange}
        isMobile={isMobile}
        selectedRating={selectedRating}
      />
    </>
  );
}

export default ProductFilters;
