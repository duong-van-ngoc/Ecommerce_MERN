function ProductToolbar({ onSortChange, productCount, productsCount, sortBy }) {
  return (
    <div className="products-toolbar">
      <div className="toolbar-top">
        <div className="sort-section">
          <label htmlFor="sort-select" className="sort-label">
            Sắp xếp:
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={onSortChange}
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="rating_desc">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      <p className="result-count">
        Hiển thị {productsCount} trong tổng số {productCount} sản phẩm
      </p>
    </div>
  );
}

export default ProductToolbar;
