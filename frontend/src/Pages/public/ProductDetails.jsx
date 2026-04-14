/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang chi tiết sản phẩm (Product Details Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là nơi khách hàng đưa ra quyết định mua sắm cuối cùng sau khi xem kỹ thông tin.
 *    - Quản lý cấu hình biến thể sản phẩm: Cho phép chọn Màu sắc, Kích thước và Số lượng.
 *    - Kết nối lòng tin: Hiển thị Đánh giá (Reviews) và Thông số kỹ thuật chi tiết.
 *    - Điều hướng mua nhanh: Cung cấp tính năng "Mua Ngay" bỏ qua bước vào giỏ hàng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Mua sắm (Shopping Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useParams`: Để bóc tách ID sản phẩm từ thanh địa chỉ URL.
 *    - Complex Local State: Quản lý cùng lúc nhiều trạng thái hiển thị (Tab, Gallery ảnh, Lựa chọn thuộc tính).
 *    - Mapping Logic: Sử dụng `colorMap` để chuyển đổi tên màu từ Backend (ví dụ: "Đen") sang mã màu Hex chuẩn CSS (#000000).
 *    - Session Storage: Lưu trữ tạm thời vật phẩm "Mua Ngay" để chuyển tiếp qua trang thanh toán.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: ID sản phẩm từ URL và dữ liệu từ Global Store.
 *    - Output: Một giao diện hiển thị chi tiết và các Action tương tác (Thêm giỏ / Mua ngay).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `selectedColor`, `selectedSize`: Lưu trữ lựa chọn cụ thể của người dùng.
 *    - `selectionError`: Biến cờ (flag) để hiển thị cảnh báo đỏ nếu người dùng quên chọn biến thể.
 *    - `quantity`: Số lượng món hàng khách muốn lấy.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `addToCart`: Tổng hợp mọi thông tin (ID, Qty, Size, Màu) và gửi về Redux Cart Slice.
 *    - `handleBuyNow`: Quy trình mua siêu tốc - đóng gói dữ liệu vào Session và đẩy người dùng đi thanh toán luôn.
 *    - `increaseQuantity / decreaseQuantity`: Các hàm kiểm soát số lượng mua, đảm bảo không vượt quá tồn kho (Stock).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Lấy ID từ URL -> Dispatch `getProductDetails`.
 *    - Bước 2: Render dữ liệu -> Khách chọn Size/Màu/Số lượng.
 *    - Bước 3: Click "Thêm vào giỏ" -> Validate lựa chọn -> Dispatch `addItemsToCart`.
 *    - Bước 4: Hiển thị thông báo thành công hoặc yêu cầu đăng nhập nếu chưa có Session.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> API Request (GET /api/v1/products/:id) -> MongoDB -> Response -> Update State.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Kiểm tra `stock`: Nếu hết hàng (stock = 0), các nút Mua/Thêm giỏ sẽ tự biến mất/vô hiệu hóa.
 *    - Validate `isAuthenticated`: Đảm bảo chỉ người dùng đã đăng nhập mới có thể mua hàng hoặc đánh giá.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Việc chờ đợi dữ liệu sản phẩm từ API và các thao tác thêm vào giỏ hàng là bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý logic `cleanColor` và `cleanSize`: Dữ liệu thô từ DB đôi khi chứa dấu `[]` hoặc `"` thừa, cần lọc sạch trước khi render.
 *    - Mobile Sticky CTA: File này có một thanh nút mua luôn dính ở dưới màn hình điện thoại để tối ưu tỷ lệ chuyển đổi.
 */
import React, { useEffect, useState } from 'react'
import '@/pages/public/styles/ProductDetails.css';
import PageTitle from '@/shared/components/PageTitle';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer'
import Loader from '@/shared/components/Loader'
import Rating from '@/shared/components/Rating';
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getProductDetails, removeErrors } from '@/features/products/productSlice'
import { toast } from 'react-toastify'
import { addItemsToCart, removeMessage } from '@/features/cart/cartSlice';
import { formatVND } from '@/shared/utils/formatCurrency';


function ProductDetails() {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectionError, setSelectionError] = useState(false)

  // State của Redux
  const { loading, error, product } = useSelector((state) => state.product)
  const { loading: cartLoading, error: cartError, success, message } = useSelector((state) => state.cart)
  const { isAuthenticated, user } = useSelector((state) => state.user)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Hàm hỗ trợ ánh xạ tên màu sang mã hex (Tạm thời hardcode, sau này có thể lưu trong DB hoặc config)
  const colorMap = {
    'Đen': '#000000', 'Black': '#000000',
    'Trắng': '#ffffff', 'White': '#ffffff',
    'Xanh dương': '#3b82f6', 'Blue': '#3b82f6',
    'Đỏ': '#ef4444', 'Red': '#ef4444',
    'Tím': '#8b5cf6', 'Purple': '#8b5cf6',
    'Vàng': '#eab308', 'Yellow': '#eab308',
    'Xám': '#6b7280', 'Gray': '#6b7280',
    'Hồng': '#ec4899', 'Pink': '#ec4899',
    'Xanh lá': '#22c55e', 'Green': '#22c55e',
    'Cam': '#f97316', 'Orange': '#f97316',
    'Nâu': '#78350f', 'Brown': '#78350f',
    'Be': '#f5f5dc', 'Beige': '#f5f5dc',
    'Kem': '#fffdd0', 'Cream': '#fffdd0',
    'Xanh đen': '#0f172a', 'Navy': '#0f172a',
    'Xanh rêu': '#3f6212', 'Moss': '#3f6212',
    'Bạc': '#c0c0c0', 'Silver': '#c0c0c0'
  };

  // Dữ liệu thực từ API (có fallback nếu thiếu)
  const productColors = product?.colors?.length > 0
    ? product.colors.map(c => {
        const cleanColor = typeof c === 'string' ? c.replace(/[\[\]"'\\]/g, "").trim() : String(c);
        return { name: cleanColor, code: colorMap[cleanColor] || '#cccccc' };
      })
    : [];

  const productSizes = product?.sizes?.length > 0
    ? product.sizes.map(s => {
        const cleanSize = typeof s === 'string' ? s.replace(/[\[\]"'\\]/g, "").trim() : String(s);
        return { name: cleanSize, available: true };
      })
    : [];

  // Giá & Giảm giá
  const originalPrice = product?.originalPrice || 0;
  // Nếu không có giá gốc, coi như không giảm giá
  const discountPercent = (originalPrice > product?.price)
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  // Số lượng đã bán
  const soldCount = product?.sold || 0;

  // TODO: Cần API riêng cho Sản Phẩm Liên Quan. Tạm thời vẫn mock hoặc lọc từ Tất Cả Sản Phẩm
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
    if ((productColors.length > 0 && selectedColor === null) || 
        (productSizes.length > 0 && selectedSize === null)) {
      setSelectionError(true);
      return;
    }

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
        position: 'top-center',
        autoClose: 2500
      });
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
      return;
    }

    setSelectionError(false);
    const color = selectedColor !== null ? productColors[selectedColor]?.name : '';
    const size = selectedSize !== null ? productSizes[selectedSize]?.name : '';
    dispatch(addItemsToCart({ id, quantity, size, color }))
  }

  const handleBuyNow = () => {
    if ((productColors.length > 0 && selectedColor === null) || 
        (productSizes.length > 0 && selectedSize === null)) {
      setSelectionError(true);
      return;
    }
    setSelectionError(false);

    const buyNowItem = {
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
      quantity: quantity,
      size: selectedSize !== null ? productSizes[selectedSize]?.name : '',
      color: selectedColor !== null ? productColors[selectedColor]?.name : ''
    };
    sessionStorage.setItem("directBuyItem", JSON.stringify(buyNowItem));
    dispatch(removeErrors()); 
    
    if (isAuthenticated) {
      navigate('/shipping');
    } else {
      navigate('/login?redirect=/shipping');
    }
  }


  // Lấy ảnh sản phẩm hoặc sử dụng ảnh dự phòng
  const productImages = product?.images?.length > 0
    ? product.images.map(img => img.url.replace('./', '/'))
    : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'];

  // Tính toán phân bổ đánh giá (mock nếu không có sẵn từ API)
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
          {/* Phần Sản Phẩm Chính */}
          <div className="product-main-grid">
            {/* Thư viện ảnh */}
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

            {/* Thông tin sản phẩm */}
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
                  <span>{soldCount.toLocaleString()}</span> Đã bán
                </div>
              </div>

              {/* Price */}
              <div className="price-section">
                <span className="current-price">{formatVND(product.price)}</span>
                {discountPercent > 0 && (
                  <>
                    <span className="original-price">{formatVND(originalPrice)}</span>
                    <span className="discount-badge">-{discountPercent}%</span>
                  </>
                )}
              </div>

              <div style={{
                backgroundColor: selectionError ? '#fff5f5' : 'transparent',
                padding: selectionError ? '15px' : '0',
                margin: selectionError ? '15px -15px' : '0',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}>
                {/* Color Selection */}
                {productColors.length > 0 && (
                  <div className="selection-group">
                    <div className="selection-label">
                      Màu sắc {selectedColor !== null && <span>{productColors[selectedColor]?.name}</span>}
                    </div>
                    <div className="color-options">
                      {productColors.map((color, index) => (
                        <div
                          key={index}
                          className={`color-swatch ${selectedColor === index ? 'active' : ''}`}
                          style={{ backgroundColor: color.code }}
                          onClick={() => {
                            setSelectedColor(index);
                            setSelectionError(false);
                            // Tự động chuyển ảnh theo màu (nếu có ảnh tương ứng)
                            if (index < productImages.length) {
                              setSelectedImage(index);
                            }
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {productSizes.length > 0 && (
                  <div className="selection-group">
                    <div className="selection-label">
                      Kích thước
                      <button className="size-guide">Hướng dẫn chọn size</button>
                    </div>
                    <div className="size-options">
                      {productSizes.map((size, index) => (
                        <button
                          key={index}
                          className={`size-btn ${selectedSize === index ? 'active' : ''} ${!size.available ? 'disabled' : ''}`}
                          onClick={() => {
                            if (size.available) {
                              setSelectedSize(index);
                              setSelectionError(false);
                            }
                          }}
                          disabled={!size.available}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

                {selectionError && (
                  <div style={{ color: '#ee4d2d', fontSize: '13px', marginTop: '15px', paddingLeft: '4px' }}>
                    Vui lòng chọn Phân loại hàng
                  </div>
                )}
              </div>

              {/* Các nút hành động (CTA) */}
              {product.stock > 0 && (
                <div className="cta-section">
                  <button className="add-to-cart-btn" onClick={addToCart} disabled={cartLoading}>
                    🛒 {cartLoading ? "Đang thêm..." : "THÊM VÀO GIỎ HÀNG"}
                  </button>
                  <button className="buy-now-btn" onClick={handleBuyNow}>
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
                          {review.images && review.images.length > 0 && (
                            <div className="review-images">
                              {review.images.map((img, i) => {
                                const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(img.url);
                                if (isVideo) {
                                  return (
                                    <video 
                                      key={i} 
                                      src={img.url} 
                                      controls 
                                      className="review-video" 
                                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                  );
                                }
                                return (
                                  <img 
                                    key={i}
                                    src={img.url} 
                                    alt={`review-${i}`} 
                                    onClick={() => window.open(img.url, '_blank')}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-reviews">
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  </div>
                )}

              </div>


            </div>
          </div>

          {/* Sản phẩm liên quan - TODO: Thay thế bằng dữ liệu API */}
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
                      <span className="current">{formatVND(item.price)}</span>
                      {item.originalPrice && (
                        <span className="original">{formatVND(item.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nút CTA cố định trên thiết bị di động */}
      {product.stock > 0 && (
        <div className="mobile-sticky-cta">
          <button className="add-to-cart-btn" onClick={addToCart} disabled={cartLoading}>
            🛒 THÊM VÀO GIỎ
          </button>
          <button className="buy-now-btn" onClick={handleBuyNow}>MUA NGAY</button>
        </div>
      )}

      <Footer />
    </>
  )
}

export default ProductDetails
