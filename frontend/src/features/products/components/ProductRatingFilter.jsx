import { PRODUCT_FILTER_RATINGS } from "@/features/products/constants/productFilters.constants";

function ProductRatingFilter({
  handleRatingChange,
  isMobile = false,
  selectedRating,
}) {
  return (
    <div className="filter-section">
      <h3>Đánh giá</h3>
      <div className="filter-options">
        {PRODUCT_FILTER_RATINGS.map((rating) => (
          <div key={rating} className="filter-option">
            <input
              type="checkbox"
              id={`${isMobile ? "mobile-" : ""}rating-${rating}`}
              className="custom-checkbox"
              checked={selectedRating === rating}
              onChange={() => handleRatingChange(rating)}
            />
            <label
              htmlFor={`${isMobile ? "mobile-" : ""}rating-${rating}`}
              className="rating-option"
            >
              <span className="rating-stars">
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductRatingFilter;
