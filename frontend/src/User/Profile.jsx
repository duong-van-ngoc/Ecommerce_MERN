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
                                        <Link to="/orders/user">Đơn đặt hàng</Link>
                                        <Link to="/password/update">Đặt lại mật khẩu</Link>
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