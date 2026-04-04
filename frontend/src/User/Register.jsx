/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Đăng ký (Register Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cho phép người dùng mới tạo tài khoản tham gia hệ thống.
 *    - Xử lý nghiệp vụ phức tạp: Kết hợp nhập liệu văn bản và Tải lên hình ảnh (Avatar).
 *    - Tạo ra trải nghiệm người dùng mượt mà thông qua việc xem trước (Preview) ảnh đại diện ngay lập tức.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xác thực (Authentication Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `FileReader API`: Một API cực hay của trình duyệt dùng để đọc file từ máy tính người dùng mà không cần upload lên server ngay.
 *    - Base64 Encoding: Kỹ thuật chuyển đổi hình ảnh thành một chuỗi ký tự dài để dễ dàng đính kèm vào mảng JSON gửi lên Backend.
 *    - `FormData`: Đối tượng chuẩn để gói dữ liệu form, đặc biệt hữu ích khi làm việc với các tệp tin (Files).
 *    - Local State Management: Quản lý trạng thái lồng nhau (Object `user`) và các trạng thái ảnh riêng biệt.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin cá nhân và tệp tin hình ảnh từ người dùng.
 *    - Output: Một tài khoản mới được ghi danh vào Database và điều hướng về trang đăng nhập.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `user` (object): Lưu trữ đồng thời name, email, password để tối ưu code (thay vì dùng 3 state rời rạc).
 *    - `avatarPreview`: Chuỗi Base64 dùng để hiển thị ảnh lên khung tròn "Avatar Shell".
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `registerDataChange`: Hàm điều phối thông minh - vừa xử lý gõ phím, vừa xử lý chọn file ảnh.
 *    - `registerSubmit`: Hàm validation và đóng gói dữ liệu cuối cùng trước khi chuyển cho Redux xử lý.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng chọn ảnh -> JavaScript dùng `FileReader` đọc file -> Hiển thị ảnh xem trước.
 *    - Bước 2: Người dùng điền thông tin -> State `user` cập nhật liên tục.
 *    - Bước 3: Nhấn Đăng ký -> Kiểm tra trống dữ liệu -> `dispatch` hành động register.
 *    - Bước 4: Chờ Backend phản hồi -> Hiện thông báo thành công -> Chuyển sang `/login`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> FormData (Name, Email, Pass, Base64 Image) -> API Post -> Backend (xử lý Cloudinary để lưu ảnh) -> MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Kiểm tra `!name || !email || !password`: Chặn ngay tại Client nếu khách hàng "quên" điền thông tin trước khi phiền đến Server.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Đọc file (`reader.onload`) và gửi yêu cầu đăng ký API là các tác vụ bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `accept="image/*"` ở thẻ input giúp giới hạn người dùng chỉ chọn được ảnh, tránh chọn nhầm file thực thi nguy hiểm.
 *    - `DEFAULT_AVATAR_PREVIEW`: Luôn có một ảnh mặc định để giao diện không bị "vỡ" khi người dùng chưa chọn ảnh.
 */
import React, { useState , useEffect} from 'react'
import '../UserStyles/Register.css'
import {Link, useNavigate} from "react-router-dom"
import { toast } from 'react-toastify'

import {useSelector, useDispatch} from 'react-redux'
import { register, removeSuccess } from '../features/user/userSlice'
import { removeErrors } from '../features/user/userSlice'

const DEFAULT_AVATAR_PREVIEW = '/images/profile.png'

function Register() {

    const [user, setUser] = useState({
        name:'',
        email:'',
        password:''
    })
    const [avatar, setAvatar] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR_PREVIEW)
     const {name, email, password} = user
    const {success, loading, error} = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const registerDataChange= (e) => {
        if(e.target.name === 'avatar') {
           const file = e.target.files?.[0]
           if(!file) {
                setAvatar("")
                setAvatarPreview(DEFAULT_AVATAR_PREVIEW)
                return
           }
           const reader=  new FileReader()
           reader.onload = () => {
            if(reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
           }
           reader.readAsDataURL(file)
        }else{
            setUser({...user,[e.target.name]:e.target.value})
        }
    }
    const registerSubmit = (e) => {
        e.preventDefault();
        if(!name || !email || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin',
                {position:'top-center', autoClose:3000}
            )
            return;
        }
        const myForm = new FormData();
        myForm.set('name', name);
        myForm.set('email', email);
        myForm.set('password', password);
        if(avatar) {
            myForm.set('avatar', avatar);
        }
        dispatch(register(myForm))

    }
    useEffect(() => {
              if(error) {
                toast.error(error, {position: 'top-center' , autoClose:3000});
                dispatch(removeErrors())

              }
            }, [dispatch, error])

    useEffect(() => {
              if(success) {
                toast.success("Đăng ký thành công", {position: 'top-center' , autoClose:3000});
                dispatch(removeSuccess())
                navigate('/login')
              }
            }, [dispatch, success])

  return (
    <main className="register-page">
        <section className="register-card">
            <div className="register-card-body">
                <div className="register-header">
                    <h1>Tạo tài khoản</h1>
                    <p>Tham gia cộng đồng của chúng tôi ngay hôm nay</p>
                </div>

                <form className="register-form" onSubmit={registerSubmit} encType='multipart/form-data'>
                    <div className="register-avatar-block">
                        <input
                            id="register-avatar"
                            type="file"
                            name="avatar"
                            className="register-file-input"
                            accept="image/*"
                            onChange={registerDataChange}
                        />

                        <label htmlFor="register-avatar" className="register-avatar-picker hover-scale-up">
                            <div className="register-avatar-shell">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="register-avatar-image"
                                />
                                <div className="register-avatar-hover">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18A2.25 2.25 0 004.5 20.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.72 47.72 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.19 2.19 0 00-1.736-1.039 48.56 48.56 0 00-5.232 0 2.19 2.19 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="register-avatar-badge" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>
                        </label>

                        <div className="register-avatar-copy">
                            <p>Tải ảnh đại diện</p>
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-name">Tên người dùng</label>
                        <div className="register-input-wrap">
                            <span className="register-input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                placeholder="Nhập tên người dùng"
                                value={name}
                                onChange={registerDataChange}
                            />
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-email">Email</label>
                        <div className="register-input-wrap">
                            <span className="register-input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M21.75 7.5v9A2.25 2.25 0 0119.5 18.75h-15A2.25 2.25 0 012.25 16.5v-9m19.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5m19.5 0l-8.69 5.527a2.25 2.25 0 01-2.12 0L2.25 7.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={registerDataChange}
                            />
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-password">Mật khẩu</label>
                        <div className="register-input-wrap">
                            <span className="register-input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={registerDataChange}
                            />
                            {/* <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'An mat khau' : 'Hien mat khau'}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10.585 10.587a2 2 0 102.828 2.828" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.878 5.09A9.77 9.77 0 0112 4.875c6.75 0 9.75 7.125 9.75 7.125a15.708 15.708 0 01-4.054 5.138M6.61 6.61C4.123 8.312 2.25 12 2.25 12S5.25 19.125 12 19.125a9.84 9.84 0 004.056-.86" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12z" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button> */}
                        </div>
                    </div>

                    <button className="register-submit-btn hover-btn-gradient">
                        {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                    </button>

                    <p className="register-login-link">
                        Đã có tài khoản?
                        <Link to="/login" className="hover-link-slide">Đăng nhập</Link>
                    </p>
                </form>
            </div>
        </section>
    </main>
  )
}

export default Register
