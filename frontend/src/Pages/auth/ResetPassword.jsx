/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Đặt lại mật khẩu (Reset Password Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "điểm đáp" (Landing Page) khi người dùng Click vào liên kết khôi phục mật khẩu trong Email.
 *    - Cho phép người dùng thiết lập mật khẩu hoàn toàn mới sau khi đã chứng minh được quyền sở hữu tài khoản qua Token bí mật.
 *    - Đảm bảo quy trình khôi phục mật khẩu diễn ra khép kín và an toàn.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Khôi phục Tài khoản (Account Recovery Flow) - Giai đoạn thực thi (Action phase).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useParams`: Một Hook quan trọng của `react-router-dom` dùng để bóc tách mã xác thực (`token`) trực tiếp từ thanh địa chỉ URL (ví dụ: `/password/reset/xyz123...`).
 *    - Redux Thunk (Action Mapping): Gửi một "gói dữ liệu kép" bao gồm cả mã Token xác thực và Mật khẩu mới lên Server trong cùng một yêu cầu.
 *    - State-driven UI: Sử dụng các biến `success` và `error` từ Global Store để điều khiển việc hiện thông báo và chuyển hướng trang.
 *    - Form Controlled Inputs: Đảm bảo dữ liệu mật khẩu được quản lý và kiểm soát chặt chẽ bởi React State trước khi gửi đi.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mã `token` từ URL và Cặp mật khẩu mới (Mật khẩu + Xác nhận) từ người dùng.
 *    - Output: Yêu cầu ghi đè mật khẩu cũ trong Database và thông báo kết quả.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `token`: Lấy từ `useParams()`, đây là chìa khóa để "mở khóa" quyền đổi mật khẩu.
 *    - `password`, `confirmPassword`: State cục bộ lưu trữ mật khẩu tạm thời trên UI.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `resetPasswordSubmit`: Hàm "vận chuyển" dữ liệu. Nó đóng gói mật khẩu mới kèm theo Token và gửi tới Redux Store để xử lý API.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhấn link từ Email -> Trình duyệt mở trang này kèm Token trên URL.
 *    - Bước 2: `useParams` tự động "nhặt" Token đó ra.
 *    - Bước 3: Người dùng nhập mật khẩu mới và nhấn "Đặt lại mật khẩu".
 *    - Bước 4: Redux gửi yêu cầu PUT kèm Token lên Server.
 *    - Bước 5: Server xác thực Token thành công -> Cập nhật Database -> Trả về Success.
 *    - Bước 6: UI nhận Success -> Hiện thông báo chúc mừng -> Điều hướng về trang Đăng nhập (`/login`).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> PUT Request -> API (resetPassword) -> Backend (Validate Token & Hash New Pass) -> MongoDB -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `type="password"`: Bảo vệ quyền riêng tư cho người dùng tại chỗ.
 *    - Error Monitoring: Nếu Token bị hết hạn hoặc sai lệch, `useEffect` sẽ ngay lập tức bắt được lỗi từ Server và hiển thị Toast cảnh báo.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hành động `dispatch(resetPassword(...))` là trung tâm của các tương tác bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Biến `token` là cực kỳ nhạy cảm. Nếu logic bóc tách Token bị sai, toàn bộ quy trình Reset sẽ thất bại.
 *    - Chú ý cấu trúc `dispatch(resetPassword({token, userData:data}))`: Đây là cách truyền nhiều tham số vào một `createAsyncThunk` của Redux Toolkit.
 */
import React, {  useEffect, useState } from 'react'

import '@/pages/auth/styles/Form.css'
import PageTitle from '@/shared/components/PageTitle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeErrors, resetPassword } from '@/features/user/userSlice';
import { toast } from 'react-toastify';
import Footer from '@/shared/components/Footer';
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