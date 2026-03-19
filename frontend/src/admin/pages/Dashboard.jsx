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
import { NavLink, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDashboardStats, fetchRecentOrders } from '../adminSLice/adminSlice';
import '../styles/Dashboard.css';

function Dashboard() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.user);
    const { stats, recentOrders, loading, error } = useSelector(state => state.admin);

    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role !== 'admin') {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchRecentOrders(5));
    }, [dispatch]);

    // Hiển thị error nếu có
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="admin-logo">🛍️ ToBi Shop</div>
                <nav>
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        📊 Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        📦 Quản lý sản phẩm
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        📋 Quản lý đơn hàng
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        👥 Quản lý người dùng
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        🏠 Về trang chủ
                    </NavLink>
                </nav>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                <div className="admin-header">
                    <h1 className="admin-title">Dashboard</h1>
                    <p className="admin-subtitle">Chào mừng trở lại, {user?.name}!</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Tổng Doanh Thu</div>
                            <div className="stat-value">${stats.totalRevenue.value.toLocaleString()}</div>
                            <div className={`stat-change ${stats.totalRevenue.change >= 0 ? 'positive' : 'negative'}`}>
                                {stats.totalRevenue.change >= 0 ? '↑' : '↓'} {Math.abs(stats.totalRevenue.change)}%
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Tổng Đơn Hàng</div>
                            <div className="stat-value">{stats.totalOrders.value}</div>
                            <div className={`stat-change ${stats.totalOrders.change >= 0 ? 'positive' : 'negative'}`}>
                                {stats.totalOrders.change >= 0 ? '↑' : '↓'} {Math.abs(stats.totalOrders.change)}%
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Tổng Sản Phẩm</div>
                            <div className="stat-value">{stats.totalProducts.value}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Tổng Người Dùng</div>
                            <div className="stat-value">{stats.totalUsers.value}</div>
                            <div className={`stat-change ${stats.totalUsers.change >= 0 ? 'positive' : 'negative'}`}>
                                {stats.totalUsers.change >= 0 ? '↑' : '↓'} {Math.abs(stats.totalUsers.change)}%
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                <div className="orders-section">
                    <h2 className="section-title">Đơn Hàng Gần Đây</h2>
                    {recentOrders.length > 0 ? (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Mã Đơn</th>
                                    <th>Khách Hàng</th>
                                    <th>Ngày</th>
                                    <th>Tổng Tiền</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.orderId}>
                                        <td>#{order.orderId.slice(-6)}</td>
                                        <td>{order.customer}</td>
                                        <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                                        <td>${order.total.toLocaleString()}</td>
                                        <td>
                                            <span className={`order-status ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--admin-text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                            Chưa có đơn hàng nào
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
