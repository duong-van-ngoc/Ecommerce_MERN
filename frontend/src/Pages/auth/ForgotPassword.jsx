/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Quên mật khẩu (Forgot Password Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hỗ trợ người dùng khôi phục quyền truy cập khi họ không nhớ mật khẩu.
 *    - Là điểm khởi đầu của quy trình Reset Password an toàn: Nhập Email -> Nhận Link Reset qua Hộp thư điện tử.
 *    - Đóng vai trò cầu nối giữa giao diện người dùng và dịch vụ gửi Email (SMTP) của Backend.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Khôi phục Tài khoản (Account Recovery Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - State Management (useState): Quản lý giá trị Email duy nhất một cách tập trung.
 *    - UI/UX Aesthetics: Sử dụng các thẻ `div` tạo hiệu ứng quả cầu phát sáng (`forgot-password-orb`) để tạo giao diện hiện đại, cao cấp theo phong cách Glassmorphism.
 *    - Redux Integration: Sử dụng `useSelector` để bắt được thông điệp (`message`) từ Server - đây thường là thông báo dạng: "Vui lòng kiểm tra email của bạn".
 *    - Form Validation: Tận dụng thuộc tính `type="email"` của HTML5 để kiểm tra định dạng email hợp lệ ngay tại trình duyệt.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Địa chỉ Email cần khôi phục mật khẩu.
 *    - Output: Một yêu cầu tạo "Reset Token" gửi đến hệ thống và thông báo xác nhận gửi email thành công.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `email`: State cục bộ kiểm soát ô nhập liệu.
 *    - `loading`, `error`, `success`, `message`: Các biến trạng thái từ Redux Store.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `ForgotPasswordEmail`: Hàm xử lý logic khi nhấn nút Gửi. Nó đóng gói Email vào `FormData` và kích hoạt luồng xử lý của Backend thông qua Redux.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhập Email chính xác đã dùng đăng ký tài khoản.
 *    - Bước 2: Nhấn "Gửi yêu cầu" -> Hệ thống hiện màn hình chờ (Loader).
 *    - Bước 3: Backend kiểm tra Email -> Nếu đúng, tạo Token bí mật -> Gửi Email kèm Link chứa Token đó.
 *    - Bước 4: UI nhận thông báo thành công -> Hiện Toast báo check mail -> Tự động quay về trang Đăng nhập.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> POST Request -> API (forgotPassword) -> Backend (Tìm User & Tạo Token) -> SMTP Server (Gửi Email thực tế) -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `loading ? <Loader /> : Content`: Vì thao tác gửi Email thực tế qua SMTP server thường mất vài giây, việc hiển thị Loader là cực kỳ quan trọng để người dùng không cảm thấy ứng dụng bị "treo".
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Gọi hành động `dispatch(forgotPassword(myForm))` là một tác vụ bất đồng bộ xuyên suốt từ Store đến Server.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `setEmail("")`: Dọn dẹp input sau khi nhấn giúp ngăn chặn hành vi spam hoặc gửi email trùng lặp.
 *    - Biến `message` ở đây rất đặc biệt: Nó chứa thông tin phản hồi từ Server về việc email cụ thể nào đã được gửi đi.
 */
import React, { useEffect, useState } from 'react'
import '@/pages/auth/styles/ForgotPassword.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, removeErrors, removeSuccess } from '@/features/user/userSlice'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import Loader from '@/shared/components/Loader'

function ForgotPassword() {
    const {loading, error, success, message} = useSelector(state => state.user);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [email,setEmail] = useState("")

    const ForgotPasswordEmail = (e) => {
        e.preventDefault();
        const myForm = new FormData()
        myForm.set('email', email)
        dispatch(forgotPassword(myForm))
        setEmail("");
    }

    useEffect(() => {
        if(error) {
            toast.error(error, {position: 'top-center',
                autoClose:3000
            })
            dispatch(removeErrors())
        }
    },[dispatch, error])

    useEffect(() => {
        if(success) {
            toast.success(message,{position: 'top-center', autoClose: 3000})
            dispatch(removeSuccess());
            navigate('/login');
        }

    },[dispatch, success])

  return (
    <>
    {loading?(<Loader />) : (
        <>
            <PageTitle title="Quên mật khẩu" />
            <Navbar />
            <main className="forgot-password-page">
                <div className="forgot-password-background">
                    <div className="forgot-password-orb forgot-password-orb-left" />
                    <div className="forgot-password-orb forgot-password-orb-right" />
                </div>

                <section className="forgot-password-shell">
                    <div className="forgot-password-card">
                        <div className="forgot-password-header">
                            <div className="forgot-password-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5z" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9.75 15.75l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h1>Quên mật khẩu</h1>
                            <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu qua hộp thư điện tử.</p>
                        </div>

                        <form className="forgot-password-form" onSubmit={ForgotPasswordEmail}>
                            <div className="forgot-password-field">
                                <label htmlFor="forgot-password-email">Địa chỉ Email</label>
                                <div className="forgot-password-input-group">
                                    <span className="forgot-password-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M21.75 7.5v9A2.25 2.25 0 0119.5 18.75h-15A2.25 2.25 0 012.25 16.5v-9m19.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5m19.5 0l-8.69 5.527a2.25 2.25 0 01-2.12 0L2.25 7.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <input
                                        id="forgot-password-email"
                                        type="email"
                                        placeholder="name@company.com"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button className="forgot-password-submit hover-btn-gradient" type="submit">
                                <span>Gửi yêu cầu</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.5 6.75L18.75 12l-5.25 5.25" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </form>

                        <div className="forgot-password-footer">
                            <Link to="/login" className="forgot-password-back-link hover-link-slide">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

        </>
    )}
    </>
  )
}

export default ForgotPassword
