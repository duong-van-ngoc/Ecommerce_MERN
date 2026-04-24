import { Route, Routes } from "react-router-dom";

import RequireAdmin from "@/app/guards/RequireAdmin";
import RequireAuth from "@/app/guards/RequireAuth";
import AdminLayout from "@/app/layouts/AdminLayout";
import Dashboard from "@/Pages/admin/Dashboard";
import OrdersManagement from "@/Pages/admin/OrdersManagement";
import ProductsManagement from "@/Pages/admin/ProductsManagement";
import Settings from "@/Pages/admin/Settings";
import UsersManagement from "@/Pages/admin/UsersManagement";
import VouchersManagement from "@/Pages/admin/VouchersManagement";
import ForgotPassword from "@/Pages/auth/ForgotPassword";
import Login from "@/Pages/auth/Login";
import LoginSuccess from "@/Pages/auth/LoginSuccess";
import Register from "@/Pages/auth/Register";
import ResetPassword from "@/Pages/auth/ResetPassword";
import Cart from "@/Pages/checkout/Cart.jsx";
import OrderConfirm from "@/Pages/checkout/OrderConfirm";
import OrderSuccess from "@/Pages/checkout/OrderSuccess";
import Payment from "@/Pages/checkout/Payment";
import Shipping from "@/Pages/checkout/Shipping.jsx";
import VnpayResult from "@/Pages/checkout/VnpayResult";
import MyOrders from "@/Pages/orders/MyOrders";
import OrderDetails from "@/Pages/orders/OrderDetails";
import Home from "@/Pages/public/Home.jsx";
import ProductDetails from "@/Pages/public/ProductDetails.jsx";
import Products from "@/Pages/public/Products.jsx";
import Addresses from "@/Pages/user/Addresses";
import Notifications from "@/Pages/user/Notifications";
import Profile from "@/Pages/user/Profile";
import UpdatePassword from "@/Pages/user/UpdatePassword";
import UpdateProfile from "@/Pages/user/UpdateProfile";
import VoucherPage from "@/Pages/user/voucher-page";
import CartAction from "@/features/cart/components/CartAction.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:keyword" element={<Products />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/success" element={<LoginSuccess />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />

      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/profile/update"
        element={
          <RequireAuth>
            <UpdateProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/password/update"
        element={
          <RequireAuth>
            <UpdatePassword />
          </RequireAuth>
        }
      />
      <Route
        path="/profile/addresses"
        element={
          <RequireAuth>
            <Addresses />
          </RequireAuth>
        }
      />

      <Route path="/cart" element={<Cart />} />
      <Route path="/cart/add/:id" element={<CartAction />} />
      <Route
        path="/shipping"
        element={
          <RequireAuth>
            <Shipping />
          </RequireAuth>
        }
      />
      <Route
        path="/order/confirm"
        element={
          <RequireAuth>
            <OrderConfirm />
          </RequireAuth>
        }
      />
      <Route
        path="/process/payment"
        element={
          <RequireAuth>
            <Payment />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/user"
        element={
          <RequireAuth>
            <MyOrders />
          </RequireAuth>
        }
      />
      <Route
        path="/order/:id"
        element={
          <RequireAuth>
            <OrderDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/order/success"
        element={
          <RequireAuth>
            <OrderSuccess />
          </RequireAuth>
        }
      />
      <Route
        path="/payment/success"
        element={
          <RequireAuth>
            <VnpayResult />
          </RequireAuth>
        }
      />
      <Route
        path="/payment/failed"
        element={
          <RequireAuth>
            <VnpayResult />
          </RequireAuth>
        }
      />

      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/order"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/promotion"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/wallet"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/shopee"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />

      <Route
        path="/vouchers"
        element={
          <RequireAuth>
            <VoucherPage />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductsManagement />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="vouchers" element={<VouchersManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
