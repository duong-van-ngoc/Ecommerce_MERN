import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllUsers, updateUserRole, deleteUser } from '../adminSLice/adminSlice';
import '../styles/UsersManagement.css';

/**
 * UsersManagement - Trang quản lý người dùng
 */
function UsersManagement() {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector(state => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

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

    // Xử lý xóa user
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            try {
                await dispatch(deleteUser(id)).unwrap();
                toast.success('Xóa người dùng thành công!');
            } catch (err) {
                toast.error(err || 'Xóa người dùng thất bại');
            }
        }
    };

    // Filter users
    const filteredUsers = users?.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
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
                    <p className="users-subtitle">Quản lý tài khoản và quyền người dùng</p>
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
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Người Dùng</th>
                            <th>Quyền</th>
                            <th>Ngày Tham Gia</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user._id}>
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
                                            className={`role-select ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(user._id)}
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-users">
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersManagement;
