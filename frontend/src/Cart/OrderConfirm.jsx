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
        size: item.size,
        color: item.color,
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
      <PageTitle title="Xác nhận đơn hàng" />
      <Navbar />

      <div className="relative flex min-h-screen flex-col bg-background-light font-display">
        {/* Main Content */}
        <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-12">
          {/* Progress Tracker / Breadcrumbs */}
          <nav className="mb-12 flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/cart')}
              className="font-medium text-slate-500 hover:text-slate-800"
            >
              Giỏ hàng
            </button>
            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
            <span className="font-bold text-slate-900">Xác nhận thanh toán</span>
            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
            <span className="font-medium text-slate-400">Hoàn tất</span>
          </nav>

          <div className="mb-10">
            <h2 className="font-serif text-5xl font-bold italic tracking-tight text-slate-900">Xác nhận đơn hàng</h2>
            <p className="mt-4 text-lg font-light text-slate-500">Kiểm tra thông tin đơn hàng của bạn trước khi chúng tôi bắt đầu đóng gói.</p>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-8">
              {/* Customer Information */}
              <section className="mb-16">
                <h3 className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 font-serif text-2xl font-semibold text-slate-900">
                  <span className="material-symbols-outlined text-[#702e36]">person</span>
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Họ và tên</p>
                    <p className="text-lg font-medium">{user?.name || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Số điện thoại</p>
                    <p className="text-lg font-medium">{shippingInfo?.phoneNumber || shippingInfo?.phoneNo || '—'}</p>
                  </div>
                  <div className="col-span-full space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Địa chỉ nhận hàng</p>
                    <p className="text-lg font-medium leading-relaxed">{fullAddress || '—'}</p>
                  </div>
                </div>
              </section>

              {/* Order Items */}
              <section>
                <h3 className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 font-serif text-2xl font-semibold text-slate-900">
                  <span className="material-symbols-outlined text-[#702e36]">inventory_2</span>
                  Sản phẩm đã đặt
                </h3>
                <div className="space-y-8">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.product || item._id || item.name} className="flex items-center gap-6">
                        <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                          <img
                            alt={item.name}
                            className="h-full w-full object-cover"
                            src={getItemImage(item)}
                          />
                        </div>
                        <div className="flex flex-grow flex-col justify-between py-2">
                          <div>
                            <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900">{item.name}</h4>
                            <p className="mt-1 text-sm text-slate-500 italic">Premium Collection</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <p className="font-bold text-[#702e36] text-lg">{formatVND(item.price)}</p>
                              {(item.size || item.color) && (
                                <div className="flex gap-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  {item.size && <span>Size: <span className="text-slate-900">{item.size}</span></span>}
                                  {item.color && <span>Màu: <span className="text-slate-900">{item.color}</span></span>}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium">Số lượng: <span className="text-lg font-bold">0{item.quantity}</span></p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">Không có sản phẩm trong đơn hàng.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-8">
                {/* Payment Method */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="mb-6 font-serif text-xl font-bold italic text-slate-900">Phương thức thanh toán</h3>
                  <div className="flex items-center gap-4 rounded-lg border-2 border-[#702e36] bg-[#702e36]/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#702e36] text-white">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-slate-500">Thanh toán bằng tiền mặt khi giao hàng</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-[#702e36]">check_circle</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="mb-6 font-serif text-xl font-bold italic text-slate-900">Tóm tắt đơn hàng</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính</span>
                      <span className="font-medium text-slate-900">{formatVND(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Phí vận chuyển</span>
                      <span className={`font-medium ${shippingCharges === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {shippingCharges === 0 ? 'Miễn phí' : formatVND(shippingCharges)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Thuế VAT (10%)</span>
                      <span className="font-medium text-slate-900">{formatVND(tax)}</span>
                    </div>
                    <div className="my-4 border-t border-dashed border-slate-200 pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold uppercase tracking-wide text-slate-900">Tổng cộng</span>
                        <span className="text-3xl font-black text-slate-900">{formatVND(total)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={proceesToPayment}
                    disabled={cartItems.length === 0}
                    className="coral-gradient mt-8 w-full rounded-full py-4 text-center font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác nhận đặt hàng
                  </button>
                  <p className="mt-4 text-center text-[10px] uppercase tracking-tighter text-slate-400">
                    Bằng cách nhấn nút, bạn đồng ý với các điều khoản của Tobi Shop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Success Popup */}
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
  );
}

export default OrderConfirm