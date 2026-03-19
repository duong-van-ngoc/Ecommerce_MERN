/**
 * ============================================================================
 * COMPONENT: Product (Product Card)
 * ============================================================================
 * 1. Component là gì: 
 *    - Một Thẻ Card (Component con) dùng để hiển thị gói gọn thông tin của DUY NHẤT 1 SẢN PHẨM.
 *    - Nó thường được tái sử dụng để render thành Danh sách (trong trang Products) hoặc Khối (New Arrivals, Related Products...).
 * 
 * 2. Props: 
 *    - `product` (Object): Chứa toàn bộ Data Schema của 1 sản phẩm (như _id, name, price, originalPrice, images array, rating, sold...).
 * 
 * 3. State:
 *    - Local State: 
 *      + `rating` (number): Dành cho thao tác hover hoặc chấm điểm tại Component Rating con.
 *    - Không có Global State.
 * 
 * 4. Render lại khi nào:
 *    - Khi data Object `product` từ cha bị thay đổi.
 * 
 * 5. Event handling:
 *    - Nút (Icon Yêu thích): Click để thêm logic Wishlist tuy nhiên đang pending `TODO: Add to wishlist logic`.
 *    - `<Link to={...}>`: Bao hàm toàn bộ thẻ card để bấm vào đâu cũng đẩy Route sang `/product/:id`.
 * 
 * 6. Conditional rendering:
 *    - Nếu có giá trị mảng ảnh `images[0]?.url` -> Render ảnh 1, nếu không -> Render ảnh default `/public/ao/ao_khoac.jpg`.
 *    - Check % Giảm giá `discountPercent > 0` -> Xuất hiện badge giảm giá mảng đỏ góc thẻ card.
 *    - Dựa vào Category structure (Object 3 cấp hoặc text trơn) -> In ra Category Name tương ứng.
 * 
 * 7. List rendering:
 *    - File bản thân nó là Entity Đích nên không loop. Tuy nhiên nó CẦN phải được vòng lặp gọi tới (từ cha) thông qua List Rendering.
 * 
 * 8. Controlled input:
 *    - Các thành phần Input không tồn tại, chỉ truyền giá trị readOnly vào khối Rating con.
 * 
 * 9. Lifting state up:
 *    - Chỉ nhận dữ liệu data-down, không emit data-up lên cho cha.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Nhận Object Prop Data từ vòng lặp cha (ví dụ `products.map(p => <Product product={p}/>)`).
 *    - (2) Component Mount -> Function tính toán tự động % chênh lệch giữa giá Sale (price) và giá Gốc (originalPrice).
 *    - (3) Hàm formatVND định dạng giá tiền tệ sang dạng có dấu chấm.
 *    - (4) Render ra khung giao diện hình ảnh, tiêu đề, giá tiền, % giảm giá và tổng lượt bán. Link toàn bộ khối về trang Detail.
 * ============================================================================
 */
import React, { useState } from 'react'
import '../componentStyles/Product.css'
import { Link } from 'react-router-dom'
import Rating from './Rating'

function Product({ product }) {

    const [rating, setRating] = useState(0)
    const handleRatingChange = (newRating) => {
        setRating(rating)
        console.log(`rating changed to : ${newRating}`);

    }

    // Format giá VND
    const formatVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

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