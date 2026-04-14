/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Thẻ Sản Phẩm (Product Card).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "gương mặt đại diện" của sản phẩm trên các danh sách (Trang chủ, Trang tìm kiếm, Sản phẩm gợi ý).
 *    - Cung cấp cái nhìn nhanh (Quick View) giúp khách hàng nắm bắt được các thông tin quan trọng nhất: Ảnh, Tên, Giá và Đánh giá.
 *    - Là "cánh cửa" dẫn lối người dùng đi sâu vào trang Chi tiết sản phẩm.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Duyệt Sản phẩm & Tìm kiếm (Product Browsing & Discovery Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Reusable Component: Được thiết kế cực kỳ linh hoạt để có thể render hàng trăm lần trong một trang mà không gây xung đột.
 *    - `Link` Component (React Router): Bao bọc toàn bộ thẻ Card. Điều này giúp người dùng có thể bấm vào bất kỳ vị trí nào trên thẻ để chuyển trang, tăng diện tích tương tác (Clickable Area).
 *    - Event Bubbling Control (`stopPropagation`): Một kỹ thuật quan trọng. Khi người dùng click vào nút "Yêu thích" (Tim), ta phải chặn sự kiện này để nó không bị "trôi" lên thẻ `Link` cha, tránh việc nhảy trang ngoài ý muốn.
 *    - Frontend Logic Calculation: Tự động tính toán phần trăm giảm giá (%) dựa trên giá gốc và giá hiện tại ngay tại client, giúp giảm tải công việc cho phía Backend.
 *    - Conditional Rendering: Xử lý hiển thị thông minh: Chỉ hiện Badge giảm giá nếu có giảm giá thật sự; chỉ hiện giá gốc gạch ngang nếu sản phẩm đang được khuyến mãi.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Object `product` chứa đầy đủ dữ liệu từ Database.
 *    - Output: Một khung thẻ sản phẩm đẹp mắt với đầy đủ hiệu ứng hover.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Prop `product`: Dữ liệu đầu vào duy nhất và quan trọng nhất.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `discountPercent`: Hằng số tính toán tỷ lệ giảm giá.
 *    - `formatVND`: Helper format tiền tệ sang định dạng Việt Nam (ví dụ: 1.200.000₫).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận dữ liệu sản phẩm từ danh sách cha.
 *    - Bước 2: Tính toán % chiết khấu (nếu có).
 *    - Bước 3: Render ảnh sản phẩm (có xử lý ảnh mặc định nếu ảnh gốc bị lỗi).
 *    - Bước 4: Hiển thị tên, giá, số sao và số lượng đã bán.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API trực tiếp. Nó chỉ tiêu thụ dữ liệu đã được nạp sẵn từ Trang chủ hoặc Trang sản phẩm.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Sold Count Formatting: Nếu số lượng bán trên 1000, nó sẽ tự động đổi thành định dạng rút gọn (ví dụ: 1.2k) cho gọn gàng.
 *    - Category Display: Thông minh trong việc lấy tên danh mục từ cấu trúc đa cấp (Level 1, 2, 3).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `hover-scale-up`: Đây là class CSS tạo hiệu ứng phóng to ảnh khi di chuột vào, giúp trang web trông "sống" hơn.
 *    - Chú ý phần `TODO: Add to wishlist logic`: Đây là nơi bạn sẽ code thêm tính năng lưu sản phẩm yêu thích sau này.
 */
import React, { useState } from 'react'
import '@/shared/components/styles/Product.css'
import { Link } from 'react-router-dom'
import Rating from '@/shared/components/Rating'
import { formatVND } from '@/shared/utils/formatCurrency'

function Product({ product }) {

    const [rating, setRating] = useState(0)
    const handleRatingChange = (newRating) => {
        setRating(rating)
        console.log(`rating changed to : ${newRating}`);

    }


    // Tính % giảm giá
    const discountPercent = product.originalPrice && product.originalPrice > product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <Link to={`/product/${product._id}`} className="product_id">
            <div className="product-card">
                {/* Image Container */}
                <div className="product-card__image-wrapper">
                    <img
                        src={product.images?.[0]?.url || "/public/ao/ao_khoac.jpg"}
                        alt={product.name}
                        className="product-image-card hover-scale-up"
                    />

                    {/* Wishlist Button */}
                    <button
                        className="product-card__wishlist hover-icon-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Add to wishlist logic
                        }}
                        aria-label="Yêu thích"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <span className="product-card__badge">-{discountPercent}%</span>
                    )}
                </div>

                {/* Product Info */}
                <div className="product-details">
                    {/* Category */}
                    {product.category && (
                        <p className="product-card__category">
                            {typeof product.category === 'object' 
                                ? (product.category.level3 || product.category.level2 || product.category.level1) 
                                : product.category}
                        </p>
                    )}

                    {/* Name */}
                    <h3 className="product-title hover-link-slide text-black pb-1 mb-1">{product.name}</h3>

                    {/* Price Row */}
                    <div className="product-card__price-row">
                        <p className="home-price">{formatVND(product.price)}</p>
                        {product.originalPrice > 0 && product.originalPrice > product.price && (
                            <span className="product-card__original-price">
                                {formatVND(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Rating + Review Count */}
                    <div className="product-card__rating-row">
                        <div className="rating_container">
                            <Rating
                                value={product.ratings}
                                onRatingChange={handleRatingChange}
                                disabled={true}
                            />
                        </div>
                        {product.numOfReviews > 0 && (
                            <span className="product-card__review-count">
                                ({product.numOfReviews})
                            </span>
                        )}
                        {product.sold > 0 && (
                            <>
                                <span className="product-card__review-count">|</span>
                                <span className="product-card__sold">
                                    Đã bán {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default Product