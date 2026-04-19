import React from "react";
import VoucherCard from "./VoucherCard";
import { Loader2 } from "lucide-react";

/**
 * Component hiển thị danh sách các thẻ Voucher kèm trạng thái loading/no-data
 */
const VoucherList = ({ 
    vouchers, 
    loading, 
    viewMode, 
    onClaim, 
    claimLoading,
    onRetry
}) => {
    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 className="animate-spin" size={40} />
                <p>Đang tải kho voucher...</p>
            </div>
        );
    }

    if (vouchers.length === 0) {
        return (
            <div className="no-vouchers">
                <img
                    src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/c9f754d67d6a5463.png"
                    alt="No vouchers"
                />
                <p>Không tìm thấy mã giảm giá nào phù hợp</p>
                {onRetry && (
                    <button onClick={onRetry} className="retry-btn mt-4">Tải lại</button>
                )}
            </div>
        );
    }

    return (
        <div className="voucher-list">
            {vouchers.map((voucher) => (
                <VoucherCard 
                    key={voucher.id}
                    voucher={voucher}
                    viewMode={viewMode}
                    onClaim={onClaim}
                    claimLoading={claimLoading}
                />
            ))}
        </div>
    );
};

export default VoucherList;
