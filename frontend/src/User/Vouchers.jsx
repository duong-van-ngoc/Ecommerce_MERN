import React, { useState } from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../UserStyles/Vouchers.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Vouchers = () => {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "Tất Cả" },
        { id: "shop", label: "Voucher Của Shop" },
        { id: "freeship", label: "Miễn Phí Vận Chuyển" },
        { id: "discount", label: "Giảm Giá" },
    ];

    // Mock Data
    const mockVouchers = [
        {
            id: 1,
            type: "freeship",
            icon: "🚚",
            discount: "Miễn phí vận chuyển",
            title: "Giảm tối đa ₫15.000",
            condition: "Đơn tối thiểu ₫50.000",
            expiry: "HSD: 28.02.2024",
            usedPercent: 76,
            saved: true,
        },
        {
            id: 2,
            type: "discount",
            icon: "🎫",
            discount: "Giảm 30%",
            title: "Giảm tối đa ₫50.000",
            condition: "Đơn tối thiểu ₫200.000",
            expiry: "HSD: 15.02.2024",
            usedPercent: 45,
            saved: false,
        },
        {
            id: 3,
            type: "shop",
            icon: "🏪",
            discount: "₫20K",
            title: "Voucher ToBi Shop",
            condition: "Đơn tối thiểu ₫100.000",
            expiry: "HSD: 10.02.2024",
            usedPercent: 90,
            saved: true,
        },
        {
            id: 4,
            type: "freeship",
            icon: "🚚",
            discount: "Miễn phí vận chuyển",
            title: "Giảm tối đa ₫25.000",
            condition: "Đơn tối thiểu ₫0",
            expiry: "HSD: 20.02.2024",
            usedPercent: 30,
            saved: false,
        },
        {
            id: 5,
            type: "discount",
            icon: "🎁",
            discount: "Giảm 50%",
            title: "Flash Sale - Giảm tối đa ₫100.000",
            condition: "Đơn tối thiểu ₫500.000",
            expiry: "HSD: 02.02.2024",
            usedPercent: 95,
            saved: true,
        },
        {
            id: 6,
            type: "shop",
            icon: "🛍️",
            discount: "₫10K",
            title: "Ưu đãi khách hàng mới",
            condition: "Không yêu cầu tối thiểu",
            expiry: "HSD: 28.02.2024",
            usedPercent: 20,
            saved: false,
        },
    ];

    const filteredVouchers = activeTab === "all"
        ? mockVouchers
        : mockVouchers.filter(v => v.type === activeTab);

    return (
       <>
       <PageTitle title="Kho Voucher" />
       <Navbar />
        <div className="vouchers-container">
            <div className="vouchers-content">
                <AccountSidebar />
                <div className="vouchers-main">
                    <div className="vouchers-header">
                        <h2>Kho Voucher</h2>
                    </div>

                    {/* Tabs */}
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

                    {/* Voucher List */}
                    <div className="voucher-list">
                        {filteredVouchers.length > 0 ? (
                            filteredVouchers.map(voucher => (
                                <div key={voucher.id} className="voucher-card">
                                    <div className="voucher-left">
                                        <span className="voucher-icon">{voucher.icon}</span>
                                        <span className="voucher-discount">{voucher.discount}</span>
                                    </div>
                                    <div className="voucher-right">
                                        <div>
                                            <div className="voucher-title">{voucher.title}</div>
                                            <div className="voucher-condition">{voucher.condition}</div>
                                            <div className="voucher-expiry">{voucher.expiry}</div>
                                        </div>
                                        <div className="voucher-actions">
                                            <div className="voucher-progress">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${voucher.usedPercent}%` }}
                                                    />
                                                </div>
                                                <div className="progress-text">Đã dùng {voucher.usedPercent}%</div>
                                            </div>
                                            <button className={`use-btn ${voucher.saved ? "saved" : ""}`}>
                                                {voucher.saved ? "Đã lưu" : "Lưu"}
                                            </button>
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
                                <p>Không có voucher nào</p>
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
