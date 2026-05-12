import React from 'react';
import PageTitle from '@/shared/components/PageTitle';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import Loader from '@/shared/components/Loader';
import { useProductDetail } from '@/features/product-detail/hooks/useProductDetail';
import ProductImages from '@/features/product-detail/components/ProductImages';
import ProductInfo from '@/features/product-detail/components/ProductInfo';
import ProductActions from '@/features/product-detail/components/ProductActions';
import ProductReviews from '@/features/product-detail/components/ProductReviews';
import RelatedProducts from '@/features/product-detail/components/RelatedProducts';
import '@/features/product-detail/styles/ProductDetail.css';

/**
 * ProductDetailView — layout / orchestration layer.
 * All business logic lives in useProductDetail hook.
 */
function ProductDetailView() {
  const {
    // state
    activeTab, setActiveTab,
    selectedImage, setSelectedImage,
    selectedColor, selectedSize, selectionError,
    quantity,
    // redux
    loading, error, product, cartLoading,
    // derived
    productImages, productColors, productSizes,
    originalPrice, discountPercent, soldCount, flashSale, maxAvailableQuantity,
    totalReviews, ratingDistribution, mockRelatedProducts,
    // handlers
    increaseQuantity, decreaseQuantity,
    addToCart, handleBuyNow,
    handleColorSelect, handleSizeSelect,
  } = useProductDetail();

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <Loader />
        <Footer />
      </>
    );
  }

  // ─── Error / not found state ────────────────────────────────────────────────
  if (error || !product) {
    return (
      <>
        <PageTitle title="Chi tiết sản phẩm" />
        <Navbar />
        <main className="product-details-page">
          <div className="product-details-container">
            <p>Không tìm thấy sản phẩm</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Tab labels ─────────────────────────────────────────────────────────────
  const TABS = ['Mô tả', 'Chi tiết', `Đánh giá (${product.numOfReviews || 0})`];

  return (
    <>
      <PageTitle title={`${product.name} - Chi tiết`} />
      <Navbar />

      <main className="product-details-page">
        <div className="product-details-container">

          {/* ── Main product section ─────────────────────────────────────── */}
          <div className="product-main-grid">
            {/* Gallery */}
            <ProductImages
              images={productImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              productName={product.name}
            />

            {/* Info + actions */}
            <div className="product-info-section">
              <ProductInfo
                product={product}
                discountPercent={discountPercent}
                originalPrice={originalPrice}
                soldCount={soldCount}
                quantity={quantity}
                flashSale={flashSale}
              />
              <ProductActions
                product={product}
                productColors={productColors}
                productSizes={productSizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                quantity={quantity}
                maxAvailableQuantity={maxAvailableQuantity}
                selectionError={selectionError}
                cartLoading={cartLoading}
                onColorSelect={handleColorSelect}
                onSizeSelect={handleSizeSelect}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onAddToCart={addToCart}
                onBuyNow={handleBuyNow}
              />
            </div>
          </div>

          {/* ── Tabs section ─────────────────────────────────────────────── */}
          <div className="tabs-section">
            {/* Tab headers */}
            <div className="tabs-header" role="tablist">
              {TABS.map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  className={`tab-btn ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="tab-content">
              {/* Description tab */}
              <div className={`tab-panel ${activeTab === 0 ? 'active' : ''}`} role="tabpanel">
                <div className="description-content">
                  <p>{product.description}</p>
                  <h3>Đặc điểm nổi bật:</h3>
                  <ul>
                    <li>Chất liệu cao cấp, thấm hút mồ hôi tốt</li>
                    <li>Đường may tỉ mỉ, chắc chắn</li>
                    <li>Form dáng hiện đại, phù hợp đi làm và dạo phố</li>
                    <li>Màu sắc đa dạng, không phai sau nhiều lần giặt</li>
                    <li>Dễ phối đồ với nhiều loại trang phục</li>
                  </ul>
                </div>
              </div>

              {/* Details tab */}
              <div className={`tab-panel ${activeTab === 1 ? 'active' : ''}`} role="tabpanel">
                <div className="details-grid">
                  <div>
                    <h4>Thông số sản phẩm</h4>
                    <table className="details-table">
                      <tbody>
                        <tr><td>Chất liệu</td><td>100% Cotton</td></tr>
                        <tr><td>Xuất xứ</td><td>Việt Nam</td></tr>
                        <tr><td>Kiểu dáng</td><td>Dáng suông vừa</td></tr>
                        <tr><td>Phong cách</td><td>Thường ngày, đường phố</td></tr>
                        <tr><td>Độ dày</td><td>Vừa phải</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="care-instructions">
                    <h4>Hướng dẫn bảo quản</h4>
                    <ul className="care-list">
                      <li><span>🌡️</span> <span>Giặt ở nhiệt độ thường, không quá 30°C</span></li>
                      <li><span>🧴</span> <span>Không sử dụng chất tẩy mạnh</span></li>
                      <li><span>☀️</span> <span>Phơi nơi thoáng mát, tránh ánh nắng trực tiếp</span></li>
                      <li><span>🔥</span> <span>Ủi ở nhiệt độ trung bình</span></li>
                      <li><span>👔</span> <span>Giặt riêng lần đầu để tránh lem màu</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reviews tab */}
              <div className={`tab-panel ${activeTab === 2 ? 'active' : ''}`} role="tabpanel">
                <ProductReviews
                  product={product}
                  totalReviews={totalReviews}
                  ratingDistribution={ratingDistribution}
                />
              </div>
            </div>
          </div>

          {/* ── Related products ─────────────────────────────────────────── */}
          <RelatedProducts items={mockRelatedProducts} />

        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetailView;
