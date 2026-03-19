/**
 * ============================================================================
 * COMPONENT: ForgotPassword
 * ============================================================================
 * 1. Component là gì: 
 *    - Màn hình Quên Mật khẩu dành cho người dùng vãng lai (nhập email để server gởi link Đặt lại qua token).
 * 
 * 2. Props: 
 *    - Component Route page cấp độ Root.
 * 
 * 3. State:
 *    - Local State (useState):
 *      + `email` (string): Trạng thái control input email.
 *    - Global State (useSelector): Lấy `user` store chứa error, success message.
 * 
 * 4. Render lại khi nào:
 *    - Gõ email text; Redux trạng thái thay đổi.
 * 
 * 5. Event handling:
 *    - `ForgotPasswordEmail(e)`: Xử lý nút Click submit Email quên mật khẩu `dispatch(forgotPassword)`.
 * 
 * 6. Conditional rendering:
 *    - Conditional Spinner `<Loader />`.
 * 
 * 7. List rendering:
 *    - Không render array.
 * 
 * 8. Controlled input:
 *    - Cột Input Email Form.
 * 
 * 9. Lifting state up:
 *    - Cập nhật Redux store (forgotPassword logic).
 * 
 * 10. Luồng hoạt động:
 *    - (1) User input mail phục vụ reset pass.
 *    - (2) Click Gửi yêu cầu -> `ForgotPasswordEmail` action bắn đi.
 *    - (3) BE check mail nếu đúng gởi mail SMTP chứa Reset Token, trả về Redux Success.
 *    - (4) UI show "Đã gởi email thành công" qua Toast, `useEffect(success)` dọn dẹp biến success rồi điều hướng quay về trang Login.
 * ============================================================================
 */
import React, { useEffect, useState } from 'react'
import '../UserStyles/ForgotPassword.css'
import PageTitle from '../components/PageTitle'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, removeErrors, removeSuccess } from '../features/user/userSlice'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'

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
