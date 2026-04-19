/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Gốc (Root Component) và Trung tâm Điều hướng (Router) của ứng dụng.
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Định nghĩa toàn bộ "bản đồ" đường dẫn (URL) của website.
 *    - Kiểm soát an ninh thông qua việc bảo vệ các trang riêng tư (Protected Routes).
 *    - Thực hiện các tác vụ khởi tạo quan trọng: Kiểm tra phiên đăng nhập của người dùng và đồng bộ hóa giỏ hàng ngay khi mở web.
 *    - Quản lý các thành phần giao diện hiển thị toàn cục (Global Components) như Chatbot AI, Dashboard User.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Điều hướng & Cấu trúc ứng dụng (Navigation & App Structure Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - React Router DOM (v6): Sử dụng `BrowserRouter`, `Routes`, `Route` để quản lý chuyển trang không cần load lại web (SPA).
 *    - Redux Hooks (`useSelector`, `useDispatch`): Kết nối Component với kho dữ liệu trung tâm để lấy thông tin User và kích hoạt các Action.
 *    - Hooks `useEffect`: Thực thi các logic "Side Effect" (như gọi API lấy thông tin cá nhân) ngay khi ứng dụng vừa khởi chạy.
 *    - Higher-Order Component (HOC) Pattern: Sử dụng `ProtectedRoute` để bọc lấy các Component khác nhằm kiểm tra quyền truy cập.
 *    - Admin Layout Pattern: Tổ chức các trang quản trị vào một cấu trúc giao diện riêng biệt.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Trạng thái xác thực (isAuthenticated) và thông tin User từ Redux Store.
 *    - Output: Giao diện (JSX) tương ứng với đường dẫn URL hiện tại trên trình duyệt.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Lấy `isAuthenticated` và `user` từ Redux state để quyết định hiển thị hoặc điều hướng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `useEffect` (dòng 85): Tự động gọi API `loaderUser` để khôi phục trạng thái đăng nhập từ Token lưu trong Cookie/LocalStorage.
 *    - `useEffect` (dòng 92): Lắng nghe sự thay đổi của User để thực hiện đồng bộ giỏ hàng (Sync Cart).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: App Mount -> Chạy useEffect kiểm tra User.
 *    - Bước 2: User hợp lệ -> Tiếp tục chạy logic đồng bộ giỏ hàng.
 *    - Bước 3: Router khớp URL -> Render Component tương ứng (ví dụ: `/products` -> `<Products />`).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - `dispatch(loaderUser)` -> Gọi API Backend `/api/v1/me` -> Trả về User Object -> Cập nhật Redux.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Chỉ hiển thị `UserDashboard` khi `isAuthenticated` là true.
 *    - Các Route lồng nhau (Nested Routes) trong `/admin` để dùng chung `AdminLayout` cao cấp.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `createAsyncThunk` (qua dispatch) để thực hiện các cuộc gọi API lấy dữ liệu User và Cart.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là nơi "đăng ký" mọi trang mới của dự án. Nếu bạn tạo một Page mới mà không khai báo `<Route>` ở đây, người dùng sẽ không thể truy cập qua URL.
 *    - Thứ tự của các Route có thể quan trọng; các route bảo vệ (`ProtectedRoute`) phải luôn đảm bảo check đúng trạng thái Login để tránh lộ dữ liệu.
 */

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Home from '@/pages/public/Home.jsx'
import ProductDetails from '@/pages/public/ProductDetails.jsx'
import Products from '@/pages/public/Products.jsx'
import Register from '@/pages/auth/Register'
import Login from '@/pages/auth/Login'
import LoginSuccess from '@/pages/auth/LoginSuccess'
import Profile from '@/pages/user/Profile'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import UpdateProfile from '@/pages/user/UpdateProfile'
import UpdatePassword from '@/pages/user/UpdatePassword'
import Addresses from '@/Pages/user/Addresses'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import { loaderUser } from '@/features/user/userSlice'
import { syncCartWithUser, fetchCart } from '@/features/cart/cartSlice'
import UserDashboard from '@/pages/user/UserDashboard'

import Cart from "@/pages/checkout/Cart.jsx";
import CartAction from "@/features/cart/components/CartAction.jsx";
import Shipping from "@/pages/checkout/Shipping.jsx";
import OrderConfirm from '@/pages/checkout/OrderConfirm'
import Payment from '@/pages/checkout/Payment'
import MyOrders from "@/pages/orders/MyOrders";
import OrderDetails from "@/pages/orders/OrderDetails";
import OrderSuccess from "@/pages/checkout/OrderSuccess";
import Notifications from "@/pages/user/Notifications";
import VoucherPage from "@/pages/user/voucher-page";
import VnpayResult from "@/pages/checkout/VnpayResult";
import AIChatBubble from "@/features/chat/components/AIChatBubble";


// Admin
import AdminLayout from '@/admin/components/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import ProductsManagement from '@/pages/admin/ProductsManagement';
import OrdersManagement from '@/pages/admin/OrdersManagement';
import UsersManagement from '@/pages/admin/UsersManagement';
import VouchersManagement from '@/pages/admin/VouchersManagement';
import Settings from '@/pages/admin/Settings';

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
        <Route path="/profile/addresses"
          element={<ProtectedRoute element={<Addresses />} />}
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

        <Route path="/vouchers" element={<ProtectedRoute element={<VoucherPage />} />} />

        {/* Admin Routes với Layout Premium */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="vouchers" element={<VouchersManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {isAuthenticated && <UserDashboard user={user} />}
      <AIChatBubble />
    </Router>
  )
}

export default App