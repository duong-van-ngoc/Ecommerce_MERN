/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Banner Chính (Hero Section).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "bộ mặt" của trang chủ. Xuất hiện ngay lập tức khi khách hàng truy cập website.
 *    - Chịu trách nhiệm truyền tải thông điệp thương hiệu, các chiến dịch khuyến mãi mới (Drop 02 - S/S Collection).
 *    - Chứa các nút kêu gọi hành động (Call To Action - CTA) chính để dẫn dắt người dùng vào luồng mua hàng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Trải nghiệm Người dùng đầu phễu (Upper Funnel UX Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Responsive Grid Layout: Sử dụng `hero-grid` để phân tách nội dung văn bản (bên trái) và hình ảnh (bên phải) một cách cân đối trên Desktop và tự động xếp chồng trên Mobile.
 *    - CSS Animation Sequencing: Áp dụng các class `fade-up` kết hợp với `delay-X00`. Đây là kỹ thuật tạo hiệu ứng "thác đổ" (Staggered Animation), giúp các thành phần trôi lên theo thứ tự thời gian khác nhau, tạo cảm giác cao cấp (Premium Feel).
 *    - Aspect Ratio Management: Sử dụng các class như `aspect-3-4` để đảm bảo khung hình ảnh luôn giữ đúng tỷ lệ vàng, không bị méo hay vỡ giao diện trên các thiết bị khác nhau.
 *    - Semantic Typography: Sử dụng cặp thẻ `<h1>` cho tiêu đề chính (giúp SEO tốt nhất) và `<p>` cho mô tả.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu tĩnh (Hardcoded content).
 *    - Output: Khối giao diện Banner bắt mắt.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Component này hoàn toàn Stateless (không trạng thái) để tối ưu hóa tốc độ load trang đầu tiên.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - Không có logic hàm phức tạp, chủ yếu trả về cấu trúc JSX tĩnh.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Render khung Container chuẩn Bootstrap/Tailwind style.
 *    - Bước 2: Kích hoạt các Animation CSS khi component mount vào DOM.
 *    - Bước 3: Người dùng nhấn vào các nút Link -> Điều hướng sang trang Danh sách sản phẩm kèm tham số filter.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không tương tác trực tiếp với Database.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Render đồng nhất cho mọi khách truy cập.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý phần `vertical-text-content`: Đây là một kỹ thuật thiết kế Typography theo chiều dọc (Vertical Text) giúp layout trông như một tạp chí thời trang chuyên nghiệp.
 *    - Các Link dẫn đến `/products?sort=newest` và `/products?category=accessories` là những "điểm chạm" quan trọng để tăng tỷ lệ chuyển đổi (Conversion Rate).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import '@/shared/components/styles/HeroSection.css';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-grid">
                    {/* Content Left */}
                    <div className="hero-content-left">
                        <div className="fade-up delay-200">
                            <p className="hero-subtitle">Drop 02 — Xuân/Hè</p>
                            <h1 className="hero-title">
                                BỘ SƯU TẬP<br />
                                HÀNG NGÀY
                            </h1>
                        </div>

                        <div className="hero-divider fade-up delay-300"></div>

                        <p className="hero-description fade-up delay-400">
                            Những món đồ cần thiết được lựa chọn kỹ lưỡng cho tủ quần áo hiện đại.
                            Những bộ trang phục vượt thời gian được thiết kế để kết hợp, xếp chồng và nâng cao phong cách hàng ngày của bạn.
                        </p>

                        <div className="hero-buttons fade-up delay-500">
                            <Link to="/products?sort=newest" className="hero-btn hero-btn-primary">
                                <span>Mua Hàng Mới</span>
                            </Link>
                            <Link to="/products?category=accessories" className="hero-btn hero-btn-accent">
                                Khám Phá Phụ Kiện
                            </Link>
                        </div>
                    </div>

                    {/* Image Right */}
                    <div className="hero-content-right">
                        <div className="relative">
                            {/* Main Image */}
                            <div className="hero-image-wrapper fade-up delay-200">
                                <img
                                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                                    alt="Hero Fashion"
                                    className="hero-image"
                                />
                            </div>

                            {/* Editorial Text Vertical */}
                            <div className="hero-vertical-text fade-up delay-500">
                                <p className="vertical-text-content">Lựa Chọn Biên Tập</p>
                            </div>

                            {/* Drop Badge */}
                            <div className="hero-badge-container fade-up delay-600">
                                <div className="hero-badge">
                                    <p className="badge-subtitle">Có Sẵn Ngay</p>
                                    <p className="badge-title">DROP 02</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

