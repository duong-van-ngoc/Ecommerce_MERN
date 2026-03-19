/**
 * ============================================================================
 * COMPONENT: HeroSection
 * ============================================================================
 * 1. Component là gì: 
 *    - Khu vực Banner chính lớn nhất ngay dưới Navigation trên Trang chủ. 
 *    - Mời gọi các thông điệp Marketing chiến lược (Campaign Drop 02) để tăng Sale.
 * 
 * 2. Props: 
 *    - Stateless nên không nhận props control logic.
 * 
 * 3. State:
 *    - Không sử dụng Local/Global state.
 * 
 * 4. Render lại khi nào:
 *    - Bản thân không bị Re-render từ bên trong do không có state bound.
 * 
 * 5. Event handling:
 *    - Có Call-to-action (CTA) bằng `<Link>` trigger URL redirect.
 * 
 * 6. Conditional rendering:
 *    - Render 100% markup thuần cố định.
 * 
 * 7. List rendering:
 *    - Không có Data Array.
 * 
 * 8. Controlled input:
 *    - Không có Data fields.
 * 
 * 9. Lifting state up:
 *    - Không.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Render ngay frame đầu tiên ở đầu Trang chủ (First View). 
 *    - (2) Áp dụng các class CSS Delay animation như `fade-up delay-200` để các khung chữ và khối ảnh trôi lên mượt mà theo tuần tự.
 *    - (3) Hai nút bấm "Mua Hàng Mới" và "Khám Phá Phụ Kiện" chứa cứng Link dẫn sang query filter của `/products` tương ứng nhằm thúc giục khách hàng nhấn vào Cửa hàng.
 * ============================================================================
 */
import React from 'react';
import { Link } from 'react-router-dom';
import '../componentStyles/HeroSection.css';

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

