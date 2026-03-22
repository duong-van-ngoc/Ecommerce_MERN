/**
 * ============================================================================
 * COMPONENT: AdminLayout
 * ============================================================================
 * 1. Component là gì: 
 *    - Là HOC Layout Wrapper dành cho các luồng Dashboard của Admin, chứa Sidebar và Outlet cho các component con mount vào vùng thân giao diện.
 * 
 * 2. Luồng hoạt động:
 *    - Xác thực Role Admin. Tích hợp DashboardLayout (Luxury UI) làm Layout tổng cho toàn khối.
 * ============================================================================
 */
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Import New Premium Layout
import DashboardLayout from './premium-dashboard/DashboardLayout';

function AdminLayout() {
    const { isAuthenticated, user } = useSelector(state => state.user);

    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role !== 'admin') {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout user={user}>
            <Outlet />
        </DashboardLayout>
    );
}

export default AdminLayout;
 