/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Cửa Sổ Chi Tiết Người Dùng (User Detail Modal).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp cái nhìn cận cảnh và đầy đủ nhất về một tài khoản (User/Admin) trong hệ thống e-commerce.
 *    - Giúp Admin kiểm tra các thông tin như: Email, ID hệ thống, Ngày gia nhập, và Trạng thái hoạt động.
 *    - Hỗ trợ tính năng trích xuất dữ liệu người dùng ra file JSON để lưu trữ hoặc đối soát ngoại tuyến.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Người dùng (User Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Safe Rendering Pattern: Kiểm tra `if (!isOpen || !user) return null;` ở ngay đầu component. Kỹ thuật này giúp tránh lỗi "Cannot read property of null" cực kỳ phổ biến trong React khi render dữ liệu từ API chưa kịp về hoặc modal chưa mở.
 *    - Event Bubbling Prevention: Sử dụng `e.stopPropagation()` trên nội dung Modal. Điều này đảm bảo khi Admin click VÀO trong modal thì nó không bị đóng nhầm (vì sự kiện click bị dừng lại, không truyền lên lớp Overlay bao quanh).
 *    - Client-side File Generation: Một kỹ thuật "hack" nhỏ nhưng hiệu quả. Sử dụng `Data URI` (`data:text/json;...`) kết hợp với việc tạo thẻ `<a>` ảo để cho phép người dùng tải file JSON trực tiếp từ trình duyệt mà không cần Backend phải viết API xuất file.
 *    - Responsive Date Formatting: Sử dụng `new Date(user.createdAt).toLocaleString('vi-VN')` để format ngày tháng theo chuẩn Việt Nam (Ngày/Tháng/Năm Giờ:Phút).
 *    - UI Fallback Design: Hệ thống hiển thị Avatar kích thước lớn nếu có, nếu không sẽ tự động tạo "Avatar chữ cái đầu" (`user.name.charAt(0)`) với màu sắc nổi bật.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Object `user` (dữ liệu thô từ Database), cờ `isOpen` và hàm `onClose`.
 *    - Output: Giao diện Modal chi tiết và file hồ sơ `user_info.json`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `user`: Chứa toàn bộ "linh hồn" của dữ liệu hiển thị.
 *    - `isOpen`: Quyết định sự tồn tại của Modal trên cây DOM.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `downloadUserInfo`: Đóng gói dữ liệu người dùng vào định dạng JSON và kích hoạt lệnh tải về.
 *    - `handleModalContentClick`: Bảo vệ trải nghiệm người dùng, tránh đóng modal vô lý.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin bấm "Xem chi tiết" ở bảng danh sách người dùng.
 *    - Bước 2: Modal nhận Object User và hiển thị thông tin lên Grid.
 *    - Bước 3: Admin có thể kiểm tra ảnh đại diện, email và ngày tham gia.
 *    - Bước 4: Admin bấm "Tải thông tin" -> File JSON được tải về máy.
 *    - Bước 5: Bấm nút "X" hoặc click ra ngoài để đóng Modal.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Đây là Component hiển thị thuần túy (Presenter), không trực tiếp gọi API. Dữ liệu `user` đã được trang Cha fetch sẵn từ Collection `Users`.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân loại Tag: Dựa vào `user.role` để hiển thị nhãn "QUẢN TRỊ VIÊN" (vàng) hoặc "NGƯỜI DÙNG" (xanh).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có tác vụ bất đồng bộ phức tạp (vì dữ liệu đã có sẵn từ Props).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý phần `downloadUserInfo`: Cách dùng `encodeURIComponent` và `JSON.stringify(userInfo, null, 2)` giúp file JSON tải về có định dạng đẹp (indentation), dễ đọc thay vì một dòng chữ dính liền.
 */

const UserDetailModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    // Hàm tải thông tin người dùng
    const downloadUserInfo = () => {
        const userInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user?.role_id?.name || user?.role,
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
                        <span className={`role-badge ${(user?.role_id?.name || user?.role) === 'admin' ? 'role-admin' : 'role-user'}`}>
                            {(user?.role_id?.name || user?.role) === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}
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
                                <span className={user.isActive === false ? 'status-locked' : 'status-active'}>
                                    {user.isActive === false ? '🔒 Bị vô hiệu hóa' : '✅ Hoạt động'}
                                </span>
                            </div>
                            {user.isActive === false && user.lockReason && (
                                <div className="info-item">
                                    <label>Lý do khóa</label>
                                    <span className="lock-reason-text">{user.lockReason}</span>
                                </div>
                            )}
                            {user.isActive === false && user.blockedAt && (
                                <div className="info-item">
                                    <label>Ngày khóa</label>
                                    <span>{new Date(user.blockedAt).toLocaleString('vi-VN')}</span>
                                </div>
                            )}
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
