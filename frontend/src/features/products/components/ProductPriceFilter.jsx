import {
  PRICE_MAX,
  PRODUCT_PRICE_PRESETS,
} from "@/features/products/constants/productFilters.constants";

function ProductPriceFilter({
  handleApplyPrice,
  handlePresetClick,
  priceError,
  priceRange,
  setPriceError,
  setPriceRange,
}) {
  return (
    <div className="filter-section">
      <h3>Khoảng giá</h3>

      <div className="price-inputs-row">
        <div className="price-input-wrapper">
          <input
            type="number"
            className="price-input"
            placeholder="Từ ₫"
            value={priceRange.min || ""}
            onChange={(event) => {
              const value = event.target.value === "" ? 0 : Number(event.target.value);
              setPriceRange({ ...priceRange, min: value });
              setPriceError("");
            }}
          />
        </div>
        <span className="price-divider">-</span>
        <div className="price-input-wrapper">
          <input
            type="number"
            className="price-input"
            placeholder="Đến ₫"
            value={priceRange.max >= PRICE_MAX ? "" : priceRange.max}
            onChange={(event) => {
              const value =
                event.target.value === "" ? PRICE_MAX : Number(event.target.value);
              setPriceRange({ ...priceRange, max: value });
              setPriceError("");
            }}
          />
        </div>
      </div>

      {priceError && <p className="price-error">{priceError}</p>}

      <button type="button" className="price-apply-btn" onClick={handleApplyPrice}>
        Áp dụng
      </button>

      <div className="price-presets">
        <p className="price-presets-label">Gợi ý:</p>
        <div className="price-presets-chips">
          {PRODUCT_PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`preset-chip ${
                priceRange.min === preset.min && priceRange.max === preset.max
                  ? "active"
                  : ""
              }`}
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductPriceFilter;
