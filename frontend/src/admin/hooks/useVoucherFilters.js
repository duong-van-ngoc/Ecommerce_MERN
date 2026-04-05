import { useState, useCallback } from 'react';

const initialFilters = {
    status: [], // ['unused', 'used', 'expired', 'disabled']
    type: [],   // ['fixed', 'percentage', 'shipping', 'gift']
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    expiryStart: '',
    expiryEnd: '',
    search: '',   // Thêm trường tìm kiếm
    page: 1,      // Trang hiện tại
    limit: 10     // Số bản ghi mỗi trang
};

export const useVoucherFilters = () => {
    const [filters, setFilters] = useState(initialFilters);

    // Hàm đếm số lượng bộ lọc đang hoạt động
    const calculateActiveCount = useCallback(() => {
        let count = 0;
        if (filters.status.length > 0) count++;
        if (filters.type.length > 0) count++;
        if (filters.minAmount || filters.maxAmount) count++;
        if (filters.startDate || filters.endDate) count++;
        if (filters.expiryStart || filters.expiryEnd) count++;
        return count;
    }, [filters]);

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const resetFilters = () => {
        setFilters(initialFilters);
    };

    return {
        filters,
        activeCount: calculateActiveCount(),
        updateFilters,
        resetFilters
    };
};
