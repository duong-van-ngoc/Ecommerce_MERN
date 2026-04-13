/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Kho Voucher / Mã giảm giá" (Vouchers / Coupon Wallet).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý và hiển thị danh sách các mã ưu đãi dành cho người dùng.
 *    - Hỗ trợ phân loại mã linh hoạt: Mã Freeship, Mã giảm giá tiền mặt, Mã độc quyền từ Shop.
 *    - Cung cấp trạng thái trực quan: Mã nào đã lưu, tiến độ sử dụng mã (còn bao nhiêu %).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Khuyến mãi & Tiết kiệm người dùng (Marketing & User Savings Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - State-based Filtering (Tabs): Kỹ thuật sử dụng một biến `activeTab` để thay đổi tập dữ liệu hiển thị mà không cần tải lại trang.
 *    - Visual Feedback (Progress Bar): Sử dụng CSS động (`style={{ width: ... }}`) để vẽ thanh tiến độ lượng voucher còn lại.
 *    - Component Styling Logic: Áp dụng class `.saved` để thay đổi màu sắc và nội dung nút bấm dựa trên trạng thái của Voucher.
 *    - Multi-category UI: Thiết kế bố cục thẻ Voucher chuyên nghiệp với icon và thông tin điều kiện áp dụng rõ ràng.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Danh sách `mockVouchers` (dữ liệu mẫu đại diện cho dữ liệu từ Database).
 *    - Output: Giao diện ví voucher phân loại theo nhu cầu người dùng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `activeTab`: Quyết định danh mục voucher nào đang được tiêu điểm (Freeship, Shop, v.v.).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `setActiveTab`: Cập nhật bộ lọc khi người dùng click vào các thanh phân loại ở trên cùng.
 *    - `filteredVouchers`: Mảng kết quả sau khi "sàng lọc" từ danh sách tổng dựa trên tiêu chí `type`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng mở trang Kho Voucher -> `activeTab` mặc định là "all".
 *    - Bước 2: Nhấn vào tab "Miễn phí vận chuyển" -> `activeTab` cập nhật -> Logic lọc mảng chạy.
 *    - Bước 3: UI re-render, chỉ hiện các thẻ voucher có `type === 'freeship'`.
 *    - Bước 4: Click "Lưu" -> Cập nhật trạng thái `saved` (logic này hiện đang để ở UI tĩnh).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - (Dự kiến) UI -> GET /api/v1/vouchers -> MongoDB -> Response. Hiện đang dùng dữ liệu Mock.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Check mảng rỗng: Nếu lọc không ra kết quả, hiển thị ảnh minh họa "Không có voucher nào".
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hiện tại file này thuần Logic UI đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý phần thiết kế `voucher-card`: Đây là một thiết kế đặc thù trong E-commerce, cần giữ đúng cấu trúc để hiển thị đẹp mắt trên cả Mobile và Desktop.
 *    - `AccountSidebar` cũng được tích hợp để đảm bảo người dùng có thể nhảy nhanh sang các mục quản lý tài khoản khác.
 */
import React, { useState } from "react";
import AccountSidebar from "@/shared/components/AccountSidebar";
import "@/pages/user/styles/Vouchers.css";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";

const Vouchers = () => {
   
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "Tất Cả" },
        { id: "shop", label: "Voucher Của Shop" },
        { id: "freeship", label: "Miễn Phí Vận Chuyển" },
        { id: "discount", label: "Giảm Giá" },
    ];

    const mockVouchers = [
        {
            id: 1, type: "freeship", icon: "🚚", discount: "Miễn phí vận chuyển",
            title: "Giảm tối đa ₫15.000", condition: "Đơn tối thiểu ₫50.000",
            expiry: "HSD: 28.02.2024", usedPercent: 76, saved: true,
        },
        {
            id: 2, type: "discount", icon: "🎫", discount: "Giảm 30%",
            title: "Giảm tối đa ₫50.000", condition: "Đơn tối thiểu ₫200.000",
            expiry: "HSD: 15.02.2024", usedPercent: 45, saved: false,
        },
        {
            id: 3, type: "shop", icon: "🏪", discount: "₫20K",
            title: "Voucher ToBi Shop", condition: "Đơn tối thiểu ₫100.000",
            expiry: "HSD: 10.02.2024", usedPercent: 90, saved: true,
        },
        {
            id: 4, type: "freeship", icon: "🚚", discount: "Miễn phí vận chuyển",
            title: "Giảm tối đa ₫25.000", condition: "Đơn tối thiểu ₫0",
            expiry: "HSD: 20.02.2024", usedPercent: 30, saved: false,
        },
        {
            id: 5, type: "discount", icon: "🎁", discount: "Giảm 50%",
            title: "Giờ Vàng - Giảm tối đa ₫100.000", condition: "Đơn tối thiểu ₫500.000",
            expiry: "HSD: 02.02.2024", usedPercent: 95, saved: true,
        },
        {
            id: 6, type: "shop", icon: "🛍️", discount: "₫10K",
            title: "Ưu đãi khách hàng mới", condition: "Không yêu cầu tối thiểu",
            expiry: "HSD: 28.02.2024", usedPercent: 20, saved: false,
        },
    ];

    const filteredVouchers = activeTab === "all"
        ? mockVouchers
        : mockVouchers.filter(v => v.type === activeTab);

   
    
    // Helper định danh nhãn nổi phía trên Icon (Chỉ là text UI)
    const getBadgeLabel = (type) => {
        if (type === 'freeship') return 'Miễn Phí Vận Chuyển';
        if (type === 'discount') return 'Siêu Giảm Giá';
        if (type === 'shop') return 'Độc Quyền Từ Shop';
        return 'Mã Khuyến Mãi';
    };

    return (
       <>
       <PageTitle title="Kho Voucher" />
       <Navbar />
        <div className="vouchers-container">
            <div className="vouchers-content">
                <AccountSidebar />
                <div className="vouchers-main">
                    
                    {/* BƯỚC 1: HERO HEADER (Nâng cấp từ thẻ H2 cũ) */}
                    <div className="vouchers-hero">
                        <div className="hero-content">
                            <span className="hero-badge">Trung Tâm Ưu Đãi</span>
                            <h1 className="hero-title">
                                Kho Voucher <br />
                                <span className="hero-title-highlight">Của Bạn</span>
                            </h1>
                            <p className="hero-desc">
                                Khám phá hàng loạt mã giảm giá hấp dẫn. Mua sắm thông minh, tiết kiệm tối đa cùng ToBi.
                            </p>
                        </div>
                        <div className="hero-stats">
                            <p className="hero-stats-label">Đang sở hữu</p>
                            <div className="hero-stats-number">
                                <span className="number">{mockVouchers.filter(v => v.saved).length || 6}</span>
                                <span className="unit">mã</span>
                            </div>
                        </div>
                        <div className="hero-decoration-1"></div>
                        <div className="hero-decoration-2"></div>
                    </div>

                    {/* BƯỚC 2: TABS BO TRÒN HIỆN ĐẠI */}
                    <div className="vouchers-tab-group">
                         <div className="voucher-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`voucher-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BƯỚC 3: CARD GRID UI */}
                    <div className="voucher-list">
                        {filteredVouchers.length > 0 ? (
                            filteredVouchers.map(voucher => (
                                // Phân biệt schema giao diện thành 3 style bằng class "type-[id]"
                                <div key={voucher.id} className={`voucher-card type-${voucher.type}`}>
                                    
                                    {/* Mảnh trái - Gradient */}
                                    <div className="voucher-left">
                                        <span className="voucher-icon">{voucher.icon}</span>
                                        <span className="voucher-badge-type">{getBadgeLabel(voucher.type)}</span>
                                        <span className="voucher-discount">{voucher.discount}</span>
                                    </div>
                                    
                                    {/* Rãnh cắt đứt xé voucher */}
                                    <div className="voucher-divider"></div>

                                    {/* Mảnh phải - Thông tin & Action */}
                                    <div className="voucher-right">
                                        <div>
                                            <h3 className="voucher-title">{voucher.title}</h3>
                                            <p className="voucher-condition">{voucher.condition}</p>
                                        </div>
                                        <div className="voucher-actions">
                                            <div className="voucher-status-info">
                                                <span>Đã lấy {voucher.usedPercent}%</span>
                                                <span style={{textTransform: 'none'}}>{voucher.expiry}</span>
                                            </div>
                                            <div className="voucher-progress">
                                                <div
                                                    className="progress-fill"
                                                    // Giữ nguyên logic width: %
                                                    style={{ width: `${voucher.usedPercent}%` }}
                                                />
                                            </div>
                                            
                                            {/* Button giữ nguyên logic xử lý State */}
                                            <button className={`use-btn ${voucher.saved ? "saved" : ""}`}>
                                                {voucher.saved ? (
                                                    <>
                                                        <span style={{fontSize: "16px", fontWeight: "bold"}}>✓</span> Đã lưu
                                                    </>
                                                ) : "Lấy mã ngay"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // BƯỚC 4: EMPTY STATE (Tối ưu hóa spacing)
                            <div className="no-vouchers">
                                <img
                                    src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/c9f754d67d6a5463.png"
                                    alt="No vouchers"
                                />
                                <p>Không tìm thấy khuyến mãi nào ở mục này</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <Footer />
       </>
    );
};

export default Vouchers;
