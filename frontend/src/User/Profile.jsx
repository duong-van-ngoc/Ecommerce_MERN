/**
 * ============================================================================
 * COMPONENT: Profile
 * ============================================================================
 * 1. Component là gì: 
 *    - Màn hình Thông tin cá nhân của người dùng (Profile Main View).
 * 
 * 2. Props: 
 *    - Không có props từ component cha.
 * 
 * 3. State:
 *    - Global State (useSelector): Kéo data `user`, `loading`, `isAuthenticated` từ Redux.
 * 
 * 4. Render lại khi nào:
 *    - Khi thông tin `user` thay đổi hoặc trạng thái `loading` từ Redux cập nhật.
 * 
 * 5. Event handling:
 *    - Không có xử lý Event form (chỉ đơn thuần redirect).
 * 
 * 6. Conditional rendering:
 *    - `loading ? <Loader/> : <div className="profile-page">...</div>`.
 * 
 * 7. List rendering:
 *    - Render layout tĩnh, không có mapping Array ở root class.
 * 
 * 8. Controlled input:
 *    - Không chứa input field.
 * 
 * 9. Lifting state up:
 *    - Không có thao tác lifting state up (Data đọc 1 chiều từ Context/Redux store).
 * 
 * 10. Luồng hoạt động:
 *    - (1) Mở trang, `useEffect` check `isAuthenticated`. Nếu `false`, redirect ngay về `/login` bảo vệ route.
 *    - (2) Nếu hợp lệ, load component layout, gắn component `<AccountSidebar />` phía trái.
 *    - (3) Show thông tin chi tiết: Name, Email, Mã ngày tạo acc, Links thay đổi Mật khẩu/Đơn hàng.
 * ============================================================================
 */
import React, { useEffect } from 'react'
import '../UserStyles/Profile.css'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageTitle from '../components/PageTitle'
import Loader from '../components/Loader'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AccountSidebar from '../components/AccountSidebar'

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
                <div className="profile-page">
                    <div className="profile-page-layout">
                        {/* Sidebar */}
                        <AccountSidebar />

                        {/* Main Content */}
                        <div className="profile-main-content">
                            <div className="profile-container">
                                <div className="profile-image">
                                    <h1 className="profile-heading">
                                        Hồ sơ người dùng
                                    </h1>
                                    {/* <img src={user?.avatar?.url ? user.avatar.url : './images/profile.png'}
                                        alt="User Profile"
                                        className="profile-avatar" />
                                    <Link to="/profile/update"> Chỉnh sửa hồ sơ </Link> */}
                                </div>

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
                                        <Link to="/orders/user" className="hover-btn-gradient">Đơn đặt hàng</Link>
                                        <Link to="/password/update" className="hover-btn-gradient">Đặt lại mật khẩu</Link>
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