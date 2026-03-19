/**
 * ============================================================================
 * COMPONENT: ResetPassword
 * ============================================================================
 * 1. Component là gì: 
 *    - Màn hình Nhập Mật khẩu Mới. Đây là điểm đáp (Landing Page) khi người dùng Click vào link ở trong Email khôi phục (qua hệ thống Forgot Password).
 * 
 * 2. Props: 
 *    - Không Parent prop. URL match param `/:token` sẽ được rút qua React Router `useParams`.
 * 
 * 3. State:
 *    - Local State (useState):
 *      + `password` (string): Mật khẩu mới thay thế.
 *      + `confirmPassword` (string): Mật khẩu check lại.
 *    - Global State (useSelector): Lấy từ store `state.user` để check message, loading, error.
 * 
 * 4. Render lại khi nào:
 *    - State field string 2 trường Input đổi giá trị.
 * 
 * 5. Event handling:
 *    - `resetPasswordSubmit(e)`: Kích hoạt HTTP PUT/POST lên API với Body gồm param (Token trên param + data password).
 * 
 * 6. Conditional rendering:
 *    - Header / Form tĩnh.
 * 
 * 7. List rendering:
 *    - Không.
 * 
 * 8. Controlled input:
 *    - Mật khẩu MỚI và Confirm.
 * 
 * 9. Lifting state up:
 *    - Gửi Redux Thunk `resetPassword`.
 * 
 * 10. Luồng hoạt động:
 *    - (1) React Router bắt Query `/password/reset/:token` -> Render Component này. Component nạp `token` param thông qua hook `useParams()`.
 *    - (2) Người dùng nhập Mk mới.
 *    - (3) Submit form `resetPasswordSubmit` -> Gửi package Data (Mk) VÀ `token` qua Redux Dispatch. API lấy Token decode map user id.
 *    - (4) Tương tự, nếu thành công -> Về lại login page. Lỗi do Token hết hạn/sai (báo qua Error Effect).
 * ============================================================================
 */
import React, {  useEffect, useState } from 'react'

import '../UserStyles/Form.css'
import PageTitle from '../components/PageTitle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeErrors, resetPassword } from '../features/user/userSlice';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';
function ResetPassword() {

    const {success, loading, error} = useSelector(state=>state.user)
    const dispatch  = useDispatch()
    const navigate = useNavigate()

    const [password, setPassWord] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")

    const {token} = useParams()
    console.log(useParams());
    

    const resetPasswordSubmit = (e) => {
        e.preventDefault();
        const data={
            password,
            confirmPassword
        }
        
        dispatch(resetPassword({token, userData:data}))
    }

    useEffect(() => {
        if(error) {
            toast.error(error,{position:'top-center',
                autoClose:3000
            })
                dispatch(removeErrors())

        }
    },[dispatch, error])

    useEffect(() => {
        if(success) {
            toast.success("Đặt lại mật khẩu thành công",{position:'top-center',
                autoClose:3000
            })
            navigate('/login')  

        }
    },[dispatch, success, navigate])

    
  return (
    <>
        
   
    <PageTitle title = "Đặt lại mật khẩu"  />
            <div className="container form-container">
            <div className="form-content">
                <form  className="form"
                onSubmit={resetPasswordSubmit}
                >
                    <h2>Đặt lại mật khẩu </h2>
                    <div className="input-group">
                        <input type="password" 
                               name="password"  

                               placeholder='Nhap Mật khẩu mới' 
                               value= {password} 
                               onChange={(e) => setPassWord(e.target.value)}/>
                    </div>
                    <div className="input-group">
                        <input type="password"
                               name="confirmPassword"  
                               placeholder='Xác nhận mật khẩu' 
                               value= {confirmPassword} 
                               onChange={(e) => setConfirmPassword(e.target.value)}/>
                    </div>
                    <button className="authBtn hover-btn-gradient">
                       Đặt lại Mật Khẩu  
                    </button>
                </form>
            </div>
        </div>
        <Footer />
   
    </>
  )
}

export default ResetPassword