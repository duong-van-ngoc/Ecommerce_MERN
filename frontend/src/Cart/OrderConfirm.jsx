import React from 'react'
import '../CartStyles/orderConfirm.css'
import PageTitle from '../components/PageTitle'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useSelector } from 'react-redux'
import CheckoutPath from './CheckoutPath'
import { useNavigate } from 'react-router-dom'

function OrderConfirm() {
  const { shippingInfo, cartItems = [] } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.user)

  const fullAddress = [
    shippingInfo?.address,
    shippingInfo?.wardName,
    shippingInfo?.districtName,
    shippingInfo?.provinceName,
  ]
    .filter(Boolean)
    .join(', ')

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0
  )
  const tax = subtotal * 0.1

  const shippingCharges = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + tax + shippingCharges

  const navigate = useNavigate();

  const proceesToPayment = () => {
    const data = {
      subtotal,
      shippingCharges,
      tax,
      total,
    }
    sessionStorage.setItem('orderInfo', JSON.stringify(data)) // lưu thông tin đơn hàng vào sessionStorage
    navigate('/process/payment')
  }
  

  return (
    <>
      <PageTitle title="Order Confirmation" />
      <Navbar />
      <CheckoutPath activePath={1} />

      <div className="confirm-container">
        <h1 className="confirm-header">Thong tin dat hang</h1>

        <div className="confirm-table-container">
          <table className="confirm-table">
            <caption>Chi tiet don hang</caption>
            <thead>
              <tr>
                <th>Ten</th>
                <th>So dien thoai</th>
                <th>Dia chi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{user?.name || '—'}</td>
                <td>{shippingInfo?.phoneNumber || '—'}</td>
                <td>{fullAddress || '—'}</td>
              </tr>
            </tbody>
          </table>

          <table className="confirm-table cart-table">
            <caption>Sản phẩm đã đặt</caption>
            <thead>
              <tr>
                <th>Image</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <tr key={item.product || item._id || item.name}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="product-image"
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                    <td>{item.quantity}</td>
                    <td>
                      {(Number(item.price) * Number(item.quantity)).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    Không có sản phẩm trong giỏ hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <table className="confirm-table">
            <caption>Tom tat don hang</caption>
            <thead>
              <tr>
                <th>Tạm tính</th>
                <th>Phí giao hàng</th>
                <th>Thuế VAT</th>
                <th>Tổng cộng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{subtotal.toLocaleString('vi-VN')} đ</td>
                <td>{shippingCharges.toLocaleString('vi-VN')} đ</td>
                <td>{tax.toLocaleString('vi-VN')} đ</td>
                <td>{total.toLocaleString('vi-VN')} đ</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="proceed-button" onClick={proceesToPayment}>Thanh toan</button>
      </div>

      <Footer />
    </>
  )
}

export default OrderConfirm
