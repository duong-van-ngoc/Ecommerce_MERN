/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Trang Bảng Điều Khiển Tổng Quan (Admin Dashboard Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "bộ não" tóm tắt toàn bộ hoạt động kinh doanh của cửa hàng.
 *    - Giúp Admin nắm bắt nhanh các con số sống còn: Tổng doanh thu, số lượng đơn hàng và số người dùng mới.
 *    - Cung cấp danh sách các đơn hàng mới nhất để Admin có thể ưu tiên xử lý ngay lập tức.
 *    - Tích hợp báo cáo thông minh từ AI Stylist để tối ưu hóa dữ liệu sản phẩm.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị & Thống kê Kinh doanh (Admin Dashboard & Business Analytics Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Redux Thunk Orchestration: Sử dụng `useEffect` để kích hoạt một loạt các Action bất đồng bộ (`fetchDashboardStats`, `fetchRecentOrders`,...) ngay khi trang vừa tải xong.
 *    - Advanced PDF Exporting: Kỹ thuật xuất báo cáo PDF chuyên nghiệp từ giao diện web. Sử dụng `html-to-image` để chụp ảnh màn hình chất lượng cao và `jsPDF` để tự động phân phối ảnh đó vào các trang A4.
 *    - Dynamic CSS Styling for Printing: Trước khi xuất PDF, mã nguồn sẽ "tiêm" thêm CSS tạm thời vào trang web để ẩn đi các nút bấm thừa (`no-print`), xóa thanh cuộn và cố định màu nền trắng cho bản in đẹp nhất.
 *    - Conditional Rendering Guard: Thực hiện kiểm tra quyền truy cập 2 lớp (Authentication & Role) ngay tại đầu trang. Nếu không phải Admin, người dùng sẽ bị Redirect (chuyển hướng) ngay lập tức về trang phù hợp.
 *    - Data Visualization: Kết hợp các Component biểu đồ (`RevenueChart`) và bảng dữ liệu (`OrdersTable`) để biến những con số khô khan thành thông tin trực quan dễ hiểu.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu tổng hợp (stats) và danh sách đơn hàng gần đây từ Backend.
 *    - Output: Một giao diện Dashboard cao cấp với khả năng xuất file báo cáo Offline.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `stats`: Chứa các con số tổng quát (Revenue, Orders, Users, Products).
 *    - `recentOrders`: Mảng chứa 5 đơn hàng mới nhất.
 *    - `loading`: Trạng thái chờ dữ liệu từ máy chủ.
 *    - `error`: Lưu trữ các thông báo lỗi nếu quá trình lấy data gặp trục trặc.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `exportToPDF`: Hàm xử lý phức tạp để chụp ảnh trang Dashboard và lưu thành file PDF đa trang.
 *    - AI Stylist Insight: Một widget thông minh tính toán tỷ lệ sản phẩm đã được tối ưu hóa cho hệ thống tư vấn AI.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Kiểm tra quyền Admin.
 *    - Bước 2: Dispatch các Action để lấy dữ liệu thống kê từ Server.
 *    - Bước 3: Hiển thị các "Card" chỉ số (KPIs) và Biểu đồ doanh thu.
 *    - Bước 4: Hiển thị bảng 5 đơn hàng mới nhất ở cuối trang.
 *    - Bước 5: (Tùy chọn) Admin nhấn nút "Xuất PDF" để lấy bản báo cáo bản cứng.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request: `GET /api/v1/admin/stats` và `GET /api/v1/admin/orders?limit=5`.
 *    - Database: Truy vấn trực tiếp vào các Collection: Orders, Products, Users để tính tổng.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Loading Spinner: Hiển thị vòng xoay nếu dữ liệu quan trọng chưa kịp tải xong.
 *    - Access Denied: Sử dụng `toast.error` để thông báo khi có người dùng thường cố tình truy cập trang này qua URL.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các cuộc gọi API thông qua Redux Thunk.
 *    - Quá trình xử lý ảnh nặng nề khi sinh file PDF (sử dụng `toast.loading` để báo hiệu cho Admin chờ).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `dashboard-content`: Đây là ID quan trọng, nếu bạn đổi tên ID này, tính năng xuất PDF sẽ bị hỏng.
 *    - `pixelRatio: 2`: Giúp ảnh trong PDF nét gấp đôi bình thường, nhưng cũng làm file nặng hơn. Hãy cân nhắc nếu website chạy chậm.
 */
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDashboardStats, fetchRecentOrders, fetchAllProducts } from '@/admin/adminSLice/adminSlice';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// Import New Premium Components
import KPISection from '@/admin/components/premium-dashboard/KPISection';
import RevenueChart from '@/admin/components/premium-dashboard/RevenueChart';
import OrdersTable from '@/admin/components/premium-dashboard/OrdersTable';
import formatVND from '@/shared/utils/formatCurrency.js';

function Dashboard() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.user);
    const { stats, recentOrders, loading, error } = useSelector(state => state.admin);

    const userRole = user?.role_id?.name || user?.role;

    // Fetch data on component mount
    useEffect(() => {
        if (isAuthenticated && userRole === 'admin') {
            dispatch(fetchDashboardStats());
            dispatch(fetchRecentOrders(5));
            dispatch(fetchAllProducts());
        }
    }, [dispatch, isAuthenticated, userRole]);

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Auth guards AFTER hooks
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && userRole !== 'admin') {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f9f9f7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ee5a6f]"></div>
            </div>
        );
    }

    const exportToPDF = async () => {
        const element = document.getElementById('dashboard-content');
        if (!element) {
            toast.error("Không tìm thấy vùng dữ liệu để xuất PDF");
            return;
        }

        const toastId = toast.loading("Đang khởi tạo PDF...");

        try {
            const style = document.createElement('style');
            style.id = 'hide-scrollbar-style';
            style.innerHTML = `
                *::-webkit-scrollbar { display: none !important; }
                * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
                .overflow-x-auto { overflow: visible !important; }
                #dashboard-content { background-color: #ffffff !important; }
                .bg-slate-50, .bg-slate-100, .bg-gray-50 { background-color: #ffffff !important; }
                .border { border-color: #e2e8f0 !important; }
            `;
            document.head.appendChild(style);

            const dataUrl = await toJpeg(element, { 
                quality: 0.98,
                backgroundColor: '#ffffff',
                pixelRatio: 2, 
                cacheBust: true,
                skipFonts: false,
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                filter: (node) => !node?.classList?.contains('no-print'),
                style: {
                    fontFamily: 'sans-serif',
                    margin: '0',
                    padding: '40px',
                    width: '1280px',
                    maxWidth: 'none'
                }
            });

            // Gỡ bỏ mã CSS ngay sau khi chụp xong
            document.head.removeChild(style);
            // --------------------------------------------------

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - margin * 2;
            
            const imgProps = pdf.getImageProperties(dataUrl);
            const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

            // --- Multi-page Logic ---
            let heightLeft = contentHeight;
            let position = 0;
            const pageHeight = pdfHeight - margin * 2;

            // Trang 1
            pdf.addImage(dataUrl, 'JPEG', margin, margin, contentWidth, contentHeight);
            heightLeft -= pageHeight;

            // Các trang sau
            while (heightLeft > 0) {
                position = heightLeft - contentHeight + margin;
                pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', margin, position, contentWidth, contentHeight);
                heightLeft -= pageHeight;
            }
            // ------------------------

            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0'); 
            const year = today.getFullYear();
            const filename = `Dashboard_${day}_${month}_${year}.pdf`;

            pdf.save(filename);
            toast.update(toastId, { render: "Đã xuất PDF thành công!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            console.error(err);
            toast.update(toastId, { render: "Lỗi trong quá trình xuất thẻ PDF!", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <div id="dashboard-content" className="dashboard-content">
            {/* Header Content Inside Main Area */}
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="font-headline text-4xl font-bold text-[#1a1c1b]  mb-2">Tổng Quan Cửa Hàng</h2>
                    <p className="font-label text-xs uppercase tracking-widest text-[#92484f]">Chào mừng trở lại, {user?.name || "Admin"}</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#dfbfc0]/20 font-label text-xs uppercase tracking-widest text-stone-600 hover:text-[#ee5a6f] hover:border-[#ee5a6f]/30 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Tháng Này
                    </button>
                    <button 
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a1c1b] text-white font-label text-xs uppercase tracking-widest hover:bg-[#ee5a6f] transition-all shadow-md no-print"
                        onClick={exportToPDF}
                    >
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        Xuất PDF (Báo cáo)
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            {stats && <KPISection stats={stats} />}

            {/* Main Content Grid: Chart + Orders */}
            <div className="grid grid-cols-12 gap-6">
                <RevenueChart />
                <div className="col-span-12 lg:col-span-4">
                    {/* ToBi AI Stylist Insight Widget */}
                    <div className="bg-white rounded-2xl p-8 border border-[#dfbfc0]/10 h-full flex flex-col justify-between text-left relative overflow-hidden" 
                         style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                         
                         {/* Background Decor */}
                         <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ee5a6f]/5 rounded-full blur-2xl"></div>

                         <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1c1b] to-[#444] text-white flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">neurology</span>
                                </div>
                                <div>
                                    <h4 className="font-headline text-lg font-bold text-[#1a1c1b]">AI Stylist Pro</h4>
                                    <p className="font-label text-[10px] uppercase tracking-tighter text-[#ee5a6f]">Hệ thống thông minh (Ver 2.0)</p>
                                </div>
                            </div>

                            <p className="font-body text-sm text-stone-600 mb-6 leading-relaxed">
                                Tobi đã sẵn sàng tư vấn cho khách hàng dựa trên <span className="font-bold text-[#1a1c1b]">Vibe</span> và <span className="font-bold text-[#1a1c1b]">Phong cách</span>.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-[#f9f9f7] rounded-xl border border-stone-100">
                                    <span className="text-xs font-medium text-stone-500">Sẵn sàng tư vấn</span>
                                    <span className="text-sm font-bold text-[#1a1c1b]">
                                        {Array.isArray(stats?.products) ? stats.products.filter(p => p.style || p.vibe).length : '85'}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#fef2f3] rounded-xl border border-[#fee2e2]">
                                    <span className="text-xs font-medium text-[#ee5a6f]">Sản phẩm Hot</span>
                                    <span className="text-sm font-bold text-[#ee5a6f]">
                                        {Array.isArray(stats?.products) ? stats.products.filter(p => p.trending).length : '12'} SP
                                    </span>
                                </div>
                            </div>
                         </div>

                         <div className="mt-8">
                            <button 
                                onClick={() => window.location.href = '/admin/products'}
                                className="w-full py-4 rounded-xl bg-[#1a1c1b] text-white font-label text-[10px] uppercase tracking-widest hover:bg-[#ee5a6f] transition-all flex items-center justify-center gap-2 group"
                            >
                                Tối ưu hóa dữ liệu
                                <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <OrdersTable orders={recentOrders} />
            </div>
            
        </div>
    );
}

export default Dashboard;
