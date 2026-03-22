/**
 * ============================================================================
 * COMPONENT: UserDashboard
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `UserDashboard` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Nhận các props: user
 * 
 * 3. State:
 *    - Local State (quản lý nội bộ qua useState).
 *      + Global State (lấy từ Redux qua useSelector).
 * 
 * 4. Render lại khi nào:
 *    - Khi Local State thay đổi.
 *    - Khi Global State (Redux) cập nhật.
 *    - Khi Props từ cha truyền xuống thay đổi.
 * 
 * 5. Event handling:
 *    - Có tương tác sự kiện (onClick, onChange, onSubmit...).
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Sử dụng `.map()` để render danh sách elements.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chỉ mount giao diện thuần và nhận Props.
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
import React, { useState } from 'react'
import '../UserStyles/UserDashboard.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, removeErrors } from '../features/user/userSlice'
import { toast } from 'react-toastify'

function UserDashboard({ user }) {

    const { cartItems } = useSelector(state => state.cart)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // ALL HOOKS must be called BEFORE any conditional return (Rules of Hooks)
    const [menuVisible, setMenuVisible] = useState(false);

    // Guard: hide UserDashboard on admin pages (AFTER all hooks)
    if (location.pathname.startsWith('/admin')) return null;

    function toggleMennu() {
        setMenuVisible(!menuVisible);
    }

    const options = [
        { name: 'Orders', funcName: orders },
        { name: 'Account', funcName: profile },
        { name: `Cart(${cartItems.length})`, funcName: myCart, isCart: true },
        { name: 'Logout', funcName: logoutUser },
    ]
    if (user.role === 'admin') {
        options.unshift({
            name: 'Admin Dashboard', funcName: dashboard
        })
    }
    function orders() {
        navigate("/orders/user")
    }
    function profile() {
        navigate("/profile")

    }
    function myCart() {
        navigate("/cart")
    }
    function logoutUser() {
        dispatch(logout())
            .unwrap()
            .then(() => {
                toast.success("Đăng xuất thành công", { position: 'top-center', autoClose: 3000 })
                dispatch(removeErrors())
                navigate('/login')
            })
            .catch((error) => {
                toast.error(error.message || 'Đăng xuất thất bại', { position: 'top-center', autoClode: 3000 })
            })

    }
    function dashboard() {
        navigate("/admin/dashboard")
    }
    return (

        <>
            <div className={`overlay ${menuVisible ? 'show' : ''}`} onClick={toggleMennu}>


            </div>

            <div className="dashboard-container">
                <div className="profile-header" onClick={toggleMennu}>
                    <img src={user.avatar.url ? user.avatar.url : 'images/profile.png'}
                        alt="Profile Picture"
                        className='profile-avatar'
                        style={{ width: '36px', height: '36px' }}
                    />

                    <span className="profile-name">{user.name || 'user'}</span>

                    {menuVisible && (
                        // phần menu tùy chọn
                        <div className="menu-options">
                            {options.map((item) => {
                                const isCartNotEmpty = item.isCart && (cartItems?.length ?? 0) > 0;

                                return (
                                    <button
                                        key={item.name}
                                        onClick={item.funcName}
                                        className={`menu-option-btn ${isCartNotEmpty ? " cart-not-empty" : ""}`}
                                        type="button"
                                    >
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>


    )
}

export default UserDashboard