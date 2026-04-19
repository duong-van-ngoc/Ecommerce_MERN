/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Hồ sơ cá nhân (User Profile Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trung tâm điều khiển của người dùng sau khi đăng nhập thành công.
 *    - Hiển thị thông tin định danh: Tên, Email và Ngày tham gia hệ thống.
 *    - Cung cấp các lối tắt điều hướng quan trọng: Xem lại Đơn hàng, Đổi mật khẩu, và Cập nhật hồ sơ.
 *    - Đóng vai trò là một "Protected View" - Chặn người lạ xâm nhập vào thông tin riêng tư.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản lý Tài khoản (Account Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Protected Route Logic: Kỹ thuật bảo vệ trang web bằng cách kiểm tra biến `isAuthenticated`. Nếu chưa đăng nhập, lập tức "tống" người dùng về trang `/login`. 
 *    - Component Composition: Sử dụng `<AccountSidebar />` để tái sử dụng thanh Menu bên trái cho nhiều trang quản lý khác nhau (Đơn hàng, Mật khẩu...).
 *    - String Manipulation: Sử dụng `.substring(0, 10)` để xử lý chuỗi ngày tháng ISO từ Backend (ví dụ: `2023-10-27T...` thành `2023-10-27`).
 *    - Redux Integration: Đọc dữ liệu `user` trực tiếp từ Global Store thay vì gọi lại API (vì thông tin đã được tải từ lúc App khởi chạy).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu Object `user` từ Redux Store.
 *    - Output: Giao diện quản lý tài khoản cá nhân trực quan.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `loading`, `isAuthenticated`, `user`: Ba biến cốt lõi lấy từ Redux để điều khiển luồng hiển thị.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `useEffect`: Dùng để thực hiện "Kiểm tra tính chính danh" (Authentication Check) ngay khi trang vừa được mở.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhấn vào "Profile" -> `useEffect` kiểm tra login.
 *    - Bước 2: Nếu chưa Login -> Redirect tới `/login`.
 *    - Bước 3: Nếu đã Login -> Redux Store cung cấp dữ liệu User.
 *    - Bước 4: Render giao diện kèm Sidebar và các thông tin cá nhân.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Dữ liệu ở đây thường là dữ liệu "tĩnh" từ Store sau khi đã Login thành công.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Loader Screen: Hiển thị màn hình chờ nếu Redux vẫn đang bận tải dữ liệu User.
 *    - Optional Chaining (`user?.name`): Kỹ thuật an toàn giúp code không bị chết nếu object `user` vô tình bị trống.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Gián tiếp phụ thuộc vào tiến trình `loadUser` bất đồng bộ ở cấp độ App.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Trang này là "người cầm lái" cho bộ khung Account DashBoard. Mọi sự thay đổi về giao diện ở đây thường phải đi đôi với sự đồng bộ trong `AccountSidebar`.
 *    - Chú ý phần hiển thị Avatar (hiện đang được comment lại để chờ logic Database hoàn thiện).
 */
import React, { useEffect } from 'react'
import '@/pages/user/styles/Profile.css'
import '@/pages/user/styles/AccountShared.css'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageTitle from '@/shared/components/PageTitle'
import Loader from '@/shared/components/Loader'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import AccountSidebar from '@/shared/components/AccountSidebar'

function Profile() {
    const { loading, isAuthenticated, user } = useSelector(state => state.user)
    console.log('profile cua: ', user);
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated === false) {
            navigate("/login")
        }
    }, [isAuthenticated])

    return (
        <>
            <PageTitle title={`${user?.name || 'User'} - Hồ sơ cá nhân`} />
            <Navbar />

            {loading ? (<Loader />) : (
                <div className="account-container">
                    <div className="account-content">
                        {/* Sidebar */}
                        <AccountSidebar />

                        {/* Main Content */}
                        <div className="account-main">
                            
                            {/* HERO HEADER - ĐỒNG BỘ GIAO DIỆN */}
                            <div className="account-hero">
                                <div className="hero-content">
                                    <span className="hero-badge">Tài khoản của tôi</span>
                                    <h1 className="hero-title">
                                        Hồ sơ <br />
                                        <span className="hero-title-highlight">Người dùng</span>
                                    </h1>
                                    <p className="hero-desc">
                                        Quản lý thông tin hồ sơ để bảo mật tài khoản. Cập nhật thông tin cá nhân của bạn để nhận dịch vụ tốt nhất từ ToBi Shop.
                                    </p>
                                </div>
                                <div className="hero-stats">
                                    <p className="hero-stats-label">Hạng thành viên</p>
                                    <div className="hero-stats-number">
                                        <span className="number">Bạc</span>
                                        <span className="unit">Member</span>
                                    </div>
                                </div>
                                <div className="hero-decoration-1"></div>
                                <div className="hero-decoration-2"></div>
                            </div>

                            <div className="account-card">
                                <div className="profile-details">
                                    <div className="profile-detail">
                                        <h2>Tên: </h2>
                                        <p>{user?.name}</p>
                                    </div>
                                    <div className="profile-detail">
                                        <h2>Email: </h2>
                                        <p>{user?.email}</p>
                                    </div>
                                    <div className="profile-detail">
                                        <h2>Tham gia vào: </h2>
                                        <p>{user?.createdAt ? String(user.createdAt).substring(0, 10) : 'N/A'}</p>
                                    </div>

                                    <div className="profile-buttons">
                                        <Link to="/orders/user" className="hover-btn-gradient">Lịch sử đơn hàng</Link>
                                        <Link to="/password/update" className="hover-btn-gradient">Đặt lại mật khẩu</Link>
                                        <Link to="/profile/update" className="hover-btn-gradient">Chỉnh sửa hồ sơ</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}

export default Profile