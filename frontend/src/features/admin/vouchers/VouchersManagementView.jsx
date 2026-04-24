import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
    Menu, 
    MenuItem, 
    ListItemIcon, 
    ListItemText, 
    CircularProgress, 
    Tooltip,
    IconButton,
    Switch
} from '@mui/material';
import { 
    FileDownload as DownloadIcon, 
    TableChart as TableIcon, 
    AllInclusive as AllIcon, 
    DateRange as DateIcon,
    ContentCopy as CopyIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    TrendingUp as UpIcon,
    TrendingDown as DownIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

import { 
    fetchAllAdminVouchers, 
    deleteVoucher, 
    toggleVoucherStatus 
} from "@/admin/adminSLice/adminSlice";
import { formatVND } from '@/shared/utils/formatCurrency';
import { formatDateTime, formatDateOnly } from '@/shared/utils/formatDate';
import VoucherFormModal from '@/admin/components/VoucherFormModal';
import VoucherFilterDrawer from '@/admin/components/VoucherFilterDrawer';
import VoucherExportRangeModal from '@/admin/components/VoucherExportRangeModal';
import { useVoucherFilters } from '@/admin/hooks/useVoucherFilters';
import { selectAdminVouchers } from '@/features/admin/state/adminSelectors';

const VouchersManagementView = () => {
    const dispatch = useDispatch();
    const { 
        vouchers, 
        totalVouchers, 
        totalPages, 
        currentPage, 
        loading, 
        error 
    } = useSelector(selectAdminVouchers);
    
    const [showModal, setShowModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    
    // Search state với debounce
    const [searchQuery, setSearchQuery] = useState('');
    
    // Logic cho Bộ lọc & Phân trang
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { filters, activeCount, updateFilters, resetFilters } = useVoucherFilters();

    // Logic cho Menu Xuất Excel
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);

    // Effect: Load dữ liệu khi filters hoặc pagination thay đổi
    useEffect(() => {
        dispatch(fetchAllAdminVouchers(filters));
    }, [dispatch, filters]);

    // Effect: Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search: searchQuery, page: 1 });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, updateFilters]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleApplyFilter = (newFilters) => {
        updateFilters({ ...newFilters, page: 1 });
    };

    const handleResetFilter = () => {
        resetFilters();
        setSearchQuery('');
    };

    const handlePageChange = (newPage) => {
        updateFilters({ page: newPage });
    };

    const handleRowsPerPageChange = (e) => {
        updateFilters({ limit: parseInt(e.target.value), page: 1 });
    };

    const handleCloseExportMenu = () => {
        setAnchorEl(null);
    };

    // --- LOGIC XUẤT EXCEL ---
    const transformVoucherToExcel = (v, index) => {
        const status = getVoucherStatus(v);
        return {
            "STT": index + 1,
            "Mã voucher": v.code,
            "Giá trị voucher": v.discount.type === 'percentage' ? `${v.discount.value}%` : formatVND(v.discount.value),
            "Giảm tối đa": v.discount.maxAmount ? formatVND(v.discount.maxAmount) : "Không có",
            "Loại voucher": v.type === 'exclusive' ? 'Độc quyền' : v.type === 'limited' ? 'Giới hạn' : 'Phổ thông',
            "Trạng thái": status.label,
            "Ngày tạo": formatDateTime(v.createdAt),
            "Ngày hết hạn": formatDateOnly(v.conditions.endDate),
            "Số lần đã dùng": v.usedCount || 0,
            "Số lần tối đa": v.conditions.usageLimit === -1 ? "Vô hạn" : v.conditions.usageLimit,
            "Đối tượng": v.targeting.isPublic ? "Công khai" : `Giới hạn (${v.targeting.exclusiveUsers?.length || 0} người)`,
            "Ghi chú": v.description || ""
        };
    };

    const generateExcelFile = (data, fileName) => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Vouchers");
            
            const wscols = [
                { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, 
                { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
                { wch: 25 }, { wch: 30 }
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Xuất file Excel thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Format dữ liệu thất bại!");
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportCurrent = () => {
        if (!vouchers || vouchers.length === 0) return toast.warning("Không có dữ liệu để xuất");
        setExportLoading(true);
        const data = vouchers.map((v, i) => transformVoucherToExcel(v, i));
        generateExcelFile(data, "Danh_sach_voucher_hien_tai");
        setAnchorEl(null);
    };

    const handleExportAll = async () => {
        setExportLoading(true);
        setAnchorEl(null);
        try {
            const result = await dispatch(fetchAllAdminVouchers({ limit: 1000 })).unwrap();
            const data = result.vouchers.map((v, i) => transformVoucherToExcel(v, i));
            generateExcelFile(data, "Danh_sach_tat_ca_voucher");
        } catch {
            toast.error("Không thể lấy toàn bộ dữ liệu");
            setExportLoading(false);
        }
    };

    const handleExportRange = (range) => {
        setExportLoading(true);
        const rangeFilters = { 
            startDate: range.startDate, 
            endDate: range.endDate,
            limit: 1000
        };
        
        dispatch(fetchAllAdminVouchers(rangeFilters)).unwrap().then(result => {
            const data = result.vouchers.map((v, i) => transformVoucherToExcel(v, i));
            generateExcelFile(data, `Danh_sach_voucher_tu_${range.startDate}_den_${range.endDate}`);
        }).catch(() => {
            toast.error("Lỗi khi lấy dữ liệu theo thời gian");
            setExportLoading(false);
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này? Người dùng sẽ không thể sử dụng mã này nữa.')) {
            try {
                await dispatch(deleteVoucher(id)).unwrap();
                toast.success('Xóa voucher thành công!');
            } catch (err) {
                toast.error(err || 'Xóa thất bại');
            }
        }
    };

    const handleToggleStatus = (id) => {
        dispatch(toggleVoucherStatus(id));
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.info(`Đã copy mã: ${code}`, { autoClose: 2000 });
    };

    const getVoucherStatus = (v) => {
        const now = new Date();
        const start = new Date(v.conditions.startDate);
        const end = new Date(v.conditions.endDate);
        const used = v.usedCount || 0;
        const limit = v.conditions.usageLimit;

        if (v.status === 'disabled') return { label: 'Đã vô hiệu', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };
        if (limit !== -1 && used >= limit) return { label: 'Hết lượt', color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' };
        if (now > end) return { label: 'Hết hạn', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' };
        if (now < start) return { label: 'Chờ lịch', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
        
        const isNearEnd = (end - now) < (3 * 24 * 60 * 60 * 1000); // Còn dưới 3 ngày
        if (isNearEnd) return { label: 'Sắp hết hạn', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };

        return { label: 'Hoạt động', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' };
    };

    // Insight Logic - Lấy Top Voucher dựa trên usedCount
    const topVouchers = vouchers ? [...vouchers].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0)).slice(0, 1) : [];
    const bestVoucher = topVouchers[0];

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] p-4 lg:p-8 font-['Inter']">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-['Manrope'] font-800 tracking-tight text-[#191c1d]">Quản lý Voucher</h1>
                        <p className="text-[#434655] font-medium">Trung tâm điều phối chiến dịch khuyến mãi & mã ưu đãi.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => { setSelectedVoucher(null); setShowModal(true); }}
                            className="group flex items-center justify-center gap-2 bg-[#004ac6] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#003ea8] transition-all active:scale-95 whitespace-nowrap"
                        >
                            <AddIcon />
                            <span>Tạo Voucher</span>
                        </button>
                    </div>
                </div>

                {/* 2. Metrics Grid (Phase 2 with Trends) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon="confirmation_number" 
                        label="Tổng số Voucher" 
                        value={totalVouchers || 0} 
                        color="text-[#004ac6]" 
                        bg="bg-[#004ac6]/10"
                        trend={{ value: 12, isUp: true }}
                    />
                    <StatCard 
                        icon="verified" 
                        label="Đang hoạt động" 
                        value={vouchers?.filter(v => v.status === 'active').length || 0} 
                        color="text-green-600" 
                        bg="bg-green-500/10"
                        trend={{ value: 5, isUp: true }}
                    />
                    <StatCard 
                        icon="event_busy" 
                        label="Hết hạn / Hết lượt" 
                        value={vouchers?.filter(v => getVoucherStatus(v).label === 'Hết hạn').length || 0} 
                        color="text-red-500" 
                        bg="bg-red-500/10"
                        trend={{ value: 2, isUp: false }}
                    />
                    <StatCard 
                        icon="redeem" 
                        label="Tổng lượt dùng" 
                        value={vouchers?.reduce((sum, v) => sum + (v.usedCount || 0), 0) || 0} 
                        color="text-amber-600" 
                        bg="bg-amber-500/10"
                        trend={{ value: 8, isUp: true }}
                    />
                </div>

                {/* 3. Main Data Section */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    
                    {/* Toolbar */}
                    <div className="p-6 md:p-8 bg-white border-b border-slate-50 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-['Manrope'] font-bold text-[#191c1d] flex items-center gap-2">
                                <TableIcon className="text-[#004ac6]" />
                                Danh sách Voucher
                            </h2>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsFilterOpen(true)}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all ${activeCount > 0 ? 'bg-[#004ac6] text-white border-[#004ac6]' : 'bg-white text-[#434655] border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <FilterIcon fontSize="small" />
                                    Bộ lọc
                                    {activeCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">{activeCount}</span>}
                                </button>
                                
                                <button 
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#434655] text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    {exportLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
                                    Xuất Excel
                                </button>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={isMenuOpen}
                                    onClose={handleCloseExportMenu}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleExportCurrent} disabled={exportLoading}>
                                        <ListItemIcon>
                                            <TableIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Xuất trang hiện tại</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={handleExportAll} disabled={exportLoading}>
                                        <ListItemIcon>
                                            <AllIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Xuất tất cả</ListItemText>
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            setIsRangeModalOpen(true);
                                            handleCloseExportMenu();
                                        }}
                                        disabled={exportLoading}
                                    >
                                        <ListItemIcon>
                                            <DateIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Xuất theo thời gian</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>

                        {/* Search Bar - Phase 1 */}
                        <div className="relative group">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004ac6] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm nhanh theo mã voucher hoặc tên chiến dịch..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Table Container - Phase 1 */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-8 py-4 sticky left-0 bg-slate-50/50 z-10 w-[200px]">Mã Voucher</th>
                                    <th className="px-6 py-4">Giá trị / Loại</th>
                                    <th className="px-6 py-4">Cấu hình sử dụng</th>
                                    <th className="px-6 py-4">Thời hạn</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-8 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && !vouchers ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <CircularProgress size={40} thickness={5} sx={{ color: '#004ac6' }} />
                                            <p className="mt-4 text-slate-500 font-medium italic">Đang đồng bộ dữ liệu từ server...</p>
                                        </td>
                                    </tr>
                                ) : vouchers?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                    <InfoIcon fontSize="large" />
                                                </div>
                                                <p className="text-slate-500 font-medium">Không tìm thấy mã giảm giá nào phù hợp.</p>
                                                <button onClick={handleResetFilter} className="text-[#004ac6] text-sm font-bold hover:underline">Xóa tất cả bộ lọc</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    vouchers.map((v) => {
                                        const status = getVoucherStatus(v);
                                        const limit = v.conditions.usageLimit;
                                        const used = v.usedCount || 0;
                                        const usagePercent = limit > 0 ? Math.round((used / limit) * 100) : 0;

                                        return (
                                            <tr key={v._id} className="group hover:bg-slate-50/70 transition-colors">
                                                {/* Mã Voucher - Sticky */}
                                                <td className="px-8 py-5 sticky left-0 bg-white group-hover:bg-slate-50/70 transition-colors z-10 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 font-mono font-bold text-[#004ac6] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100/50">
                                                                {v.code}
                                                                <Tooltip title="Copy mã">
                                                                    <IconButton size="small" onClick={() => handleCopyCode(v.code)} sx={{ p: 0.5 }}>
                                                                        <CopyIcon sx={{ fontSize: 14 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>
                                                            <span className="text-[10px] mt-1 text-slate-400 font-medium tracking-wide">ID: ...{v._id.slice(-6)}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Giá trị / Loại */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-[#191c1d]">
                                                            {v.discount.type === 'percentage' ? `${v.discount.value}%` : formatVND(v.discount.value)}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                                                            {v.type === 'exclusive' ? '⭐ Exclusive' : v.type === 'limited' ? '📦 Limited' : '🎉 General'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Tiến độ sử dụng */}
                                                <td className="px-6 py-5">
                                                    <div className="w-48 space-y-2">
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-slate-500">{used}/{limit === -1 ? '∞' : limit} lượt</span>
                                                            <span className={usagePercent > 90 ? 'text-red-500' : 'text-[#004ac6]'}>{usagePercent}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-700 ${usagePercent > 90 ? 'bg-red-500' : 'bg-[#004ac6]'}`} 
                                                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Thời hạn */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <span className="w-0.5 h-3 bg-green-400 rounded-full"></span>
                                                            {formatDateOnly(v.conditions.startDate)}
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${status.label === 'Sắp hết hạn' ? 'text-amber-600' : 'text-slate-700'}`}>
                                                            <span className={`w-0.5 h-3 rounded-full ${status.label === 'Sắp hết hạn' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                                                            {formatDateOnly(v.conditions.endDate)}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Trạng thái */}
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${status.color} border-current/10`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                                        {status.label}
                                                    </span>
                                                </td>

                                                {/* Thao tác */}
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end items-center gap-1">
                                                        <Tooltip title={v.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                            <Switch 
                                                                size="small" 
                                                                checked={v.status === 'active'} 
                                                                onChange={() => handleToggleStatus(v._id)}
                                                                color="primary"
                                                            />
                                                        </Tooltip>
                                                        <IconButton size="small" onClick={() => { setSelectedVoucher(v); setShowModal(true); }}>
                                                            <EditIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDelete(v._id)} color="error">
                                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - Phase 1 */}
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <p className="text-xs font-medium text-slate-500">
                                Hiển thị <span className="text-slate-900 font-bold">{vouchers?.length || 0}</span> trên <span className="text-slate-900 font-bold">{totalVouchers || 0}</span> voucher
                            </p>
                            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">Bản ghi mỗi trang:</span>
                                <select 
                                    value={filters.limit} 
                                    onChange={handleRowsPerPageChange}
                                    className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button 
                                disabled={currentPage === 1 || loading}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                            >
                                <span className="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            
                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#004ac6] hover:text-[#004ac6]'}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                disabled={currentPage === totalPages || totalPages === 0 || loading}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                            >
                                <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Dynamic Insight Banner - Phase 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 relative min-h-[180px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#004ac6] via-[#0052db] to-[#2563eb] p-8 flex flex-col justify-center">
                        <div className="absolute right-0 top-0 h-full w-full opacity-10 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                            </svg>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <h3 className="text-white text-xl md:text-2xl font-800 font-['Manrope']">Tối ưu hiệu quả Voucher</h3>
                            <p className="text-blue-50/80 text-sm md:text-base max-w-lg leading-relaxed">
                                {bestVoucher 
                                    ? `Mã "${bestVoucher.code}" đang dẫn đầu với ${bestVoucher.usedCount} lượt dùng. Hãy cân nhắc gia hạn hoặc tung thêm các mã tương tự!`
                                    : "Bắt đầu triển khai các chiến dịch mới để theo dõi hiệu quả sử dụng mã giảm giá của khách hàng."}
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3">
                                <button className="px-6 py-2.5 bg-white text-[#004ac6] font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/5">Xem báo cáo</button>
                                <button className="px-6 py-2.5 bg-blue-400/20 text-white font-bold rounded-xl hover:bg-blue-400/30 transition-all">Chi tiết Top Voucher</button>
                            </div>
                        </div>
                        <span className="absolute -bottom-6 -right-6 material-symbols-outlined text-[140px] text-white/5 pointer-events-none select-none">insights</span>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-center items-center text-center space-y-4 shadow-xl shadow-slate-200/40">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#004ac6]">
                            <FilterIcon fontSize="large" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-['Manrope'] font-bold text-slate-900 text-lg">Tìm kiếm nâng cao</h4>
                            <p className="text-xs text-slate-500 leading-relaxed px-4">Sử dụng bộ lọc để phân tích chuyên sâu theo mức phí, thời gian hoặc trạng thái sử dụng.</p>
                        </div>
                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="bg-slate-100 text-slate-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                        >
                            Mở bộ lọc bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals & Drawers */}
            {showModal && (
                <VoucherFormModal 
                    voucher={selectedVoucher} 
                    onClose={() => setShowModal(false)} 
                />
            )}

            <VoucherFilterDrawer 
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={filters}
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
            />

            <VoucherExportRangeModal 
                open={isRangeModalOpen}
                onClose={() => setIsRangeModalOpen(false)}
                onConfirm={handleExportRange}
            />

            {/* Custom CSS for Table Scrollbar */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}} />
        </div>
    );
};

/* Sub-component for Stats - Enhanced with Trend Indicator */
const StatCard = ({ icon, label, value, color, bg, trend }) => (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 group hover:translate-y-[-6px] transition-all duration-300 border border-slate-50 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${trend.isUp ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                    {trend.isUp ? <UpIcon sx={{ fontSize: 14 }} /> : <DownIcon sx={{ fontSize: 14 }} />}
                    {trend.value}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[#434655] text-xs md:text-sm font-semibold uppercase tracking-wider">{label}</p>
            <h3 className="text-3xl font-['Manrope'] font-800 text-[#191c1d]">{value}</h3>
        </div>
        <div className="absolute right-0 bottom-0 opacity-[0.03] text-[#004ac6] group-hover:scale-110 transition-transform duration-500">
             <span className="material-symbols-outlined text-[100px] select-none translate-y-8 translate-x-8">{icon}</span>
        </div>
    </div>
);

export default VouchersManagementView;
