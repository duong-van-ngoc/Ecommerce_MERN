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

function ProfileView() {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user)
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  return (
    <>
      <PageTitle title={`${user?.name || 'Người dùng'} - Hồ sơ cá nhân`} />
      <Navbar />

      {loading ? (<Loader />) : (
        <div className="account-container">
          <div className="account-content">
            <AccountSidebar />

            <div className="account-main">
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
                    <span className="unit">Thành viên</span>
                  </div>
                </div>
                <div className="hero-decoration-1"></div>
                <div className="hero-decoration-2"></div>
              </div>

              <div className="account-card">
                <div className="profile-details">
                  <div className="profile-detail">
                    <h2>Tên:</h2>
                    <p>{user?.name}</p>
                  </div>
                  <div className="profile-detail">
                    <h2>Email:</h2>
                    <p>{user?.email}</p>
                  </div>
                  <div className="profile-detail">
                    <h2>Tham gia vào:</h2>
                    <p>{user?.createdAt ? String(user.createdAt).substring(0, 10) : 'Không có dữ liệu'}</p>
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

export default ProfileView
