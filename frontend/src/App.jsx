
import React, { useEffect } from 'react'
import Home from './pages/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductDetails from './Pages/ProductDetails'
import Products from './pages/Products'
import Register from './User/Register'
import Login from './User/Login'
import { useDispatch, useSelector } from 'react-redux'
import { loaderUser } from './features/user/userSlice'
import UserDashboard from './User/UserDashboard'
import Profile from './User/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import UpdateProfile from './User/UpdateProfile'
import UpdatePassword from './User/UpdatePassword'
import ForgotPassword from './User/ForgotPassword'
import ResetPassword from './User/ResetPassword'
import Cart from './Cart/Cart'
import Shipping from './Cart/Shipping'
import OrderConfirm from './Cart/OrderConfirm'
import Payment from './Cart/Payment'
import MyOrders from "./Cart/MyOrders";
import OrderSuccess from "./Cart/OrderSuccess";
import Notifications from "./User/Notifications";
import Vouchers from "./User/Vouchers";



function App() {

  const { isAuthenticated, user } = useSelector(state => state.user)

  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(loaderUser());
    }

  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
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
        {/* <Route path ="/reset/:token" element={<ResetPassword />} /> */}
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart />} />
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
          path="/order/success"
          element={<ProtectedRoute element={<OrderSuccess />} />}
        />

        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/order" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/promotion" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/wallet" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/notifications/shopee" element={<ProtectedRoute element={<Notifications />} />} />

        <Route path="/vouchers" element={<ProtectedRoute element={<Vouchers />} />} />

      </Routes>

      {isAuthenticated && <UserDashboard user={user} />}
    </Router>
  )
}

export default App