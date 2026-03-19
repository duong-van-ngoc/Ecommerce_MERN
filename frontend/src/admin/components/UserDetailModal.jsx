import React from 'react';
import '../styles/UserDetailModal.css';

const UserDetailModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    // Hàm tải thông tin người dùng
    const downloadUserInfo = () => {
        const userInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            avatar: user.avatar?.url || 'No avatar'
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userInfo, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `user_${user.name.replace(/\s+/g, '_')}_info.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // Ngăn chặn nổi bọt sự kiện khi click vào nội dung modal
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="user-detail-overlay" onClick={onClose}>
            <div className="user-detail-modal" onClick={handleModalContentClick}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <div className="modal-header">
                    <div className="user-avatar-large">
                        {user.avatar?.url ? (
                            <img src={user.avatar.url} alt={user.name} />
                        ) : (
                            <span className="avatar-placeholder-large">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="header-info">
                        <h2 className="user-full-name">{user.name}</h2>
                        <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                            {user.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}
                        </span>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="info-section">
                        <h3>Thông tin tài khoản</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Người Dùng ID</label>
                                <span>{user._id}</span>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <span>{user.email}</span>
                            </div>
                            <div className="info-item">
                                <label>Ngày tham gia</label>
                                <span>{new Date(user.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="info-item">
                                <label>Trạng thái</label>
                                <span className="status-active">Hoạt động</span>
                            </div>
                        </div>
                    </div>

                    {/* Có thể mở rộng thêm nếu có thông tin địa chỉ, đơn hàng, v.v. */}
                </div>

                <div className="modal-footer">
                    <button className="btn-download" onClick={downloadUserInfo}>
                        📥 Tải thông tin
                    </button>
                    <button className="btn-close-modal" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
