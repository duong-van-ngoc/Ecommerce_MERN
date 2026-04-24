/**
 * @deprecated Legacy/alternate voucher page.
 * Active /vouchers route uses Pages/user/voucher-page.jsx -> features/vouchers/VoucherPageView.jsx.
 * Keep this file for audit/history until the voucher module is consolidated.
 */
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
import React, { useState, useEffect } from "react";
import AccountSidebar from "@/shared/components/AccountSidebar";
import "@/pages/user/styles/Vouchers.css";
import "@/pages/user/styles/AccountShared.css";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyVouchers, fetchActiveVouchers, claimVoucher, resetClaimState } from "@/features/vouchers/voucherSlice";
import formatVND from "@/shared/utils/formatCurrency";
import { Loader2, TicketPercent, Gift, Truck, Store } from "lucide-react";
import { toast } from "react-toastify";

const Vouchers = () => {
    const dispatch = useDispatch();
    const { 
        myVouchers, 
        activeVouchers, 
        loading, 
        claimLoading, 
        claimSuccess, 
        error 
    } = useSelector((state) => state.voucher);

    const [viewMode, setViewMode] = useState("my_vouchers"); // my_vouchers | voucher_center
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "Tất Cả" },
        { id: "shop", label: "Voucher của cửa hàng" },
    ];

    useEffect(() => {
        if (viewMode === "my_vouchers") {
            dispatch(fetchMyVouchers());
        } else {
            dispatch(fetchActiveVouchers());
        }
    }, [dispatch, viewMode]);

    useEffect(() => {
        if (claimSuccess) {
            toast.success("Đã lưu voucher vào kho của bạn.");
            dispatch(resetClaimState());
            setViewMode("my_vouchers"); // Chuyển sang kho sau khi lưu thành công
        }
        if (error && viewMode === "voucher_center") {
            toast.error(error);
            dispatch(resetClaimState());
        }
    }, [claimSuccess, error, dispatch, viewMode]);

    const handleClaim = (voucherId) => {
        dispatch(claimVoucher(voucherId));
    };

    // Mapping dữ liệu sang UI Schema
    const transformVoucher = (data, isOwned = true) => {
        const v = isOwned ? data.voucher : data;
        if (!v) return null;

        // Xác định icon và badge
        let IconComponent = TicketPercent;
        let badgeLabel = "Mã khuyến mãi";
        if (v.type === "freeship") {
            IconComponent = Truck;
            badgeLabel = "Miễn phí vận chuyển";
        } else if (v.type === "shop") {
            IconComponent = Store;
            badgeLabel = "Độc quyền từ cửa hàng";
        } else if (v.type === "discount") {
            IconComponent = Gift;
            badgeLabel = "Ưu đãi giảm giá";
        }

        const discountText = v.discount.type === "percentage" 
            ? `Giảm ${v.discount.value}%` 
            : `Giảm ${formatVND(v.discount.value)}`;

        // Tính % đã sử dụng hệ thống (để hiện độ hot)
        const systemUsedPercent = v.conditions.usageLimit > 0 
            ? Math.round((v.usedCount / v.conditions.usageLimit) * 100) 
            : 0;

        return {
            id: isOwned ? data._id : v._id,
            originalId: v._id,
            type: v.type,
            Icon: IconComponent,
            badgeLabel,
            discount: discountText,
            title: v.title || v.code,
            condition: v.conditions.minOrderAmount > 0 
                ? `Đơn tối thiểu ${formatVND(v.conditions.minOrderAmount)}` 
                : "Không yêu cầu tối thiểu",
            expiry: `HSD: ${new Date(v.conditions.endDate).toLocaleDateString("vi-VN")}`,
            usedPercent: systemUsedPercent > 100 ? 100 : systemUsedPercent,
            status: isOwned ? data.status : "available",
            isOwned
        };
    };

    const currentVouchers = viewMode === "my_vouchers" 
        ? myVouchers.map(uv => transformVoucher(uv, true))
        : activeVouchers.map(v => {
            // Kiểm tra xem voucher này user đã sở hữu chưa
            const alreadyOwned = myVouchers.some(uv => uv.voucher?._id === v._id || uv.voucher === v._id);
            return transformVoucher(v, false, alreadyOwned);
        });

    const filteredVouchers = activeTab === "all"
        ? currentVouchers.filter(v => v !== null)
        : currentVouchers.filter(v => v?.type === activeTab);

    return (
       <>
       <PageTitle title="Kho Voucher" />
       <Navbar />
        <div className="account-container">
            <div className="account-content">
                <AccountSidebar />
                <div className="account-main">
                    
                    {/* BƯỚC 1: HERO HEADER (Đồng bộ) */}
                    <div className="account-hero">
                        <div className="hero-content">
                            <span className="hero-badge">Trung tâm ưu đãi</span>
                            <h1 className="hero-title">
                                Kho voucher <br />
                                <span className="hero-title-highlight">của bạn</span>
                            </h1>
                            <p className="hero-desc">
                                Khám phá các ưu đãi đang có và lưu voucher phù hợp cho lần mua sắm tiếp theo.
                            </p>
                        </div>
                        <div className="hero-stats">
                            <p className="hero-stats-label">{viewMode === "my_vouchers" ? "Số lượng trong kho" : "Ưu đãi hiện có"}</p>
                            <div className="hero-stats-number">
                                <span className="number">
                                    {viewMode === "my_vouchers" ? currentVouchers.length : activeVouchers.length}
                                </span>
                                <span className="unit">mã</span>
                            </div>
                        </div>
                        <div className="hero-decoration-1"></div>
                        <div className="hero-decoration-2"></div>
                    </div>

                    {/* Thanh Tab Chế độ (Duy trì logic Vouchers) */}
                    <div className="voucher-mode-selector">
                        <button 
                            className={`mode-btn ${viewMode === "my_vouchers" ? "active" : ""}`}
                            onClick={() => { setViewMode("my_vouchers"); setActiveTab("all"); }}
                        >
                            Kho voucher của tôi
                        </button>
                        <button 
                            className={`mode-btn center ${viewMode === "voucher_center" ? "active" : ""}`}
                            onClick={() => { setViewMode("voucher_center"); setActiveTab("all"); }}
                        >
                            Voucher nổi bật
                        </button>
                    </div>

                    {/* BƯỚC 2: TABS ĐỒNG BỘ */}
                    <div className="account-tab-group">
                         <div className="account-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`account-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BƯỚC 3: CARD GRID UI */}
                    <div className="voucher-list">
                        {loading ? (
                            <div className="loading-state">
                                <Loader2 className="animate-spin" size={40} />
                                <p>Đang tải kho voucher...</p>
                            </div>
                        ) : error ? (
                             <div className="error-state">
                                <p className="text-red-500">Lỗi: {error}</p>
                                <button onClick={() => dispatch(fetchMyVouchers())} className="retry-btn">Thử lại</button>
                            </div>
                        ) : filteredVouchers.length > 0 ? (
                            filteredVouchers.map(voucher => (
                                <div key={voucher.id} className={`voucher-card type-${voucher.type} ${voucher.status === 'used' ? 'grayscale' : ''}`}>
                                    
                                    <div className="voucher-left">
                                        <span className="voucher-icon"><voucher.Icon size={32} /></span>
                                        <span className="voucher-badge-type">{voucher.badgeLabel}</span>
                                        <span className="voucher-discount">{voucher.discount}</span>
                                    </div>
                                    
                                    <div className="voucher-divider"></div>

                                    <div className="voucher-right">
                                        <div>
                                            <h3 className="voucher-title">{voucher.title}</h3>
                                            <p className="voucher-condition">{voucher.condition}</p>
                                        </div>
                                        <div className="voucher-actions">
                                            <div className="voucher-status-info">
                                                <span>{viewMode === "my_vouchers" ? "Voucher đã lưu" : `Đã dùng ${voucher.usedPercent}%`}</span>
                                                <span style={{textTransform: 'none'}}>{voucher.expiry}</span>
                                            </div>
                                            <div className="voucher-progress">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${voucher.usedPercent}%` }}
                                                />
                                            </div>
                                            
                                            {viewMode === "my_vouchers" ? (
                                                <button 
                                                    className={`use-btn saved ${voucher.status === 'used' ? "used" : ""}`}
                                                    disabled={voucher.status === 'used'}
                                                >
                                                    {voucher.status === 'used' ? "Đã sử dụng" : (
                                                        <>
                                                            <span style={{fontSize: "14px", fontWeight: "bold"}}>✓</span> Đã lưu
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button 
                                                    className={`use-btn claim-btn ${claimLoading ? "loading" : ""}`}
                                                    disabled={claimLoading || voucher.usedPercent >= 100}
                                                    onClick={() => handleClaim(voucher.originalId)}
                                                >
                                                    {claimLoading ? "Đang xử lý..." : voucher.usedPercent >= 100 ? "Hết lượt" : "Lấy mã ngay"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-vouchers">
                                <img
                                    src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/c9f754d67d6a5463.png"
                                    alt="No vouchers"
                                />
                                <p>Không tìm thấy mã giảm giá nào trong kho của bạn</p>
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
