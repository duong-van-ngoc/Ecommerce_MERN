/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Giỏ hàng (Cart Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý danh sách các mặt hàng người dùng đã chọn nhưng chưa thanh toán.
 *    - Tính toán chi tiết tài chính: Tạm tính, Thuế, Phí vận chuyển và Tổng thanh toán.
 *    - Kiểm soát biến thể tinh vi: Xử lý đúng sản phẩm dựa trên sự kết hợp ID-Size-Màu.
 *    - Cầu nối sang luồng Thanh toán: Chuẩn bị dữ liệu `selectedOrderItems` cho bước tiếp theo.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Mua sắm & Thanh toán (Checkout Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `getItemKey`: Một kỹ thuật Custom Key để phân biệt các bản thể khác nhau của cùng một sản phẩm (khác Size/Màu).
 *    - Functional Programming: Sử dụng `reduce` để cộng dồn tiền, `filter` để lọc hàng và `every` để kiểm tra trạng thái "Chọn tất cả".
 *    - `sessionStorage`: Dùng để chuyển giao dữ liệu sang trang Shipping mà không cần gọi API trung gian.
 *    - React LifeCycle: Tự động khởi tạo trạng thái Checkbox ngay khi Component Mount.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mảng `cartItems` từ Redux Store.
 *    - Output: Danh sách các sản phẩm được tích chọn (`selectedOrderItems`) lưu vào Session.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `selectedItems`: Một Object đóng vai trò như một "Bản đồ trạng thái" (Map) lưu xem dòng nào đang được tick chọn.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `toggleSelectAll`: Hàm thông minh giúp bật/tắt toàn bộ Checkbox chỉ với 1 click.
 *    - `updateQuantity`: Đồng bộ số lượng giữa giao diện và Redux Store, có kiểm soát tồn kho.
 *    - `checkoutHandler`: Cổng kiểm soát cuối cùng - Đảm bảo khách phải chọn ít nhất 1 món mới được đi tiếp.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Load danh sách hàng từ Redux -> Hiển thị kèm ảnh và thông tin biến thể.
 *    - Bước 2: Người dùng tick chọn sản phẩm -> UI tính toán lại tiền `subtotal`, `discount`, `shippingCharges`.
 *    - Bước 3: Người dùng bấm "Tiến hành đặt hàng" -> Lưu mảng sản phẩm đã chọn vào Session Storage.
 *    - Bước 4: Chuyển hướng sang trang Đăng nhập (nếu chưa có Session) hoặc trang Shipping.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Giao diện -> Redux Dispatch (Update/Remove) -> Axios -> Backend (Cart Controller) -> MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Free Shipping Logic: Tự động miễn phí vận chuyển nếu khách mua trên 500.000 VNĐ.
 *    - Empty Template: Hiển thị bộ icon và nút "Tiếp tục mua sắm" nếu giỏ hàng trống.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các action `addItemsToCart` (để update số lượng) và `removeItemFromCart` là các thunk bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Hàm `getItemKey` là "linh hồn" để tránh lỗi logic: Mua áo đỏ Size L và áo xanh Size M phải là 2 dòng khác nhau.
 *    - Luôn gọi `sessionStorage.removeItem("directBuyItem")` khi vào checkout để tránh nhầm lẫn giữa luồng Giỏ hàng và luồng Mua Ngay.
 */
import React, { useState, useEffect } from 'react'
import '@/pages/checkout/styles/Cart.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { addItemsToCart, removeItemFromCart, removeMessage, removeErrors, removeOrderedItems } from '@/features/cart/cartSlice'
import { formatVND } from '@/shared/utils/formatCurrency'
import { toast } from 'react-toastify'

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { cartItems, loading, success, message, error } = useSelector((state) => state.cart)
  const [selectedItems, setSelectedItems] = useState({})

  const getItemKey = (item) => `${item.product}-${item.size || ''}-${item.color || ''}`

  // Khởi tạo các item đã chọn 
  useEffect(() => {
    if (cartItems.length > 0) {
      // Chỉ reset nếu selectedItems rỗng hoặc có item mới chưa được track
      // Tuy nhiên để đơn giản, có thể giữ logic cũ hoặc merge
      // Ở đây giữ logic: nếu chưa select gì thì init false
      if (Object.keys(selectedItems).length === 0) {
        const initialSelected = {}
        cartItems.forEach(item => {
          initialSelected[getItemKey(item)] = false
        })
        setSelectedItems(initialSelected)
      }
    }
  }, [cartItems]) // Thêm dependencies để track changes tốt hơn nếu cần

  useEffect(() => {
    if (success && message) {
      toast.success(message, { position: 'top-center', autoClose: 2000, toastId: 'cart-success' })
      dispatch(removeMessage())
    }
  }, [success, message, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-center', autoClose: 3000 })
      dispatch(removeErrors())
    }
  }, [error, dispatch])

  const selectedCartItems = cartItems.filter(item => selectedItems[getItemKey(item)])
  const subtotal = selectedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discount = Math.floor(subtotal * 0.1)
  const shippingCharges = subtotal >= 500000 ? 0 : 30000
  const total = subtotal - discount + shippingCharges


  const toggleSelectAll = (checked) => {
    const newSelected = {}
    cartItems.forEach(item => {
      newSelected[getItemKey(item)] = checked
    })
    setSelectedItems(newSelected)
  }

  const toggleItem = (item) => {
    const key = getItemKey(item)
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allSelected = cartItems.length > 0 && cartItems.every(item => selectedItems[getItemKey(item)])

  const updateQuantity = (productId, change, currentQty, stock, size, color) => {
    const newQty = currentQty + change
    if (newQty < 1) return
    if (newQty > stock) {
      toast.error(`Số lượng không thể vượt quá ${stock}`, { position: 'top-center', autoClose: 2000 })
      return
    }
    dispatch(addItemsToCart({ id: productId, quantity: newQty, isUpdate: true, size, color }))
  }

  const deleteItem = (productId, size, color) => {
    dispatch(removeItemFromCart({ product: productId, size, color }))
    toast.success('Đã xóa sản phẩm', { position: 'top-center', autoClose: 2000 })
  }

  const deleteSelected = () => {
    const itemsToDelete = cartItems.filter(item => selectedItems[getItemKey(item)])

    if (itemsToDelete.length === 0) {
      toast.error('Vui lòng chọn sản phẩm cần xóa', { position: 'top-center', autoClose: 2000 })
      return
    }

    itemsToDelete.forEach(item => {
      dispatch(removeItemFromCart({ product: item.product, size: item.size, color: item.color }))
    })
    toast.success(`Đã xóa ${itemsToDelete.length} sản phẩm`, { position: 'top-center', autoClose: 2000 })
  }

  const checkoutHandler = () => {
    if (selectedCartItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để đặt hàng', { position: 'top-center', autoClose: 2000 })
      return
    }
    sessionStorage.removeItem("directBuyItem"); // Xóa mục mua ngay sau khi thành công
    sessionStorage.setItem("selectedOrderItems", JSON.stringify(selectedCartItems)); // Lưu các sản phẩm đã chọn
    navigate('/login?redirect=/shipping')
  }

  return (
    <>
      <Navbar />
      <PageTitle title="Giỏ Hàng" />

      <div className="cart-page">
        {/* Tiêu đề trang */}
        <header className="cart-page-header">
          <div className="cart-header-container">
            <div className="cart-header-left">
              <button className="back-btn hover-icon-btn" onClick={() => navigate(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="cart-page-title">Giỏ Hàng Của Bạn</h1>
            </div>

          </div>
        </header>

        <div className="cart-container">
          {cartItems.length === 0 ? (
            <div className="empty-cart-container fade-in">
              <div className="empty-cart-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="empty-cart-message">Giỏ hàng của bạn đang trống</h2>
              <p className="empty-cart-submessage">Hãy thêm sản phẩm yêu thích vào giỏ hàng nhé!</p>
              <Link to="/products" className="continue-shopping-btn hover-btn-gradient">Tiếp tục mua sắm</Link>
            </div>
          ) : (
            <div className="cart-grid">

              <div className="cart-left-column">

                <div className="cart-select-header">
                  <div className="select-all-wrapper">
                    <input
                      type="checkbox"
                      id="selectAll"
                      className="cart-checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                    <label htmlFor="selectAll" className="select-all-label">
                      Chọn tất cả ({cartItems.length} sản phẩm)
                    </label>
                  </div>
                  <button className="delete-selected-btn hover-btn-outline" onClick={deleteSelected}>
                    Xóa các sản phẩm đã chọn
                  </button>
                </div>


                <div className="cart-items-list">
                  {Array.isArray(cartItems) && cartItems.map((item, index) => {

                    const mockOriginalPrice = Math.round(item.price * 1.3)
                    const discountPercent = Math.round((1 - item.price / mockOriginalPrice) * 100)

                    return (
                      <div key={getItemKey(item)} className="cart-item" style={{ animationDelay: `${index * 0.05}s` }}>
                        <input
                          type="checkbox"
                          className="cart-checkbox"
                          checked={selectedItems[getItemKey(item)] || false}
                          onChange={() => toggleItem(item)}
                        />

                        <div className="item-image hover-scale-up" onClick={() => navigate(`/product/${item.product}`)}>
                          <img src={item.image} alt={item.name} />
                        </div>

                        <div className="item-info">
                          <h3 className="item-name hover-link-slide" onClick={() => navigate(`/product/${item.product}`)}>
                            {item.name}
                          </h3>

                          <div className="item-variant">
                            <span>Màu: <strong>{item.color || 'Không'}</strong></span>
                            <span className="variant-divider">|</span>
                            <span>Size: <strong>{item.size || 'Không'}</strong></span>
                          </div>

                          <div className="item-price-row">
                            <span className="current-price">{formatVND(item.price)}</span>
                            <span className="original-price">{formatVND(mockOriginalPrice)}</span>
                            <span className="discount-badge">-{discountPercent}%</span>
                          </div>
                        </div>

                        <div className="item-actions">
                          <div className="quantity-control">
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.product, -1, item.quantity, item.stock, item.size, item.color)}
                              disabled={loading || item.quantity <= 1}
                            >−</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.product, 1, item.quantity, item.stock, item.size, item.color)}
                              disabled={loading || item.quantity >= item.stock}
                            >+</button>
                          </div>

                          <button className="delete-btn" onClick={() => deleteItem(item.product, item.size, item.color)} disabled={loading}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="order-summary">
                <h2 className="summary-title">Thông tin đơn hàng</h2>

                <div className="summary-row">
                  <span>Tạm tính ({selectedCartItems.length} sản phẩm)</span>
                  <span className="summary-value">{formatVND(subtotal)}</span>
                </div>

                <div className="summary-row">
                  <span>Giảm giá</span>
                  <span className="summary-value discount">-{formatVND(discount)}</span>
                </div>

                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span className={`summary-value ${shippingCharges === 0 ? 'free' : ''}`}>
                    {shippingCharges === 0 ? 'Miễn phí' : formatVND(shippingCharges)}
                  </span>
                </div>

                {shippingCharges > 0 && (
                  <p className="shipping-note">Miễn phí vận chuyển cho đơn từ 500.000₫</p>
                )}

                <div className="summary-total">
                  <span>Tổng tiền</span>
                  <div className="total-value-wrapper">
                    <span className="total-value">{formatVND(total)}</span>
                    <span className="vat-note">(Đã bao gồm VAT)</span>
                  </div>
                </div>

                <button className="checkout-btn hover-btn-gradient" onClick={checkoutHandler} disabled={selectedCartItems.length === 0 || loading}>
                  TIẾN HÀNH ĐẶT HÀNG
                </button>

                <div className="benefits-list">
                  <div className="benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26aa99" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Giao hàng nhanh 2-3 ngày</span>
                  </div>
                  <div className="benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26aa99" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Đổi trả trong 14 ngày</span>
                  </div>
                  <div className="benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26aa99" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Thanh toán khi nhận hàng</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      // mobile
      {cartItems.length > 0 && (
        <div className="mobile-sticky-checkout">
          <div className="mobile-checkout-content">
            <div className="mobile-checkout-info">
              <span className="mobile-label">Tổng thanh toán</span>
              <span className="mobile-total">{formatVND(total)}</span>
            </div>
            <button className="mobile-checkout-btn" onClick={checkoutHandler} disabled={selectedCartItems.length === 0}>
              ĐẶT HÀNG
            </button>
          </div>
          <p className="mobile-selected-info">{selectedCartItems.length} sản phẩm đã chọn</p>
        </div>
      )}

      <Footer />
    </>
  )
}

export default Cart