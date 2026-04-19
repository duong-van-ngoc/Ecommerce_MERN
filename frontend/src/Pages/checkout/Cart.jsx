import React, { useState, useEffect } from 'react'
// Note: We are moving to Tailwind for the main layout, but keeping some custom voucher styles if necessary 
// though the user preferred Tailwind for everything.
import '@/pages/checkout/styles/Cart.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { addItemsToCart, removeItemFromCart, removeMessage, removeErrors, removeOrderedItems } from '@/features/cart/cartSlice'
import { fetchActiveVouchers, applyVoucher, resetVoucher, clearVoucherErrors } from '@/features/voucher/voucherSlice'
import { formatVND } from '@/shared/utils/formatCurrency'
import { toast } from 'react-toastify'
import VoucherModal from './components/VoucherModal'

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Logic/State: Giữ nguyên tuyệt đối
  const { cartItems, loading, success, message, error } = useSelector((state) => state.cart)
  const {
    activeVouchers,
    appliedVoucher: serverVoucher,
    loading: vLoading,
    error: vError,
    success: vSuccess
  } = useSelector((state) => state.voucher)

  const [selectedItems, setSelectedItems] = useState({})
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)

  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponSuccess, setCouponSuccess] = useState("")

  const getItemKey = (item) => `${item.product}-${item.size || ''}-${item.color || ''}`

  // Đồng bộ voucher từ server (nếu có)

  useEffect(() => {
    dispatch(fetchActiveVouchers())
  }, [dispatch])

  useEffect(() => {
    if (vSuccess && serverVoucher) {
      setAppliedCoupon({
        name: serverVoucher.voucherCode || "ƯU ĐÃI",
        discount: Number(serverVoucher.discountAmount || serverVoucher.discount || 0),
        desc: serverVoucher.message
      })
      setCouponSuccess("Áp dụng mã thành công!")
      setIsVoucherModalOpen(false) // Tự động đóng modal khi áp dụng thành công
    }
  }, [vSuccess, serverVoucher])

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

  const discount = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0
  const shippingCharges = (subtotal >= 500000 || (appliedCoupon?.name === "FREESHIP")) ? 0 : 30000
  const total = Math.max(0, subtotal - discount + shippingCharges)

  const handleApplyCoupon = (code) => {
    if (subtotal === 0) {
      toast.error("Vui lòng chọn sản phẩm trước khi áp dụng mã", { position: 'top-center' });
      return;
    }

    dispatch(applyVoucher({
      voucherCode: code.toUpperCase(),
      itemPrice: subtotal
    }))
  }

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
    sessionStorage.removeItem("directBuyItem");
    sessionStorage.setItem("selectedOrderItems", JSON.stringify(selectedCartItems));

    // Bảo toàn thông tin voucher đã áp dụng
    if (serverVoucher && vSuccess) {
      sessionStorage.setItem("appliedVoucher", JSON.stringify({
        voucher_id: serverVoucher.voucher_id,
        voucherCode: serverVoucher.voucherCode,
        voucherType: serverVoucher.voucherType,
        voucherValue: serverVoucher.voucherValue,
        discountAmount: serverVoucher.discountAmount
      }));
    } else {
      sessionStorage.removeItem("appliedVoucher");
    }

    navigate('/login?redirect=/shipping')
  }

  const handleRemoveCoupon = () => {
    dispatch(resetVoucher())
    setAppliedCoupon(null)
    setCouponSuccess("")
    toast.info("Đã gỡ mã giảm giá", { position: 'top-center', autoClose: 1500 })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans antialiased text-[#222222]">
      <Navbar />
      <PageTitle title="Giỏ Hàng | ToBi Shop" />

      {/* Content Wrapper - Giới hạn phạm vi sticky của Summary Bar */}
      <div className="flex-grow flex flex-col relative">
        <main className="w-full max-w-[1200px] mx-auto px-4 py-4 md:py-6">
          {cartItems.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-sm py-20 px-4 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 mb-5">
                <img 
                  src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/9bdd8040b334d31946f4.png" 
                  alt="Empty Cart" 
                  className="w-full opacity-80"
                />
              </div>
              <h2 className="text-[14px] text-gray-500 mb-6 font-normal">Giỏ hàng của bạn còn trống</h2>
              <Link 
                to="/products" 
                className="bg-[#ff5a5f] text-white px-10 py-3 rounded-sm hover:opacity-95 transition-all uppercase font-medium text-[14px] shadow-sm active:scale-95"
              >
                Mua ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Table Header - Cột rõ ràng chuẩn Shopee */}
              <div className="hidden md:flex items-center bg-white px-5 py-4 rounded-sm shadow-sm text-[14px] text-[#888888] font-normal">
                {/* ... (Header content unchanged) */}
                <div className="w-[45%] flex items-center gap-5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#ff5a5f] cursor-pointer"
                  />
                  <span className="text-[#000000]">Sản phẩm</span>
                </div>
                <div className="w-[15%] text-center">Đơn giá</div>
                <div className="w-[15%] text-center">Số lượng</div>
                <div className="w-[15%] text-center">Số tiền</div>
                <div className="w-[10%] text-center">Thao tác</div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="flex flex-col gap-3">
                {cartItems.map((item) => {
                  const key = getItemKey(item);
                  const isSelected = selectedItems[key] || false;
                  return (
                    <div key={key} className={`bg-white rounded-sm p-4 md:px-5 md:py-4 shadow-sm border ${isSelected ? 'border-[#ff5a5f]/20 bg-[#fffcfc]' : 'border-transparent'}`}>
                       {/* ... (Item row content unchanged - showing minimal to maintain context) */}
                       <div className="flex items-center gap-4">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleItem(item)} className="w-[18px] h-[18px] accent-[#ff5a5f] cursor-pointer" />
                          <div className="flex-grow flex items-center">
                              <div className="w-[45%] flex gap-3 pr-4" onClick={() => navigate(`/product/${item.product}`)}>
                                 <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-sm border" />
                                 <div className="flex flex-col py-1">
                                    <h3 className="text-[14px] line-clamp-2 hover:text-[#ff5a5f] cursor-pointer">{item.name}</h3>
                                    <span className="text-[12px] text-gray-400">Phân loại: {item.color}, {item.size}</span>
                                 </div>
                              </div>
                              <div className="w-[15%] text-center text-[14px]">{formatVND(item.price)}</div>
                              <div className="w-[15%] flex justify-center">
                                 <div className="flex border border-gray-200 rounded-sm">
                                    <button onClick={() => updateQuantity(item.product, -1, item.quantity, item.stock, item.size, item.color)} className="w-8 h-8 hover:bg-gray-50">-</button>
                                    <span className="w-10 flex items-center justify-center text-[14px]">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product, 1, item.quantity, item.stock, item.size, item.color)} className="w-8 h-8 hover:bg-gray-50">+</button>
                                 </div>
                              </div>
                              <div className="w-[15%] text-center text-[#ff5a5f] text-[15px]">{formatVND(item.price * item.quantity)}</div>
                              <div className="w-[10%] text-center">
                                 <button onClick={() => deleteItem(item.product, item.size, item.color)} className="text-[14px] hover:text-[#ff5a5f]">Xóa</button>
                              </div>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="h-4"></div>
        </main>

        {/* STICKY CHECKOUT BAR */}
        {cartItems.length > 0 && (
          <div className="sticky bottom-4 z-40 w-full max-w-[1200px] mx-auto px-4 mt-auto">
            <div className="bg-white shadow-[0_-5px_25px_rgba(0,0,0,0.06)] border border-gray-200/50 rounded-sm overflow-hidden">
              
              {/* Voucher Trigger Row - OPEN POPUP */}
              <div 
                onClick={() => setIsVoucherModalOpen(true)}
                className="px-5 py-3 border-b border-gray-50 flex items-center justify-between bg-[#fffcfc] cursor-pointer hover:bg-[#fff9f9] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-[#ff5a5f]">
                  <span className="material-symbols-outlined text-[20px] font-variation-fill">confirmation_number</span>
                  <span className="text-[14px] font-normal">ToBi Voucher</span>
                </div>
                
                <div className="flex items-center gap-2 text-[#0055aa] text-[14px]">
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2">
                      <span className="bg-[#ff5a5f] text-white text-[11px] px-1.5 py-0.5 rounded-sm font-medium">
                        {appliedCoupon.name}
                      </span>
                      <span className="text-gray-400">Thay đổi</span>
                    </div>
                  ) : (
                    <span>Chọn hoặc nhập mã</span>
                  )}
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </div>

              {/* Action Area */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer text-[14px] select-none hover:text-[#ff5a5f]">
                    <input type="checkbox" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} className="w-[18px] h-[18px] accent-[#ff5a5f]" />
                    <span className="hidden sm:inline">Chọn tất cả ({cartItems.length})</span>
                    <span className="sm:hidden">Tất cả</span>
                  </label>
                  <button onClick={deleteSelected} className="hidden md:inline-block text-[14px] hover:text-[#ff5a5f]">Xóa</button>
                </div>

                <div className="flex items-center gap-5 md:gap-7">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="text-[14px] md:text-[16px]">Tổng thanh toán ({selectedCartItems.length} sản phẩm):</span>
                      <span className="text-[20px] md:text-[26px] font-medium text-[#ff5a5f] leading-none"> {formatVND(total)} </span>
                    </div>
                    {discount > 0 && <span className="text-[12px] text-[#ff5a5f] mt-1">Tiết kiệm {formatVND(discount)}</span>}
                  </div>
                  <button onClick={checkoutHandler} disabled={selectedCartItems.length === 0 || loading} className="bg-[#ff5a5f] text-white px-10 md:px-14 py-3.5 md:py-4 rounded-sm font-medium uppercase text-[14px] shadow-sm hover:opacity-95 disabled:bg-gray-200 disabled:text-gray-400">
                    Mua hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATION SHELL */}
        {cartItems.length > 0 && (
          <div className="w-full max-w-[1200px] mx-auto px-4 mt-8 mb-12">
            <h3 className="text-[15px] font-medium text-gray-500 uppercase mb-4">Cũng có thể bạn thích</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 opacity-60">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-2 rounded-sm shadow-sm border border-transparent"><div className="aspect-square bg-gray-100 rounded-sm"></div></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VOUCHER SELECTION MODAL */}
      <VoucherModal 
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        activeVouchers={activeVouchers}
        appliedCouponName={appliedCoupon?.name}
        onApply={handleApplyCoupon}
        onRemove={handleRemoveCoupon}
        vLoading={vLoading}
        serverError={vError}
        subtotal={subtotal}
      />

      <Footer />
    </div>
  );
}

export default Cart