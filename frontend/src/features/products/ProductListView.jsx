import "@/Pages/public/styles/Products.css";

import Footer from "@/shared/components/Footer";
import Navbar from "@/shared/components/Navbar";
import PageTitle from "@/shared/components/PageTitle";

import ProductEmptyState from "./components/ProductEmptyState";
import ProductFilters from "./components/ProductFilters";
import ProductGrid from "./components/ProductGrid";
import ProductLoadingGrid from "./components/ProductLoadingGrid";
import ProductPagination from "./components/ProductPagination";
import ProductToolbar from "./components/ProductToolbar";
import useProductListing from "./hooks/useProductListing";

function ProductListView() {
  const listing = useProductListing();
  const filterProps = {
    handleApplyPrice: listing.handleApplyPrice,
    handleCategoryToggle: listing.handleCategoryToggle,
    handlePresetClick: listing.handlePresetClick,
    handleRatingChange: listing.handleRatingChange,
    priceError: listing.priceError,
    priceRange: listing.priceRange,
    selectedCategories: listing.selectedCategories,
    selectedRating: listing.selectedRating,
    setPriceError: listing.setPriceError,
    setPriceRange: listing.setPriceRange,
  };

  return (
    <>
      <PageTitle title="Tất cả sản phẩm" />
      <Navbar />

      <div className="mobile-filter-bar">
        <div className="mobile-filter-container">
          <button
            type="button"
            className="mobile-filter-btn"
            onClick={() => listing.setIsMobileDrawerOpen(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <span>Bộ lọc</span>
            {listing.activeFilterCount > 0 && (
              <span className="filter-count-badge">{listing.activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="products-main">
        <div className="products-wrapper">
          <div className="products-layout">
            <aside className="desktop-filters">
              <div className="filters-sticky">
                <div className="filter-sidebar">
                  <div className="filter-header">
                    <h2>Bộ lọc</h2>
                    {listing.activeFilterCount > 0 && (
                      <button
                        type="button"
                        className="clear-all-btn"
                        onClick={listing.handleClearAll}
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <ProductFilters {...filterProps} />
                </div>
              </div>
            </aside>

            <div
              className={`mobile-drawer-overlay ${
                listing.isMobileDrawerOpen ? "" : "hidden"
              }`}
            >
              <div
                className={`drawer-backdrop ${
                  listing.isMobileDrawerOpen ? "show" : ""
                }`}
                onClick={() => listing.setIsMobileDrawerOpen(false)}
              />
              <div
                className={`mobile-drawer ${
                  listing.isMobileDrawerOpen ? "open" : ""
                }`}
              >
                <div className="drawer-header">
                  <h2>Bộ lọc</h2>
                  <button
                    type="button"
                    className="close-drawer-btn"
                    onClick={() => listing.setIsMobileDrawerOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <ProductFilters {...filterProps} isMobile />
                <div className="drawer-actions">
                  <button
                    type="button"
                    className="drawer-clear-btn"
                    onClick={listing.handleClearAll}
                  >
                    Xóa tất cả
                  </button>
                  <button
                    type="button"
                    className="drawer-apply-btn"
                    onClick={() => listing.setIsMobileDrawerOpen(false)}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            <div className="products-content">
              <ProductToolbar
                onSortChange={listing.handleSortChange}
                productCount={listing.productCount}
                productsCount={listing.products.length}
                sortBy={listing.sortBy}
              />

              {listing.loading && <ProductLoadingGrid />}

              {!listing.loading && !listing.hasResults && (
                <ProductEmptyState
                  keyword={listing.keyword}
                  onResetFilters={listing.handleClearAll}
                  relatedProducts={listing.relatedProducts}
                />
              )}

              {!listing.loading && listing.products.length > 0 && (
                <>
                  <ProductGrid products={listing.products} />
                  <ProductPagination
                    currentPage={listing.currentPage}
                    onPageChange={listing.handlePageChange}
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

export default ProductListView;
