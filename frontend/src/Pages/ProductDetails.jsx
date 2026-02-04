import React, { useEffect, useState } from 'react'
import '../pageStyles/ProductDetails.css';
import PageTitle from '../components/PageTitle';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Rating from '../components/Rating';
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom';
import { getProductDetails, removeErrors } from '../features/products/productSlice'
import { toast } from 'react-toastify'
import { addItemsToCart, removeMessage } from '../features/cart/cartSlice';


function ProductDetails() {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(1) // Default to M

  // Redux state
  const { loading, error, product } = useSelector((state) => state.product)
  const { loading: cartLoading, error: cartError, success, message } = useSelector((state) => state.cart)

  const dispatch = useDispatch();
  const { id } = useParams();

  // Mock data for features not yet in API
  // TODO: Replace with API data when backend is updated
  const mockColors = [
    { name: "Đen", code: "#000" },
    { name: "Trắng", code: "#fff" },
    { name: "Xanh dương", code: "#3b82f6" },
    { name: "Đỏ", code: "#ef4444" },
    { name: "Tím", code: "#8b5cf6" },
  ];

  const mockSizes = [
    { name: "S", available: true },
    { name: "M", available: true },
    { name: "L", available: true },
    { name: "XL", available: true },
    { name: "XXL", available: false },
  ];

  // TODO: Get from API - product.originalPrice
  const mockOriginalPrice = product?.price ? Math.round(product.price * 1.3) : 0;
  const discountPercent = mockOriginalPrice ? Math.round((1 - product?.price / mockOriginalPrice) * 100) : 0;

  // TODO: Get from API - product.soldCount
  const mockSoldCount = 5432;

  // TODO: Get from API - /api/products/related/:id
  const mockRelatedProducts = [
    { id: 1, name: "Áo Polo Nam Basic", price: 349000, originalPrice: 499000, image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=300&h=300&fit=crop", badge: "NEW" },
    { id: 2, name: "Áo Sơ Mi Oxford", price: 399000, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop" },
    { id: 3, name: "Quần Jean Slim Fit", price: 599000, originalPrice: 799000, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&h=300&fit=crop", badge: "HOT" },
    { id: 4, name: "Áo Hoodie Premium", price: 699000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop" },
  ];



  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id))
    }
    return () => {
      dispatch(removeErrors())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
    if (cartError) {
      toast.error(cartError, { position: 'top-center', autoClose: 3000 });
    }
  }, [dispatch, error, cartError]);

  useEffect(() => {
    if (success) {
      toast.success(message, { position: 'top-center', autoClose: 3000 });
      dispatch(removeMessage());
    }
  }, [dispatch, success, message]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader />
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <PageTitle title="Chi tiết sản phẩm" />
        <Navbar />
        <div className="product-details-page">
          <div className="product-details-container">
            <p>Không tìm thấy sản phẩm</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const increaseQuantity = () => {
    if (product.stock <= quantity) {
      toast.error(`Số lượng không thể vượt quá ${product.stock}`, { position: 'top-center', autoClose: 3000 });
      return;
    }
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity(prev => prev - 1)
  }

  const addToCart = () => {
    dispatch(addItemsToCart({ id, quantity }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  // Get product images or use fallback
  const productImages = product?.images?.length > 0
    ? product.images.map(img => img.url.replace('./', '/'))
    : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'];

  // Calculate rating distribution (mock if not available from API)
  const totalReviews = product?.numOfReviews || 0;
  const ratingDistribution = [
    { stars: 5, count: Math.round(totalReviews * 0.85) },
    { stars: 4, count: Math.round(totalReviews * 0.10) },
    { stars: 3, count: Math.round(totalReviews * 0.03) },
    { stars: 2, count: Math.round(totalReviews * 0.01) },
    { stars: 1, count: Math.round(totalReviews * 0.01) },
  ];

  return (
    <>
      <PageTitle title={`${product.name} - Chi tiết`} />
      <Navbar />

      <div className="product-details-page">
        <div className="product-details-container">
          {/* Main Product Section */}
          <div className="product-main-grid">
            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="main-image-container">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="main-image"
                />
              </div>
              <div className="thumbnail-grid">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              <h1 className="product-title">{product.name}</h1>

              {/* Rating & Sales */}
              <div className="product-meta">
                <div className="rating-section">
                  <span className="rating-number">{product.rating?.toFixed(1) || '0.0'}</span>
                  <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                </div>
                <span className="meta-divider">|</span>
                <div className="review-count">
                  <span>{product.numOfReviews || 0}</span> Đánh giá
                </div>
                <span className="meta-divider">|</span>
                <div className="sold-count">
                  <span>{mockSoldCount.toLocaleString()}</span> Đã bán
                </div>
              </div>

              {/* Price */}
              <div className="price-section">
                <span className="current-price">{formatPrice(product.price)}</span>
                {discountPercent > 0 && (
                  <>
                    <span className="original-price">{formatPrice(mockOriginalPrice)}</span>
                    <span className="discount-badge">-{discountPercent}%</span>
                  </>
                )}
              </div>

              {/* Color Selection - TODO: Replace with API data */}
              <div className="selection-group">
                <div className="selection-label">
                  Màu sắc <span>{mockColors[selectedColor].name}</span>
                </div>
                <div className="color-options">
                  {mockColors.map((color, index) => (
                    <div
                      key={index}
                      className={`color-swatch ${selectedColor === index ? 'active' : ''}`}
                      style={{ backgroundColor: color.code }}
                      onClick={() => setSelectedColor(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection - TODO: Replace with API data */}
              <div className="selection-group">
                <div className="selection-label">
                  Kích thước
                  <button className="size-guide">Hướng dẫn chọn size</button>
                </div>
                <div className="size-options">
                  {mockSizes.map((size, index) => (
                    <button
                      key={index}
                      className={`size-btn ${selectedSize === index ? 'active' : ''} ${!size.available ? 'disabled' : ''}`}
                      onClick={() => size.available && setSelectedSize(index)}
                      disabled={!size.available}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="quantity-section">
                <span className="quantity-label">Số lượng</span>
                <div className="quantity-controls">
                  <button className="qty-btn" onClick={decreaseQuantity} disabled={quantity <= 1}>−</button>
                  <input type="text" className="qty-input" value={quantity} readOnly />
                  <button className="qty-btn" onClick={increaseQuantity} disabled={quantity >= product.stock}>+</button>
                </div>
                <span className="stock-info">Còn {product.stock} sản phẩm</span>
              </div>

              {/* CTA Buttons */}
              {product.stock > 0 && (
                <div className="cta-section">
                  <button className="add-to-cart-btn" onClick={addToCart} disabled={cartLoading}>
                    🛒 {cartLoading ? "Đang thêm..." : "THÊM VÀO GIỎ HÀNG"}
                  </button>
                  <button className="buy-now-btn">
                    MUA NGAY
                  </button>
                </div>
              )}

              {/* Benefits */}
              <div className="benefits-section">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <div className="benefit-text">
                    <h4>Miễn phí vận chuyển</h4>
                    <p>Đơn hàng từ 500.000₫</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <div className="benefit-text">
                    <h4>Đổi trả trong 14 ngày</h4>
                    <p>Miễn phí đổi size & hoàn tiền</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <div className="benefit-text">
                    <h4>Hàng chính hãng 100%</h4>
                    <p>Cam kết chất lượng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="tabs-section">
            <div className="tabs-header">
              {['Mô tả', 'Chi tiết', `Đánh giá (${product.numOfReviews || 0})`].map((tab, index) => (
                <button
                  key={index}
                  className={`tab-btn ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {/* Description Tab */}
              <div className={`tab-panel ${activeTab === 0 ? 'active' : ''}`}>
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

              {/* Details Tab */}
              <div className={`tab-panel ${activeTab === 1 ? 'active' : ''}`}>
                <div className="details-grid">
                  <div>
                    <h4>Thông số sản phẩm</h4>
                    <table className="details-table">
                      <tbody>
                        <tr><td>Chất liệu</td><td>100% Cotton</td></tr>
                        <tr><td>Xuất xứ</td><td>Việt Nam</td></tr>
                        <tr><td>Kiểu dáng</td><td>Regular Fit</td></tr>
                        <tr><td>Phong cách</td><td>Casual, Streetwear</td></tr>
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

              {/* Reviews Tab */}
              <div className={`tab-panel ${activeTab === 2 ? 'active' : ''}`}>
                {product?.reviews && product.reviews.length > 0 ? (
                  <>
                    <div className="reviews-summary">
                      <div className="rating-big">
                        <div className="number">{product.rating?.toFixed(1) || '0.0'}</div>
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <div className="count">{product.numOfReviews} đánh giá</div>
                      </div>
                      <div className="rating-bars">
                        {ratingDistribution.map((item) => (
                          <div key={item.stars} className="rating-bar-row">
                            <span className="rating-bar-label">{item.stars} ⭐</span>
                            <div className="rating-bar">
                              <div
                                className="rating-bar-fill"
                                style={{ width: `${totalReviews > 0 ? (item.count / totalReviews) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="rating-bar-count">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="review-list">
                      {product.reviews.map((review, index) => (
                        <div className="review-item" key={index}>
                          <div className="review-header">
                            <div className="reviewer-avatar">
                              {review.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="reviewer-info">
                              <div className="reviewer-name">{review.name}</div>
                              <div className="review-meta">
                                <span className="stars">{'⭐'.repeat(review.rating)}</span>
                                <span>•</span>
                                {/* TODO: Add createdAt from API */}
                                <span>Gần đây</span>
                                <span>•</span>
                                {/* TODO: Add verifiedPurchase from API */}
                                <span className="verified-badge">✓ Đã mua hàng</span>
                              </div>
                            </div>
                          </div>
                          <div className="review-content">{review.comment}</div>
                          {/* TODO: Add review.images from API */}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-reviews">
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  </div>
                )}

                {/* Write Review Form */}
                <div className="write-review-section">
                  <h3>Viết đánh giá</h3>
                  <Rating value={0} disabled={false} />
                  <textarea
                    className="review-textarea"
                    placeholder="Nhập đánh giá của bạn..."
                  />
                  <button className="submit-review-btn">Gửi đánh giá</button>
                </div>
              </div>


            </div>
          </div>

          {/* Related Products - TODO: Replace with API data */}
          <div className="related-section">
            <h2>Sản phẩm liên quan</h2>
            <div className="related-grid">
              {mockRelatedProducts.map((item) => (
                <Link to={`/product/${item.id}`} className="related-card" key={item.id}>
                  <div className="related-card-image">
                    {item.badge && (
                      <span className={`related-badge ${item.badge.toLowerCase()}`}>
                        {item.badge}
                      </span>
                    )}
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="related-card-info">
                    <div className="related-card-name">{item.name}</div>
                    <div className="related-card-price">
                      <span className="current">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="original">{formatPrice(item.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      {product.stock > 0 && (
        <div className="mobile-sticky-cta">
          <button className="add-to-cart-btn" onClick={addToCart} disabled={cartLoading}>
            🛒 THÊM VÀO GIỎ
          </button>
          <button className="buy-now-btn">MUA NGAY</button>
        </div>
      )}

      <Footer />
    </>
  )
}

export default ProductDetails