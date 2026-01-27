import React from 'react'
import '../CartStyles/Cart.css'
import PageTitle from '../Components/PageTitle'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import CartItem from './CartItem'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

function Cart() {
    // Lấy dữ liệu giỏ hàng từ Redux store
    const {cartItems } = useSelector((state) => state.cart)
    // tính tổng tiền của sản phẩm
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal >= 5000 ? 0 : 30000;
    const total = subtotal + tax + shipping;
    // hàm xử lý khi nhấn nút thanh toán
    const navigate  = useNavigate()
    const checkoutHandler = () => {
      // kiem tra neu chua dang nhap thi chuyen den trang dang nhap
      navigate(`/login?redirect=/shipping`)
    }

  return (
    <>
    <Navbar />
    <PageTitle title ="Gio Hang" />

      {cartItems.length === 0?(
        <div className="empty-cart-container">
          <p className="empty-cart-message">Giỏ hàng của bạn đang trống</p>
          <Link to ="/products" className="viewProducts">Mua Ngay</Link>
        </div>
      ): (
    <>
    <div className="cart-page">
      <div className="cart-items">
        <div className="cart-items-heading">Giỏ hàng</div>
        <div className="cart-table">
            {/* phần tiêu đề bảng giỏ hàng  */}
            <div className="cart-table-header">
              <div className="header-product">Product</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total item-total-heading">Item Total</div>
              <div className="header-action item-total-heading">Actions</div>
            </div>

            {/* Cart Items  */}
            {cartItems && cartItems.map(item => (
              <CartItem item = {item}  key={item.name}/>
            ))
            }
            </div>
      </div>
      {/* // phần thanh toán giỏ hàng */}
      <div className="price-summary">
        <h3 className="price-summary-heading">Price Summary</h3>
        <div className="summary-item">
          <p className="summary-label">Subtotal: </p>
          <p className="summary-value">{subtotal}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Tax (10%): </p>
          <p className="summary-value">{tax}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Shipping: </p>
          <p className="summary-value">{shipping === 0 ? "Miễn phí" : shipping.toLocaleString() + " đ"}</p>
        </div>
        <div className="summary-total">
          <p className="total-label">Total: </p>
          <p className="total-value">{total}</p>
        </div>

        {/* // nút thanh toán */}
        <button className="checkout-btn" onClick={checkoutHandler}>Thanh Toán</button>
      </div>
      
    </div>

    </>
      )}
    <Footer />

    </>
  )
}

export default Cart