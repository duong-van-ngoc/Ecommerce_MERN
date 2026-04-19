import React, { useState } from "react";
import AccountSidebar from "@/shared/components/AccountSidebar";
import PageTitle from "@/shared/components/PageTitle";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import "@/pages/user/styles/Vouchers.css";
import "@/pages/user/styles/AccountShared.css";

// Import từ module Voucher (Mô hình mới)
import { useVouchers, VoucherList } from "@/modules/voucher";

/**
 * PAGE: Kho Voucher / Mã giảm giá
 * Đây là bản refactor sử dụng mô hình Modular Feature-Based
 */
const VoucherPage = () => {
    const [viewMode, setViewMode] = useState("my_vouchers"); // my_vouchers | voucher_center
    
    // Sử dụng Custom Hook để lấy logic và dữ liệu
    const { 
        vouchers, 
        loading, 
        claimLoading, 
        activeTab, 
        setActiveTab, 
        handleClaim,
        totalCount
    } = useVouchers(viewMode);

    const tabs = [
        { id: "all", label: "Tất Cả" },
        { id: "shop", label: "Voucher Của Shop" },
    ];

    return (
        <>
            <PageTitle title="Kho Voucher" />
            <Navbar />
            <div className="account-container">
                <div className="account-content">
                    <AccountSidebar />
                    <div className="account-main">
                        
                        {/* HERO HEADER */}
                        <div className="account-hero">
                            <div className="hero-content">
                                <span className="hero-badge">Trung Tâm Ưu Đãi</span>
                                <h1 className="hero-title">
                                    Kho Voucher <br />
                                    <span className="hero-title-highlight">Của Bạn</span>
                                </h1>
                                <p className="hero-desc">
                                    Khám phá hàng loạt mã giảm giá hấp dẫn. Mua sắm thông minh, tiết kiệm tối đa cùng ToBi Shop.
                                </p>
                            </div>
                            <div className="hero-stats">
                                <p className="hero-stats-label">
                                    {viewMode === "my_vouchers" ? "Số lượng trong kho" : "Ưu đãi hiện có"}
                                </p>
                                <div className="hero-stats-number">
                                    <span className="number">{totalCount}</span>
                                    <span className="unit">mã</span>
                                </div>
                            </div>
                            <div className="hero-decoration-1"></div>
                            <div className="hero-decoration-2"></div>
                        </div>

                        {/* SELECTOR CHẾ ĐỘ (My Vouchers vs Center) */}
                        <div className="voucher-mode-selector">
                            <button 
                                className={`mode-btn ${viewMode === "my_vouchers" ? "active" : ""}`}
                                onClick={() => { setViewMode("my_vouchers"); setActiveTab("all"); }}
                            >
                                Kho Voucher Của Tôi
                            </button>
                            <button 
                                className={`mode-btn center ${viewMode === "voucher_center" ? "active" : ""}`}
                                onClick={() => { setViewMode("voucher_center"); setActiveTab("all"); }}
                            >
                                Trung Tâm Voucher HOT
                            </button>
                        </div>

                        {/* THANH TAB LỌC */}
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

                        {/* DANH SÁCH VOUCHER (Đã refactor thành component riêng) */}
                        <VoucherList 
                            vouchers={vouchers}
                            loading={loading}
                            viewMode={viewMode}
                            onClaim={handleClaim}
                            claimLoading={claimLoading}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VoucherPage;
