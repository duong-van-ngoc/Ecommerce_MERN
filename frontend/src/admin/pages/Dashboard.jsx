/**
 * ============================================================================
 * COMPONENT: Dashboard
 * ============================================================================
 * 1. Component là gì: 
 *    - Trang chủ Bảng điều khiển (Dashboard) của Admin, hiển thị các thống kê tổng quan (Doanh thu, Đơn hàng, Người dùng) và danh sách Đơn hàng mới nhất.
 * 
 * 2. Props: 
 *    - Không Props. Nhận data từ Store Redux.
 * 
 * 3. State:
 *    - Global State (useSelector): 
 *      + `user`, `isAuthenticated` từ userSlice (Để check Role Admin).
 *      + `stats` (Tổng quan 4 card Thống kê), `recentOrders` (Mảng 5 đơn hàng gần nhất), `loading`, `error` từ adminSlice.
 * 
 * 4. Render lại khi nào:
 *    - Khi lấy xong dữ liệu API Thống kê và Redux Store cập nhật các state `stats`, `recentOrders`, `loading`.
 * 
 * 5. Event handling:
 *    - `useEffect` trigger Call API khi vào trang.
 *    - Catch `error` hiển thị Toast popup.
 * 
 * 6. Conditional rendering:
 *    - Chặn quyền: Dùng `Navigate` đá văng về `/login` nếu ko Auth, đá về `/` nếu Role khác Admin.
 *    - Rendering giao diện Loading Spinner khi fetch dữ liệu chậm `if (loading)`.
 *    - Render List card thống kê `if (stats)` có tồn tại.
 *    - Bảng danh sách đơn hàng `recentOrders.length > 0` hiển thị Bảng, ngược lại hiển thị Text Trống.
 * 
 * 7. List rendering:
 *    - Map List mảng `recentOrders.map` đổ ra từng dòng `<tr>` cho Table Đơn hàng gần đây.
 * 
 * 8. Controlled input:
 *    - Component thuần View tĩnh, không có Input form.
 * 
 * 9. Lifting state up:
 *    - Fetch API qua Action Thunk của Redux: `fetchDashboardStats` và `fetchRecentOrders`. Store tự lo việc lưu State.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Router điều hướng vào Dashboard, Render vòng 1 -> Kiểm tra Authenticate, không phải Admin thì Redirect.
 *    - (2) Dispatch 2 Action gọi 2 API (lấy data Thống kê, lấy 5 đơn hàng mới nhất). Component ở trạng thái Loading.
 *    - (3) API trả về thành công -> Store Redux lưu data vào thẻ `admin` reducer.
 *    - (4) Dashboard nhận trigger State re-render giao diện các thông số tổng (`stats`) và bóc mảng array (`recentOrders`) rải ra Table. 
 * ============================================================================
 */
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDashboardStats, fetchRecentOrders, fetchAllProducts } from '../adminSLice/adminSlice';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// Import New Premium Components
import KPISection from '../components/premium-dashboard/KPISection';
import RevenueChart from '../components/premium-dashboard/RevenueChart';
import OrdersTable from '../components/premium-dashboard/OrdersTable';
import formatVND from '../../utils/formatCurrency.js';

function Dashboard() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.user);
    const { stats, recentOrders, loading, error } = useSelector(state => state.admin);

    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS (Rules of Hooks)
    // Fetch data on component mount
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            dispatch(fetchDashboardStats());
            dispatch(fetchRecentOrders(5));
            dispatch(fetchAllProducts());
        }
    }, [dispatch, isAuthenticated, user]);

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

    if (user && user.role !== 'admin') {
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
