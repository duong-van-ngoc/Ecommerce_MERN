/**
 * ============================================================================
 * COMPONENT: OrderDetails
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `OrderDetails` trong ứng dụng.
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
 *    - Có tương tác sự kiện (onClick, onChange, onSubmit...).
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Sử dụng `.map()` để render danh sách elements.
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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails } from '../features/orders/orderSlice';
import '../OrderStyles/OrderDetails.css'; 
import formatVND from '../utils/formatCurrency.js';
import html2pdf from 'html2pdf.js';

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, error, orderDetails } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div className="text-center mt-10">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Lỗi: {error}</div>;
  }

  if (!orderDetails || Object.keys(orderDetails).length === 0) {
    return <div className="text-center mt-10">Không tìm thấy đơn hàng</div>;
  }

  const formattedDate = new Date(orderDetails.createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const exportToPDF = () => {
    const element = document.querySelector('main.container');
    const opt = {
      margin:       [10, 10],
      filename:     `Hoa_Don_${orderDetails._id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Ẩn các phần no-print
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');

    html2pdf().set(opt).from(element).save().then(() => {
      // Hiện lại sau khi xuất xong
      noPrintElements.forEach(el => el.style.display = '');
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* NavigationHeader */}
      <nav className="no-print mb-6 flex items-center justify-between">
        <Link className="flex items-center text-sm font-medium text-blue-600 hover-link-slide transition-colors" to={user?.role === 'admin' ? '/admin/orders' : '/orders/user'}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Quay lại danh sách đơn hàng
        </Link>
        {user && user.role === 'admin' && (
          <button className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover-btn-gradient transition-all shadow-sm" onClick={exportToPDF}>
            <span className="material-symbols-outlined mr-2">picture_as_pdf</span>
            Xuất PDF (Hóa đơn)
          </button>
        )}
      </nav>

      {/* OrderStatusCard */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm" data-purpose="order-status-banner">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Đơn hàng #{orderDetails._id}</h1>
            <p className="text-slate-500 text-sm mt-1">Ngày đặt: {formattedDate}</p>
          </div>
          <div className="flex items-center">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              orderDetails.orderStatus === 'Đã giao' ? 'bg-green-100 text-green-700' :
              orderDetails.orderStatus === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
              orderDetails.orderStatus === 'Đã hủy' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <span className={`w-2 h-2 mr-2 rounded-full ${
                orderDetails.orderStatus === 'Đã giao' ? 'bg-green-500' :
                orderDetails.orderStatus === 'Đang giao' ? 'bg-blue-500' :
                orderDetails.orderStatus === 'Đã hủy' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}></span>
              {orderDetails.orderStatus}
            </span>
          </div>
        </div>
      </section>

      {/* InfoGrid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Customer Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-purpose="customer-info">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Thông tin khách hàng</h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Họ và tên:</span>
              <span className="text-sm font-semibold text-slate-800">{orderDetails.user?.name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Số điện thoại:</span>
              <span className="text-sm font-semibold text-slate-800">{orderDetails.shippingInfo?.phoneNo || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Email:</span>
              <span className="text-sm font-semibold text-slate-800">{orderDetails.user?.email || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 text-sm font-medium">Địa chỉ:</span>
              <span className="text-sm font-semibold text-slate-800">
                {`${orderDetails.shippingInfo?.address}, ${orderDetails.shippingInfo?.ward}, ${orderDetails.shippingInfo?.district}, ${orderDetails.shippingInfo?.province}`}
              </span>
            </div>
          </div>
        </section>

        {/* Logistics Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-purpose="logistics-info">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Phương thức &amp; Thanh toán</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hình thức thanh toán</h3>
              <div className="flex items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
                <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {orderDetails.paymentInfo && orderDetails.paymentInfo.method === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Thẻ Tín Dụng / Ghi Nợ"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Trạng thái: {orderDetails.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Đơn vị vận chuyển</h3>
              <div className="flex items-center p-3 border border-slate-100 rounded-lg bg-slate-50">
                <svg className="h-6 w-6 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Giao hàng tiêu chuẩn</p>
                  <p className="text-xs text-slate-500">
                    Phí vận chuyển: {orderDetails.shippingPrice ? formatVND(orderDetails.shippingPrice) : 'Miễn phí'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* OrderItemsTable */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8" data-purpose="items-list">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold">Danh sách sản phẩm</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Đơn giá</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Số lượng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderDetails.orderItems?.map((item) => (
                <tr key={item.product}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                        <img alt={item.name} className="h-full w-full object-cover object-center" src={item.image} />
                      </div>
                      <div className="ml-4">
                        <Link to={`/product/${item.product}`} className="text-sm font-bold text-slate-800 hover-link-slide transition-colors">
                            {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 mt-1 text-xs text-slate-500 uppercase tracking-tight">
                            {item.size && <span>Size: <span className="font-semibold text-slate-700">{item.size}</span></span>}
                            {item.color && <span>Màu: <span className="font-semibold text-slate-700">{item.color}</span></span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                    {formatVND(item.price)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                    {formatVND(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* OrderSummary */}
      <section className="flex justify-end" data-purpose="order-totals">
        <div className="w-full md:w-80 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Tổng cộng</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium text-slate-800">{formatVND(orderDetails.itemPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Phí vận chuyển</span>
              <span className="font-medium text-slate-800">{formatVND(orderDetails.shippingPrice)}</span>
            </div>
            {orderDetails.taxPrice !== undefined && orderDetails.taxPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Thuế (Tax)</span>
                <span className="font-medium text-slate-800">{formatVND(orderDetails.taxPrice)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Tổng tiền</span>
              <span className="text-xl font-extrabold text-blue-600">
                {formatVND(orderDetails.totalPrice)}
              </span>
            </div>
          </div>
          {/* Action Button */}
          {user && user.role === 'admin' && (
            <button className="no-print mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover-btn-gradient transition-colors shadow-md flex items-center justify-center" onClick={exportToPDF}>
              <span className="material-symbols-outlined mr-2">picture_as_pdf</span>
              Xuất PDF (Biên nhận)
            </button>
          )}
        </div>
      </section>

      
    </main>
  );
};

export default OrderDetails;
