/**
 * ============================================================================
 * COMPONENT: App
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `App` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Global State (lấy từ Redux qua useSelector).
 * 
 * 4. Render lại khi nào:
 *    - Khi Global State (Redux) cập nhật.
 * 
 * 5. Event handling:
 *    - Không có event controls phức tạp.
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Không sử dụng list rendering.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chạy useEffect (gọi API hoặc thiết lập timer/listener).
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Home from './Pages/Home.jsx'
import ProductDetails from './Pages/ProductDetails.jsx'
import Products from './Pages/Products.jsx'
import Register from './User/Register'
import Login from './User/Login'
import LoginSuccess from './User/LoginSuccess'
import Profile from './User/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import UpdateProfile from './User/UpdateProfile'
import UpdatePassword from './User/UpdatePassword'
import ForgotPassword from './User/ForgotPassword'
import ResetPassword from './User/ResetPassword'
import { loaderUser } from './features/user/userSlice'
import { syncCartWithUser, fetchCart } from './features/cart/cartSlice'
import UserDashboard from './User/UserDashboard'

import Cart from "./Cart/Cart.jsx";
import CartAction from "./Cart/CartAction.jsx";
import Shipping from "./Cart/Shipping.jsx";
import OrderConfirm from './Cart/OrderConfirm'
import Payment from './Cart/Payment'
import MyOrders from "./Cart/MyOrders";
import OrderDetails from "./Cart/OrderDetails";
import OrderSuccess from "./Cart/OrderSuccess";
import Notifications from "./User/Notifications";
import Vouchers from "./User/Vouchers";
import VnpayResult from "./Pages/VnpayResult";
import AIChatBubble from "./components/layout/AIChatBubble";


// Admin
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import ProductsManagement from './admin/pages/ProductsManagement';
import OrdersManagement from './admin/pages/OrdersManagement';
import UsersManagement from './admin/pages/UsersManagement';
import Settings from './admin/pages/Settings';

function App() {
  const { isAuthenticated, user } = useSelector(state => state.user)
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(loaderUser());
    }
  }, [dispatch, isAuthenticated]);

  // Đồng bộ giỏ hàng theo User ID
  useEffect(() => {
    const userId = user ? user._id : null;
    dispatch(syncCartWithUser(userId));
    if (userId) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/success" element={<LoginSuccess />} />

        <Route path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route path="/profile/update"
          element={<ProtectedRoute element={<UpdateProfile />} />}
        />
        <Route path="/password/update"
          element={<ProtectedRoute element={<UpdatePassword />} />}
        />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/add/:id" element={<CartAction />} />
        <Route path="/shipping"
          element={<ProtectedRoute element={<Shipping />} />}
        />
        <Route path="/order/confirm"
          element={<ProtectedRoute element={<OrderConfirm />} />}
        />
        <Route path="/process/payment"
          element={<ProtectedRoute element={<Payment />} />}
        />
        <Route
          path="/orders/user"
          element={<ProtectedRoute element={<MyOrders />} />}
        />
        <Route
          path="/order/:id"
          element={<ProtectedRoute element={<OrderDetails />} />}
        />
        <Route
          path="/order/success"
          element={<ProtectedRoute element={<OrderSuccess />} />}
        />
        <Route
          path="/payment/success"
          element={<ProtectedRoute element={<VnpayResult />} />}
        />
        <Route
          path="/payment/failed"
          element={<ProtectedRoute element={<VnpayResult />} />}
        />


        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/order" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/promotion" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/wallet" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/shopee" element={<ProtectedRoute element={<Notifications />} />} />

        <Route path="/vouchers" element={<ProtectedRoute element={<Vouchers />} />} />

        {/* Admin Routes với Layout Premium */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {isAuthenticated && <UserDashboard user={user} />}
      <AIChatBubble />
    </Router>
  )
}

export default App