import React, { useEffect, useState } from 'react';
import '../pageStyles/Products.css';
import PageTitle from '../components/PageTitle';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../components/Footer';
import { getProduct, removeErrors } from '../features/products/productSlice';
import { toast } from 'react-toastify';
import Product from '../components/Product';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

function Products() {
  // Redux state
  const { loading, error, products, resultPerPage, productCount, totalPages } = useSelector(state => state.product);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // URL params
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword");
  const categoryFromURL = searchParams.get("category");
  const pageFromURL = parseInt(searchParams.get("page"), 10) || 1;

  // Component state
  const [currentPage, setCurrentPage] = useState(pageFromURL);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState(categoryFromURL ? [categoryFromURL] : []);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 30000000 }); // UI input values (VND)
  const [appliedPrice, setAppliedPrice] = useState(null); // Actual filter sent to API
  const [priceError, setPriceError] = useState(''); // Validation error message
  const [selectedRating, setSelectedRating] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Available options
  const categories = ["laptop", "mobile", "tv", "fruits", "glass", "Áo", "Quần", "Giày", "Đồng Hồ", "Túi xách", "Thắt lưng", "Kính mắt", "Tất", "Mũ", "Khăn"];
  const ratings = [5, 4, 3, 2, 1];
  const PRICE_MIN = 0;
  const PRICE_MAX = 30000000; // 30 triệu VND

  // Preset price ranges (Shopee-style chips)
  const pricePresets = [
    { label: 'Dưới 100k', min: 0, max: 100000 },
    { label: '100k - 500k', min: 100000, max: 500000 },
    { label: '500k - 1tr', min: 500000, max: 1000000 },
    { label: 'Trên 1tr', min: 1000000, max: PRICE_MAX },
  ];

  // Helper: format giá VND
  const formatVND = (value) => value.toLocaleString('vi-VN') + '₫';

  // Close drawer when route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location]);

  // Handle body scroll lock
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMobileDrawerOpen]);

  // Fetch products — chỉ gọi khi appliedPrice thay đổi (nhấn Áp dụng / click chip)
  useEffect(() => {
    const category = selectedCategories.length > 0 ? selectedCategories[0] : null;

    dispatch(getProduct({
      keyword,
      page: currentPage,
      category,
      price: appliedPrice,
      sort: sortBy,
      ratings: selectedRating
        ? { gte: selectedRating, lt: selectedRating + 1 }
        : null,
      inStock: inStockOnly,
    }));
  }, [dispatch, currentPage, selectedCategories, keyword, appliedPrice, sortBy, selectedRating, inStockOnly]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  // Pagination handler
  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      const newSearchParams = new URLSearchParams(location.search);
      if (page === 1) {
        newSearchParams.delete('page');
      } else {
        newSearchParams.set('page', page);
      }
      navigate(`?${newSearchParams.toString()}`);
    }
  };

  // Category filter handler
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        // For now, only allow single category selection (backend limitation)
        return [category];
      }
    });
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete('page');
    if (selectedCategories.includes(category)) {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    navigate(`?${newSearchParams.toString()}`);
  };

  // Price input handler — validate trước khi apply
  const handleApplyPrice = () => {
    if (priceRange.min > 0 && priceRange.max > 0 && priceRange.min > priceRange.max) {
      setPriceError('Khoảng giá không hợp lệ');
      return;
    }
    setPriceError('');
    // Tạo filter thực sự → trigger useEffect gọi API
    const newPrice =
      (priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX)
        ? { gte: priceRange.min, lte: priceRange.max }
        : null;
    setAppliedPrice(newPrice);
    setCurrentPage(1);
  };

  // Preset chip click handler
  const handlePresetClick = (preset) => {
    setPriceRange({ min: preset.min, max: preset.max });
    // Chip = áp dụng ngay, gửi API luôn
    setAppliedPrice({ gte: preset.min, lte: preset.max });
    setPriceError('');
    setCurrentPage(1);
  };

  // Rating filter handler
  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
    setCurrentPage(1);
  };

  // Stock filter handler
  const handleStockToggle = () => {
    setInStockOnly(!inStockOnly);
    setCurrentPage(1);
  };

  // Sort handler
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([]);
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
    setAppliedPrice(null);
    setSelectedRating(null);
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
    navigate('/products');
  };

  // Remove individual filter
  const handleRemoveFilter = (filterType, value) => {
    if (filterType === 'category') {
      handleCategoryToggle(value);
    } else if (filterType === 'price') {
      setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
      setAppliedPrice(null);
    } else if (filterType === 'rating') {
      setSelectedRating(null);
    } else if (filterType === 'stock') {
      setInStockOnly(false);
    }
  };

  // Calculate active filter count
  const activeFilterCount =
    selectedCategories.length +
    (appliedPrice ? 1 : 0) +
    (selectedRating ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // Render filter section (reusable for desktop and mobile)
  const renderFilters = (isMobile = false) => (
    <>
      {/* Category Filter */}
      <div className="filter-section">
        <h3>Danh mục</h3>
        <div className="filter-options">
          {categories.map((category) => (
            <div key={category} className="filter-option">
              <input
                type="checkbox"
                id={`${isMobile ? 'mobile-' : ''}category-${category}`}
                className="custom-checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <label htmlFor={`${isMobile ? 'mobile-' : ''}category-${category}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range — Shopee-style Input Fields */}
      <div className="filter-section">
        <h3>Khoảng giá</h3>

        {/* Min/Max Input Row */}
        <div className="price-inputs-row">
          <div className="price-input-wrapper">
            <input
              type="number"
              className="price-input"
              placeholder="Từ ₫"
              value={priceRange.min || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                setPriceRange({ ...priceRange, min: value });
                setPriceError('');
              }}
            />
          </div>
          <span className="price-divider">—</span>
          <div className="price-input-wrapper">
            <input
              type="number"
              className="price-input"
              placeholder="Đến ₫"
              value={priceRange.max >= PRICE_MAX ? '' : priceRange.max}
              onChange={(e) => {
                const value = e.target.value === '' ? PRICE_MAX : Number(e.target.value);
                setPriceRange({ ...priceRange, max: value });
                setPriceError('');
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {priceError && (
          <p className="price-error">{priceError}</p>
        )}

        {/* Apply Button */}
        <button className="price-apply-btn" onClick={handleApplyPrice}>
          Áp dụng
        </button>

        {/* Preset Chips */}
        <div className="price-presets">
          <p className="price-presets-label">Gợi ý:</p>
          <div className="price-presets-chips">
            {pricePresets.map((preset, index) => (
              <button
                key={index}
                className={`preset-chip ${priceRange.min === preset.min && priceRange.max === preset.max ? 'active' : ''
                  }`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="filter-section">
        <h3>Đánh giá</h3>
        <div className="filter-options">
          {ratings.map((rating) => (
            <div key={rating} className="filter-option">
              <input
                type="checkbox"
                id={`${isMobile ? 'mobile-' : ''}rating-${rating}`}
                className="custom-checkbox"
                checked={selectedRating === rating}
                onChange={() => handleRatingChange(rating)}
              />
              <label htmlFor={`${isMobile ? 'mobile-' : ''}rating-${rating}`} className="rating-option">
                <span className="rating-stars">
                  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                </span>

              </label>
            </div>
          ))}
        </div>

      </div>

      {/* Stock Filter */}
      
    </>
  );

  return (
    <>
      <PageTitle title="Tất cả sản phẩm" />
      <Navbar />

      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="breadcrumb-container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span className="current">
              {keyword ? `Tìm kiếm: "${keyword}"` : 'Sản phẩm'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="mobile-filter-bar">
        <div className="mobile-filter-container">
          <button
            className="mobile-filter-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="products-main">
        <div className="products-wrapper">
          <div className="products-layout">
            {/* Desktop Sidebar */}
            <aside className="desktop-filters">
              <div className="filters-sticky">
                <div className="filter-sidebar">
                  <div className="filter-header">
                    <h2>Bộ lọc</h2>
                    {activeFilterCount > 0 && (
                      <button className="clear-all-btn" onClick={handleClearAll}>
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  {renderFilters(false)}
                </div>
              </div>
            </aside>

            {/* Mobile Drawer */}
            <div className={`mobile-drawer-overlay ${isMobileDrawerOpen ? '' : 'hidden'}`}>
              <div
                className={`drawer-backdrop ${isMobileDrawerOpen ? 'show' : ''}`}
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              <div className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                  <h2>Bộ lọc</h2>
                  <button
                    className="close-drawer-btn"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    ×
                  </button>
                </div>
                {renderFilters(true)}
                <div className="drawer-actions">
                  <button className="drawer-clear-btn" onClick={handleClearAll}>
                    Xóa tất cả
                  </button>
                  <button
                    className="drawer-apply-btn"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* Products Area */}
            <div className="products-content">
              {/* Toolbar */}
              <div className="products-toolbar">
                <div className="toolbar-top">


                  {/* Sort Dropdown */}
                  <div className="sort-section">
                    <label htmlFor="sort-select" className="sort-label">
                      Sắp xếp:
                    </label>
                    <select
                      id="sort-select"
                      className="sort-select"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price_asc">Giá: Thấp đến Cao</option>
                      <option value="price_desc">Giá: Cao đến Thấp</option>
                      <option value="rating_desc">Đánh giá cao nhất</option>
                    </select>
                  </div>
                </div>

                {/* Result Count */}
                <p className="result-count">
                  Hiển thị {products.length} trong tổng số {productCount} sản phẩm
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="loading-skeleton">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && products.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">👗</div>
                  <h3 className="empty-title">Không tìm thấy sản phẩm</h3>
                  <p className="empty-description">
                    Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                  <button className="empty-clear-btn" onClick={handleClearAll}>
                    Xóa bộ lọc
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {!loading && products.length > 0 && (
                <>
                  <div className="products-grid">
                    {products.map((product) => (
                      <Product key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Products;