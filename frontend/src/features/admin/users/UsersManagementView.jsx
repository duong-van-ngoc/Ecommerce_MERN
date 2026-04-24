import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllUsers, updateUserRole, toggleUserStatus } from '@/admin/adminSLice/adminSlice';
import { selectAdminUsers } from '@/features/admin/state/adminSelectors';
import UserDetailModal from '@/admin/components/UserDetailModal';
import '@/pages/admin/styles/UsersManagement.css';

function UsersManagementView() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(selectAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lockReasonInput, setLockReasonInput] = useState('');
  const [showLockModal, setShowLockModal] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await dispatch(updateUserRole({ id, role: newRole })).unwrap();
      toast.success('Cập nhật quyền thành công!');
    } catch (err) {
      toast.error(err || 'Cập nhật thất bại');
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.isActive) {
      setShowLockModal(user._id);
      setLockReasonInput('');
    } else {
      if (window.confirm(`Bạn có chắc muốn mở khóa tài khoản "${user.name}"?`)) {
        try {
          await dispatch(toggleUserStatus({ id: user._id })).unwrap();
          toast.success('Mở khóa tài khoản thành công!');
        } catch (err) {
          toast.error(err || 'Thao tác thất bại');
        }
      }
    }
  };

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

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = users?.filter((user) => {
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
      <div className="users-header">
        <div>
          <h2 className="users-title">Quản lý người dùng</h2>
          <p className="users-subtitle">Quản lý tài khoản, quyền hạn và trạng thái người dùng</p>
        </div>
      </div>

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
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
        </select>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Quyền</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Hành động</th>
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
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive === false ? 'status-locked' : 'status-active'}`}>
                      {user.isActive === false ? 'Bị vô hiệu hóa' : 'Hoạt động'}
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

      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default UsersManagementView;
