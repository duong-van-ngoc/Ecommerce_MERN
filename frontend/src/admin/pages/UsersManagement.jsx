/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Trang Quản Lý Người Dùng (Users Management Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp cái nhìn tổng quan về tất cả tài khoản khách hàng trên hệ thống.
 *    - Thực hiện nhiệm vụ quan trọng: Phân quyền (Role Management) và Quản trị trạng thái tài khoản (Khóa/Mở khóa).
 *    - Sử dụng cơ chế Soft Delete: Tài khoản bị khóa (isActive=false) thay vì xóa vĩnh viễn, bảo toàn dữ liệu đơn hàng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Nhân sự & Bảo mật hệ thống (User Identity & Access Management - IAM).
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllUsers, updateUserRole, toggleUserStatus } from '../adminSLice/adminSlice';
import UserDetailModal from '../components/UserDetailModal';
import '../styles/UsersManagement.css';


/**
 * UsersManagement - Trang quản lý người dùng
 */
function UsersManagement() {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector(state => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lockReasonInput, setLockReasonInput] = useState('');
    const [showLockModal, setShowLockModal] = useState(null);


    // Fetch users khi component mount
    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Hiển thị error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Xử lý cập nhật role
    const handleRoleChange = async (id, newRole) => {
        try {
            await dispatch(updateUserRole({ id, role: newRole })).unwrap();
            toast.success('Cập nhật role thành công!');
        } catch (err) {
            toast.error(err || 'Cập nhật thất bại');
        }
    };

    // Xử lý toggle status (khóa/mở khóa)
    const handleToggleStatus = async (user) => {
        if (user.isActive) {
            // Show lock reason modal before deactivating
            setShowLockModal(user._id);
            setLockReasonInput('');
        } else {
            // Reactivate directly
            if (window.confirm(`Bạn có chắc muốn MỞ KHÓA tài khoản "${user.name}"?`)) {
                try {
                    await dispatch(toggleUserStatus({ id: user._id })).unwrap();
                    toast.success('Mở khóa tài khoản thành công!');
                } catch (err) {
                    toast.error(err || 'Thao tác thất bại');
                }
            }
        }
    };

    // Confirm lock with reason
    const handleConfirmLock = async (userId) => {
        try {
            await dispatch(toggleUserStatus({
                id: userId,
                reason: lockReasonInput || 'Vi phạm chính sách hệ thống'
            })).unwrap();
            toast.success('Khóa tài khoản thành công!');
            setShowLockModal(null);
            setLockReasonInput('');
        } catch (err) {
            toast.error(err || 'Thao tác thất bại');
        }
    };

    // Mở modal chi tiết
    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };


    // Filter users
    const filteredUsers = users?.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const userRole = user?.role_id?.name || user?.role;
        const matchesRole = roleFilter === 'all' || userRole === roleFilter;

        const matchesStatus = statusFilter === 'all'
            || (statusFilter === 'active' && user.isActive !== false)
            || (statusFilter === 'locked' && user.isActive === false);

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="users-page">
            {/* Header */}
            <div className="users-header">
                <div>
                    <h2 className="users-title">Quản Lý Người Dùng</h2>
                    <p className="users-subtitle">Quản lý tài khoản, quyền hạn và trạng thái người dùng</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="users-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="all">Tất cả quyền</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    className="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">🟢 Hoạt động</option>
                    <option value="locked">🔴 Bị khóa</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Người Dùng</th>
                            <th>Quyền</th>
                            <th>Trạng Thái</th>
                            <th>Ngày Tham Gia</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user._id} className={user.isActive === false ? 'row-locked' : ''}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.avatar?.url ? (
                                                    <img src={user.avatar.url} alt={user.name} />
                                                ) : (
                                                    <span className="avatar-placeholder">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className={`role-select ${(user?.role_id?.name || user?.role) === 'admin' ? 'role-admin' : 'role-user'}`}
                                            value={user?.role_id?.name || user?.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isActive === false ? 'status-locked' : 'status-active'}`}>
                                            {user.isActive === false ? '🔒 Bị vô hiệu hóa' : '✅ Hoạt động'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-view"
                                                onClick={() => handleViewDetail(user)}
                                                title="Xem chi tiết"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className={`btn-toggle-status ${user.isActive === false ? 'btn-unlock' : 'btn-lock'}`}
                                                onClick={() => handleToggleStatus(user)}
                                                title={user.isActive === false ? 'Mở khóa' : 'Khóa tài khoản'}
                                            >
                                                {user.isActive === false ? '🔓' : '🔒'}
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-users">
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Lock Reason Modal */}
            {showLockModal && (
                <div className="lock-modal-overlay" onClick={() => setShowLockModal(null)}>
                    <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>🔒 Khóa tài khoản</h3>
                        <p>Nhập lý do khóa tài khoản (tùy chọn):</p>
                        <textarea
                            className="lock-reason-input"
                            value={lockReasonInput}
                            onChange={(e) => setLockReasonInput(e.target.value)}
                            placeholder="Ví dụ: Vi phạm chính sách, spam, v.v..."
                            rows={3}
                        />
                        <div className="lock-modal-actions">
                            <button
                                className="btn-confirm-lock"
                                onClick={() => handleConfirmLock(showLockModal)}
                            >
                                Xác nhận khóa
                            </button>
                            <button
                                className="btn-cancel-lock"
                                onClick={() => setShowLockModal(null)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chi tiết người dùng */}
            <UserDetailModal 
                user={selectedUser} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}

export default UsersManagement;
