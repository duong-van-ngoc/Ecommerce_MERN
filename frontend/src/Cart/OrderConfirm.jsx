import React, { useEffect, useState } from 'react'
import '../CartStyles/OrderConfirm.css'
import PageTitle from '../components/PageTitle'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useSelector, useDispatch } from 'react-redux' // Thêm useDispatch
import CheckoutPath from './CheckoutPath'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../features/orders/orderSlice' // Import createOrder thunk
import OrderSuccess from './OrderSuccess' // Import popup component
import { toast } from 'react-toastify' // Import toast
import { removeOrderedItems } from '../features/cart/cartSlice'

function OrderConfirm() {
  const dispatch = useDispatch() // Thêm dispatch hook
  const { shippingInfo, cartItems: globalCartItems = [] } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.user)

  // Kiểm tra sản phẩm mua ngay
  let cartItems = globalCartItems;
  const directBuyItem = sessionStorage.getItem("directBuyItem");
  const selectedOrderItems = sessionStorage.getItem("selectedOrderItems");

  if (directBuyItem) {
    cartItems = [JSON.parse(directBuyItem)];
  } else if (selectedOrderItems) {
    cartItems = JSON.parse(selectedOrderItems);
  }

  // State để điều khiển popup thông báo thành công
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState(null)

  // ✅ trạng thái phương thức thanh toán (mặc định là COD)
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('paymentMethod') || '"cod"')
    } catch {
      return 'cod'
    }
  })

  useEffect(() => {
    sessionStorage.setItem('paymentMethod', JSON.stringify(paymentMethod))
  }, [paymentMethod])

  const fullAddress = [
    shippingInfo?.address,
    shippingInfo?.wardName,
    shippingInfo?.districtName,
    shippingInfo?.provinceName,
  ]
    .filter(Boolean)
    .join(', ')

  // Tính tổng tiền dựa trên các mục giỏ hàng ĐANG HOẠT ĐỘNG (hoặc giỏ hàng chung hoặc mua ngay)
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0
  )
  const tax = subtotal * 0.1
  const shippingCharges = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + tax + shippingCharges

  const navigate = useNavigate()

  /**
   * Xử lý đặt hàng
   * FLOW:
   * 1. Validate cart items
   * 2. Chuẩn bị order data
   * 3. Dispatch createOrder API
   * 4. Success → Hiện popup
   * 5. Error → Hiện thông báo lỗi
   */
  const proceesToPayment = async () => {
    // Validation
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng đang trống!', { position: 'top-center' })
      return
    }

    // Ánh xạ thông tin giao hàng frontend sang cấu trúc model backend
    const mappedShippingInfo = {
      address: `${shippingInfo.address}, ${shippingInfo.wardName || ''}`,
      city: shippingInfo.districtName, // Ánh xạ Quận/Huyện -> City
      state: shippingInfo.provinceName, // Ánh xạ Tỉnh/Thành -> State
      country: shippingInfo.country || 'VN',
      pinCode: Number(shippingInfo.pinCode) || 700000,
      phoneNo: Number(shippingInfo.phoneNumber || shippingInfo.phoneNo)
    }

    // Chuẩn bị order data
    const orderData = {
      shippingInfo: mappedShippingInfo,
      orderItems: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0]?.url || item.images?.[0],
        product: item.product
      })),
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'Chưa thanh toán' : 'Đã thanh toán'
      },
      itemsPrice: Number(subtotal),
      taxPrice: Number(tax),
      shippingPrice: Number(shippingCharges),
      totalPrice: Number(total)
    }

    try {
      const result = await dispatch(createOrder(orderData)).unwrap()

      // Lưu thông tin đơn hàng vào sessionStorage
      const data = { subtotal, shippingCharges, tax, total }
      sessionStorage.setItem('orderInfo', JSON.stringify(data))
      sessionStorage.setItem('paymentMethod', JSON.stringify(paymentMethod))

      // Lưu order ID và hiện popup
      setCreatedOrderId(result.order._id)
      setShowSuccessPopup(true)
      sessionStorage.removeItem("directBuyItem"); // Xóa mục mua ngay sau khi thành công
      sessionStorage.removeItem("selectedOrderItems"); // Xóa mục đã chọn sau khi thành công

      // Xóa sản phẩm đã đặt khỏi giỏ hàng
      dispatch(removeOrderedItems(cartItems));

      // Toast success
      toast.success('Đặt hàng thành công!', {
        position: 'top-center',
        autoClose: 2000
      })
    } catch (error) {
      // Xử lý lỗi
      toast.error(error || 'Đặt hàng thất bại. Vui lòng thử lại!', {
        position: 'top-center',
        autoClose: 3000
      })
      console.error('Create order error:', error)
    }
  }

  const formatVND = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ'

  const getItemImage = (item) =>
    item?.image ||
    item?.images?.[0]?.url ||
    item?.images?.[0] ||
    item?.thumbnail ||
    ''

  return (
    <>
      <PageTitle title="Order Confirmation" />
      <Navbar />
      <CheckoutPath activePath={1} />

      <div className="confirm-page">
        <div className="confirm-container">
          <h1 className="confirm-header">🛒 Xác nhận đơn hàng</h1>

          <div className="confirm-content">
            <div className="main-section">
              {/* Customer Information */}
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="#667eea"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Thông tin khách hàng
                  </h2>
                </div>

                <div className="section-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Họ và tên</div>
                      <div className="info-value">{user?.name || '—'}</div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">Số điện thoại</div>
                      <div className="info-value">
                        {shippingInfo?.phoneNumber || shippingInfo?.phoneNo || '—'}
                      </div>
                    </div>

                    <div className="info-item info-item--full">
                      <div className="info-label">Địa chỉ giao hàng</div>
                      <div className="info-value">{fullAddress || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product List */}
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z"
                        stroke="#667eea"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Sản phẩm đã đặt
                  </h2>
                </div>

                <div className="section-body section-body--flush">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => {
                      const lineTotal = Number(item.price) * Number(item.quantity)
                      return (
                        <div
                          className="product-item"
                          key={item.product || item._id || item.name}
                        >
                          <div className="product-image-wrapper">
                            {getItemImage(item) ? (
                              <img
                                className="product-image"
                                src={getItemImage(item)}
                                alt={item.name}
                              />
                            ) : (
                              <div className="product-image-placeholder" />
                            )}
                          </div>

                          <div className="product-details">
                            <h3 className="product-name">{item.name}</h3>
                            <div className="product-meta">
                              <span>
                                Đơn giá: <strong>{formatVND(item.price)}</strong>
                              </span>
                              <span>
                                Số lượng: <strong>x{item.quantity}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="product-price-total">
                            <div className="product-total">{formatVND(lineTotal)}</div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="empty-cart">Không có sản phẩm trong giỏ hàng</div>
                  )}
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z"
                        stroke="#667eea"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="section-body">
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">💵</div>
                        <div className="payment-info">
                          <div className="payment-name">Thanh toán khi nhận hàng</div>

                        </div>
                      </div>
                    </label>

                    {/* <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">🏦</div>
                        <div className="payment-info">
                          <div className="payment-name">Chuyển khoản ngân hàng</div>
                          <div className="payment-desc">
                            Chuyển khoản qua ATM/Internet Banking
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="momo"
                        checked={paymentMethod === 'momo'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">💳</div>
                        <div className="payment-info">
                          <div className="payment-name">Ví MoMo</div>
                          <div className="payment-desc">
                            Thanh toán qua ví điện tử MoMo
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <div className="payment-icon">💰</div>
                        <div className="payment-info">
                          <div className="payment-name">VNPay</div>
                          <div className="payment-desc">Thanh toán qua cổng VNPay</div>
                        </div>
                      </div>
                    </label> */}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                        stroke="#667eea"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Tóm tắt đơn hàng
                  </h2>
                </div>

                <div className="section-body">
                  <div className="summary-row">
                    <span className="summary-label">Tạm tính</span>
                    <span className="summary-value">{formatVND(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Phí giao hàng</span>
                    <span className="summary-value">{formatVND(shippingCharges)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Thuế VAT (10%)</span>
                    <span className="summary-value">{formatVND(tax)}</span>
                  </div>
                  <div className="summary-row summary-row--total">
                    <span className="summary-label">Tổng cộng</span>
                    <span className="summary-value">{formatVND(total)}</span>
                  </div>
                </div>

                <div className="button-container">
                  <button
                    className="proceed-button"
                    onClick={proceesToPayment}
                    disabled={cartItems.length === 0}
                    title={cartItems.length === 0 ? 'Giỏ hàng đang trống' : ''}
                  >
                    Xác nhận đặt hàng
                  </button>
                </div>
              </div>

              {/* (tùy chọn) hiển thị phương thức đang chọn để debug */}
              {/* <div style={{ marginTop: 10, color: "#666" }}>Method: {paymentMethod}</div> */}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Success Popup - Hiện khi đặt hàng thành công */}
      {showSuccessPopup && (
        <OrderSuccess
          orderId={createdOrderId}
          onClose={() => {
            setShowSuccessPopup(false)
            navigate('/orders/user')
          }}
        />
      )}
    </>
  )
}

export default OrderConfirm