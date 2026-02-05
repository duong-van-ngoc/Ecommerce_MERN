import React, { useEffect } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDashboardStats, fetchRecentOrders } from '../adminSLice/adminSlice';
import '../styles/Dashboard.css';

/**
 * Dashboard - Trang tổng quan admin (Standalone - có sidebar riêng)
 */
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
