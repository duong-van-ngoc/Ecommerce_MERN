/**
 * ============================================================================
 * COMPONENT: VnpayResult.jsx
 * ============================================================================
 * 1. Vai trò: 
 *    - Hiển thị kết quả thanh toán sau khi người dùng được VNPay redirect về website.
 *    - Xử lý dọn dẹp các sản phẩm đã đặt khỏi giỏ hàng nếu thanh toán thành công.
 * 
 * 2. Thư viện sử dụng:
 *    - `react-router-dom`: Dùng `useSearchParams` để lấy tham số từ URL và `useNavigate` để điều hướng.
 *    - `react-redux`: Dùng `useDispatch` để gọi action Redux.
 * 
 * 3. Kiến thức & Khái niệm:
 *    - Query Parameters: Các thông số VNPay gửi về qua URL (vnp_ResponseCode, vnp_TxnRef...).
 *    - Side Effect (useEffect): Dùng để thực hiện hành động xóa sản phẩm ngay khi component mount và xác định thành công.
 *    - Redux Action (removeOrderedItems): Chỉ xóa những sản phẩm đã được đặt hàng thành công, giữ lại các sản phẩm khác trong giỏ.
 * 
 * 4. Luồng hoạt động:
 *    - (1) Component lấy `vnp_ResponseCode` từ URL.
 *    - (2) Nếu mã là `00` (Thành công) -> Lấy danh sách sản phẩm từ `sessionStorage`.
 *    - (3) Gọi dispatch `removeOrderedItems(items)` để dọn dẹp giỏ hàng một cách có chọn lọc.
 *    - (4) Hiển thị giao diện Chúc mừng hoặc Thông báo lỗi tương ứng.
 * ============================================================================
 */
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../features/cart/cartSlice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../CartStyles/PaymentSuccess.css';

const VnpayResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const orderId = searchParams.get('orderId');
    const responseCode = searchParams.get('vnp_ResponseCode');
    const isSuccess = responseCode === '00';

    const getVnpayMessage = (code) => {
        const messages = {
            '00': 'Thanh toán thành công. Cảm ơn quý khách!',
            '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ (Phân loại vào danh sách chờ xác nhận).',
            '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
            '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.',
            '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
            '24': 'Bạn đã hủy quá trình thanh toán.',
            '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.',
            '97': 'Chữ ký không hợp lệ (Signature invalid).',
        };
        return messages[code] || 'Giao dịch không thành công. Đã có lỗi xảy ra.';
    };

    const { userId, cartItems } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        // Chỉ thực hiện xóa khi:
        // 1. Thanh toán thành công (isSuccess)
        // 2. User đã được load (isAuthenticated)
        // 3. UserId trong cart đã được đồng bộ (userId !== null) - trừ khi là guest
        if (isSuccess && isAuthenticated && userId !== null) {
            // Sau khi thanh toán thành công, gọi Backend để lấy lại giỏ hàng đã được dọn dẹp
            // (Backend đã xử lý $pull các sản phẩm đã thanh toán trong paymentController)
            dispatch(fetchCart());
            
            // Dọn dẹp các session tạm
            sessionStorage.removeItem('vnpayOrderedItems');
            sessionStorage.removeItem("directBuyItem");
            sessionStorage.removeItem("selectedOrderItems");
        }
    }, [isSuccess, isAuthenticated, userId, dispatch]);

    return (
        <>
            <Navbar />
            <div className="payment-success-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
                    {isSuccess ? (
                        <>
                            <div style={{ fontSize: '60px', color: '#2ecc71', marginBottom: '20px' }}>✅</div>
                            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Thanh toán thành công!</h2>
                            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                                {getVnpayMessage(responseCode)} <br/>
                                Đơn hàng <strong>#{orderId}</strong> của bạn đang được xử lý.
                            </p>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '60px', color: '#e74c3c', marginBottom: '20px' }}>❌</div>
                            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Thanh toán chưa hoàn tất</h2>
                            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                                {getVnpayMessage(responseCode)}
                            </p>
                        </>
                    )}
                    
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button 
                            onClick={() => navigate('/orders/user')}
                            style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#3498db', color: '#fff', cursor: 'pointer' }}
                        >
                            Xem đơn hàng
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #3498db', background: 'transparent', color: '#3498db', cursor: 'pointer' }}
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VnpayResult;
