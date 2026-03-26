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
import { fetchDashboardStats, fetchRecentOrders } from '../adminSLice/adminSlice';
import html2pdf from 'html2pdf.js';

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

    const exportToPDF = () => {
        window.print();
    };

    return (
        <div className="dashboard-content">
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
                    {/* Placeholder widget for layout balance. Can put top products or recent users here */}
                    <div className="bg-white rounded-2xl p-8 border border-[#dfbfc0]/10 h-full flex flex-col justify-center items-center text-center" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                         <div className="w-16 h-16 rounded-full bg-[#f4f4f2] text-[#ee5a6f] flex items-center justify-center mb-6">
                             <span className="material-symbols-outlined text-3xl">star</span>
                         </div>
                         <h4 className="font-headline text-xl font-bold text-[#1a1c1b] mb-2">Hiệu Suất Hàng Đầu</h4>
                         <p className="font-body text-sm text-stone-500">Các công cụ phân tích sẽ sớm ra mắt để làm nổi bật sản phẩm bán chạy nhất của bạn.</p>                    </div>
                </div>
            </div>

            <div className="mt-6">
                <OrdersTable orders={recentOrders} />
            </div>
            
        </div>
    );
}

export default Dashboard;
