import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
    fetchMyVouchers, 
    fetchActiveVouchers, 
    claimVoucher, 
    resetClaimState 
} from "../voucherSlice";
import formatVND from "@/shared/utils/formatCurrency";
import { TicketPercent, Gift, Truck, Store } from "lucide-react";

const getVoucherId = (voucherRef) => {
    if (!voucherRef) return null;
    if (typeof voucherRef === "string") return voucherRef;
    return voucherRef._id || voucherRef.id || null;
};

/**
 * Hook quản lý nghiệp vụ Voucher: Lọc, Chuyển đổi dữ liệu và Hành động (Claim)
 */
export const useVouchers = (viewMode) => {
    const dispatch = useDispatch();
    const { 
        myVouchers, 
        activeVouchers, 
        loading, 
        claimLoading, 
        claimSuccess, 
        error 
    } = useSelector((state) => state.voucher);

    const [activeTab, setActiveTab] = useState("all");

    // Fetch dữ liệu dựa trên chế độ xem
    useEffect(() => {
        if (viewMode === "my_vouchers") {
            dispatch(fetchMyVouchers());
        } else {
            dispatch(fetchActiveVouchers());
            dispatch(fetchMyVouchers());
        }
    }, [dispatch, viewMode]);

    // Xử lý thông báo sau khi lưu voucher
    useEffect(() => {
        if (claimSuccess) {
            toast.success("Đã lưu mã giảm giá vào kho của bạn.");
            dispatch(resetClaimState());
        }
        if (error && viewMode === "voucher_center") {
            toast.error(error);
            dispatch(resetClaimState());
        }
    }, [claimSuccess, error, dispatch, viewMode]);

    const handleClaim = (voucherId) => {
        if (!voucherId) return;
        dispatch(claimVoucher(voucherId));
    };

    /**
     * Chuyển đổi dữ liệu từ API sang Schema hiển thị của UI
     */
    const transformVoucher = (data, isOwned = true, ownedRecord = null) => {
        const v = isOwned ? data.voucher : data;
        if (!v || typeof v !== "object") return null;
        const isSaved = isOwned || Boolean(ownedRecord) || Boolean(v.isOwned);
        const savedStatus =
            typeof ownedRecord === "object" && ownedRecord !== null
                ? ownedRecord.status
                : null;

        // Xác định icon và badge dựa trên type
        const typeConfigs = {
            freeship: { Icon: Truck, label: "Miễn phí vận chuyển" },
            shop: { Icon: Store, label: "Độc quyền từ cửa hàng" },
            discount: { Icon: Gift, label: "Ưu đãi giảm giá" },
            default: { Icon: TicketPercent, label: "Mã khuyến mãi" }
        };

        const config = typeConfigs[v.type] || typeConfigs.default;

        const discount = v.discount || {};
        const conditions = v.conditions || {};

        const discountText = discount.type === "percentage" 
            ? `Giảm ${discount.value}%` 
            : `Giảm ${formatVND(discount.value || 0)}`;

        const systemUsedPercent = conditions.usageLimit > 0 
            ? Math.round(((v.usedCount || 0) / conditions.usageLimit) * 100) 
            : 0;

        return {
            id: isOwned ? data._id : v._id,
            originalId: v._id,
            type: v.type,
            Icon: config.Icon,
            badgeLabel: config.label,
            discount: discountText,
            title: v.title || v.code,
            condition: conditions.minOrderAmount > 0 
                ? `Đơn tối thiểu ${formatVND(conditions.minOrderAmount)}` 
                : "Không yêu cầu tối thiểu",
            expiry: conditions.endDate
                ? `HSD: ${new Date(conditions.endDate).toLocaleDateString("vi-VN")}`
                : "HSD: --",
            usedPercent: Math.min(systemUsedPercent, 100),
            status: isOwned ? data.status : isSaved ? savedStatus || "saved" : "available",
            isOwned: isSaved
        };
    };

    // Chuẩn bị danh sách hiển thị
    const filteredVouchers = useMemo(() => {
        const currentVouchers = viewMode === "my_vouchers" 
            ? myVouchers.map(uv => transformVoucher(uv, true))
            : activeVouchers.map(v => {
                const ownedRecord = myVouchers.find(uv => getVoucherId(uv.voucher) === getVoucherId(v));
                return transformVoucher(v, false, ownedRecord);
            });

        const validVouchers = currentVouchers.filter(v => v !== null);

        return activeTab === "all"
            ? validVouchers
            : validVouchers.filter(v => v.type === activeTab);
    }, [myVouchers, activeVouchers, viewMode, activeTab]);

    return {
        vouchers: filteredVouchers,
        loading,
        claimLoading,
        activeTab,
        setActiveTab,
        handleClaim,
        totalCount: viewMode === "my_vouchers" ? myVouchers.length : activeVouchers.length
    };
};
