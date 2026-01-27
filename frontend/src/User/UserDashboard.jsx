import React , {useState} from 'react'
import '../UserStyles/UserDashboard.css'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {  logout, removeErrors } from '../features/user/userSlice'
import { toast } from 'react-toastify'

function UserDashboard({user}) {

        const {cartItems} = useSelector(state => state.cart)
        const dispatch = useDispatch();
        const navigate = useNavigate();

        const [menuVisible, setMenuVisible] = useState(false);
        function toggleMennu() {
            setMenuVisible(!menuVisible);
        }

        const options = [
            {name : 'Orders', funcName: orders},
            {name: 'Account', funcName: profile},
            {name: `Cart(${cartItems.length})`, funcName: myCart,isCart:true},
            {name: 'Logout', funcName: logoutUser},
        ]
        if(user.role === 'admin') {
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
                toast.success("Đăng xuất thành công", {position:'top-center', autoClose:3000})
                dispatch(removeErrors())
                navigate('/login')
            })
            .catch((error) => {
                toast.error(error.message || 'Đăng xuất thất bại', {position:'top-center', autoClode:3000})
            })

        }
        function dashboard() {
            navigate("/admin/dashboard")
        }
  return (

    <>
    <div className={`overlay ${menuVisible ? 'show': ''}`} onClick={toggleMennu}>


    </div>

    <div className="dashboard-container">
        <div className="profile-header" onClick={toggleMennu}>
            <img src={user.avatar.url?user.avatar.url:'images/profile.png'}
                 alt="Profile Picture" 
                 className='profile-avatar'
            
            />

            <span className="profile-name">{user.name || 'user' }</span>
            
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