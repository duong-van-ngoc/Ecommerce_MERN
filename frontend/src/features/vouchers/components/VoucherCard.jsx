import React from "react";

/**
 * Component hiển thị chi tiết một thẻ Voucher
 */
const VoucherCard = ({ voucher, viewMode, onClaim, claimLoading }) => {
    const isUsed = voucher.status === 'used';

    return (
        <div className={`voucher-card type-${voucher.type} ${isUsed ? 'grayscale' : ''}`}>
            {/* Phần bên trái: Icon & Badge */}
            <div className="voucher-left">
                <span className="voucher-icon">
                    {voucher.Icon && <voucher.Icon size={32} />}
                </span>
                <span className="voucher-badge-type">{voucher.badgeLabel}</span>
                <span className="voucher-discount">{voucher.discount}</span>
            </div>
            
            <div className="voucher-divider"></div>

            {/* Phần bên phải: Nội dung & Hành động */}
            <div className="voucher-right">
                <div className="voucher-info-group">
                    <h3 className="voucher-title">{voucher.title}</h3>
                    <p className="voucher-condition">{voucher.condition}</p>
                </div>
                
                <div className="voucher-actions">
                    <div className="voucher-status-info">
                        <span>
                            {viewMode === "my_vouchers" ? "Voucher đã lưu" : `Đã dùng ${voucher.usedPercent}%`}
                        </span>
                        <span style={{ textTransform: 'none' }}>{voucher.expiry}</span>
                    </div>
                    
                    <div className="voucher-progress">
                        <div
                            className="progress-fill"
                            style={{ width: `${voucher.usedPercent}%` }}
                        />
                    </div>
                    
                    {viewMode === "my_vouchers" ? (
                        <button 
                            className={`use-btn saved ${isUsed ? "used" : ""}`}
                            disabled={isUsed}
                        >
                            {isUsed ? "Đã sử dụng" : (
                                <>
                                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>✓</span> Đã lưu
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            className={`use-btn claim-btn ${claimLoading ? "loading" : ""}`}
                            disabled={claimLoading || voucher.usedPercent >= 100}
                            onClick={() => onClaim(voucher.originalId)}
                        >
                            {claimLoading ? "Đang xử lý..." : voucher.usedPercent >= 100 ? "Hết lượt" : "Lấy mã ngay"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherCard;
