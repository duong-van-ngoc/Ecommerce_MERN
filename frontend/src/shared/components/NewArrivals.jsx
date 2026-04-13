/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Sản Phẩm Mới (New Arrivals Slider).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị danh sách các sản phẩm mới nhất dưới dạng thanh cuộn ngang (Horizontal Slider).
 *    - Cho phép người dùng duyệt nhanh các sản phẩm mới mà không cần chuyển trang.
 *    - Tích hợp hiệu ứng Skeleton Loading để tạo cảm giác chuyên nghiệp khi đợi dữ liệu.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Trưng bày Sản phẩm (Product Showcase Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - React Ref (`useRef`): Sử dụng để truy cập trực tiếp vào phần tử DOM (`sliderRef`). Đây là kỹ thuật cần thiết khi muốn can thiệp vào các thuộc tính native của trình duyệt như `scrollBy` mà React không quản lý trực tiếp qua state.
 *    - Smooth Scrolling: Sử dụng thuộc tính `behavior: 'smooth'` của API `scrollBy` để tạo hiệu ứng trượt mượt mà thay vì nhảy trang đột ngột.
 *    - Skeleton Screen Pattern: Thiết kế các khối placeholder (`na-skeleton`) có kích thước tương đồng với sản phẩm thật, giúp giao diện không bị giật (Layout Shift) khi dữ liệu tải xong.
 *    - Component Composition: Tái sử dụng component nhỏ `<Product />` bên trong vòng lặp để đảm bảo tính nhất quán của giao diện sản phẩm trên toàn hệ thống.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `products` (mảng sản phẩm) và `loading` (trạng thái tải).
 *    - Output: Một thanh trượt sản phẩm có nút điều hướng trái/phải.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `products`: Danh sách sản phẩm từ trang cha (thường là kết quả gọi API).
 *    - `loading`: Quyết định hiển thị Skeleton hay dữ liệu thật.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - `scroll(direction)`: Hàm xử lý việc trượt thanh cuộn sang trái hoặc phải một khoảng 300px.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận props từ cha (Home.jsx).
 *    - Bước 2: Nếu `loading` là true -> Render 4 khung Skeleton.
 *    - Bước 3: Nếu có `products` -> Map qua mảng và render các thẻ `<Product />`.
 *    - Bước 4: Người dùng nhấn nút mũi tên -> Hàm `scroll` được gọi -> `sliderRef.current.scrollBy` thực hiện việc trượt.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp gọi API, nhưng phụ thuộc vào kết quả trả về của cha.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Render Skeleton khi đang load.
 *    - Render thông báo "Không có sản phẩm nào" nếu mảng rỗng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Thao tác cuộn (`smooth behavior`) là một tác vụ bất đồng bộ mức trình duyệt.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Khoảng cách cuộn `scrollAmount = 300`: Có thể điều chỉnh con số này nếu muốn thanh trượt di chuyển xa hơn hoặc ngắn hơn trong mỗi lần nhấn.
 *    - Lưu ý thuộc tính `overflow-x: auto` trong CSS đi kèm: Nó cho phép người dùng dùng chuột/tay vuốt (swipe) tự nhiên bên cạnh việc nhấn nút.
 */
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Product from '@/shared/components/Product';
import '@/shared/components/styles/NewArrivals.css';

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

