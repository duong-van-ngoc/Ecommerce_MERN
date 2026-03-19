/**
 * ============================================================================
 * COMPONENT: NewArrivals (Sản phẩm mới)
 * ============================================================================
 * 1. Component là gì: 
 *    - Khu vực hiển thị ngang (Horizontal Scroll Block) các sản phẩm "Hàng Mới Về" ở Trang Chủ.
 *    - Đi kèm các nút điều hướng Tới / Lui bằng tương tác DOM Reference.
 * 
 * 2. Props: 
 *    - `products` (array): Mảng cấu trúc dữ liệu các Item vừa mới lên kệ (Lấy theo Sort).
 *    - `loading` (boolean): Check xem cha có đang chờ API không.
 * 
 * 3. State:
 *    - Không sử dụng State Local/Global. Quản lý DOM Element Scroll bằng Hook `useRef()`.
 * 
 * 4. Render lại khi nào:
 *    - Khi component Cha ném xuống tín hiệu thay đổi Boolean Loading hoặc Object Products.
 * 
 * 5. Event handling:
 *    - Khởi tạo hàm scroll(left / right) móc vào sự kiện onClick trên hai Component Nút mũi tên.
 * 
 * 6. Conditional rendering:
 *    - Dùng Ternary Operator bao quát cấp 1: `if(loading)` thì quăng ra xương Skeletons placeholder tĩnh để chống giật UI.
 *    - Bao quát cấp 2: Nếu API phản hồi nhưng list `(products.length > 0)` => Vòng lặp list. Ngược lại in "Không có sản phẩm nào".
 * 
 * 7. List rendering:
 *    - Lặp ảo 4 khối `na-skeleton` báo Loading chờ.
 *    - Lặp mảng `products.map` gọi ra danh sách chi nhánh thẻ `<Product />`.
 * 
 * 8. Controlled input:
 *    - Trống trơn.
 * 
 * 9. Lifting state up:
 *    - Data Down-flow hoàn toàn.
 * 
 * 10. Luồng hoạt động:
 *    - Cha (Home) quăng mảng Products mới tinh vào đây.
 *    - Map List gắn mảng vào Layout ngang `display: flex; overflow-x: auto;`.
 *    - Do Container có thanh cuộn ngang ẩn, khi hàm `scroll()` kích hoạt, nó sờ trực tiếp vào node ảo của Javascript (ref) và bảo API BOM Browser Cuộn `scrollBy` thanh slide trượt đi 300px cộng trừ thay đổi mượt mà.
 * ============================================================================
 */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Product from './Product';
import '../componentStyles/NewArrivals.css';

const NewArrivals = ({ products, loading }) => {
    const sliderRef = useRef(null);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = 300;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="new-arrivals" className="new-arrivals-section">
            <div className="new-arrivals-container">
                <div className="new-arrivals-header">
                    <div className="na-title-group">
                        <p className="na-subtitle">Vừa Ra Mắt</p>
                        <h2 className="na-title">Hàng Mới Về</h2>
                    </div>

                    <div className="na-actions">
                        <button
                            onClick={() => scroll('left')}
                            aria-label="Trước đó"
                            className="na-nav-btn hover-icon-btn"
                        >
                            <svg className="na-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            aria-label="Tiếp theo"
                            className="na-nav-btn hover-icon-btn"
                        >
                            <svg className="na-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="na-loading-container">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="na-skeleton"></div>
                        ))}
                    </div>
                ) : (
                    <div
                        ref={sliderRef}
                        className="na-products-slider"
                    >
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <div key={product._id} className="na-product-item">
                                    <Product product={product} />
                                </div>
                            ))
                        ) : (
                            <p>Không có sản phẩm nào.</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default NewArrivals;

