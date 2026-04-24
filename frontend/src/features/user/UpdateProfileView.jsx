/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Cập nhật Hồ sơ (Update Profile Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp giao diện cho phép người dùng thay đổi: Họ tên, Email và Ảnh đại diện (Avatar).
 *    - Đảm bảo tính nhất quán dữ liệu: Sau khi cập nhật thành công, thông tin mới sẽ được tự động đồng bộ vào Redux Store và hiển thị trên toàn bộ ứng dụng (như Header, Profile...).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản lý Tài khoản (Account Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Multiple `useEffect`: Sử dụng nhiều Hook `useEffect` tách biệt để xử lý các logic khác nhau: Một cái để kiểm tra lỗi, một cái để xử lý thành công, và một cái để đổ dữ liệu cũ (Pre-fill) vào form ngay khi trang tải xong.
 *    - Controlled Components: Quản lý Form một cách chặt chẽ thông qua React State (`value={name}`, `onChange={...}`).
 *    - `FileReader API`: Cho phép người dùng nhìn thấy ảnh mới của mình ngay khi vừa chọn tệp (Preview) mà không cần chờ dữ liệu gửi lên Server thành công.
 *    - `FormData`: Công cụ mạnh mẽ để gửi dữ liệu form phức tạp, đặc biệt là khi có chứa các chuỗi Base64 ảnh dung lượng lớn.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin chỉnh sửa từ người dùng.
 *    - Output: Yêu cầu cập nhật gửi đến Backend và trạng thái phản hồi (Success/Fail).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Local states (`name`, `email`, `avatar`): Lưu trữ dữ liệu tạm thời người dùng đang gõ trên form.
 *    - Global state (`user`, `loading`, `success`): Lấy từ Redux để kiểm soát trạng thái toàn cục.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `profileImageUpdate`: Xử lý logic chọn file và chuyển đổi sang định dạng Base64.
 *    - `updateSubmit`: "Đóng gói" toàn bộ dữ liệu vào `FormData` và gửi đi.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Mở trang -> Hệ thống tự điền Name/Email/Avatar hiện tại vào các ô nhập.
 *    - Bước 2: Người dùng thay đổi thông tin -> UI cập nhật xem trước (Preview ảnh).
 *    - Bước 3: Nhấn nút Cập nhật -> Gửi yêu cầu qua Redux Thunk.
 *    - Bước 4: Nếu thành công -> Hiện Toast thông báo -> Tự động điều hướng quay lại trang `/profile`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> PUT Request -> API Endpoint -> Backend Middleware (Xác thực) -> Cloudinary (Lưu ảnh mới) -> MongoDB Update -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Loader Screen: Chặn người dùng thao tác thừa trong lúc hệ thống đang đợi phản hồi từ Server.
 *    - Custom File Input: Kỹ thuật ẩn `input type="file"` thô kệch và thay bằng một giao diện chọn ảnh chuyên nghiệp (Avatar và Icon máy ảnh).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - `FileReader.readAsDataURL` và các API call thông qua Redux.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `dispatch(removeSuccess())`: Rất quan trọng, nếu quên lệnh này, biến `success` sẽ mãi là `true`, dẫn đến việc người dùng bị "mắc kẹt" trong luồng redirect mỗi khi quay lại trang.
 *    - `encType='multipart/form-data'`: Đảm bảo form được chuẩn bị đúng cách để xử lý tệp tin.
 */
import React, { useEffect, useState } from 'react'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeSuccess, updateProfile } from '@/features/user/userSlice';
import { removeErrors } from '@/features/user/userSlice';
import Loader from '@/shared/components/Loader'

function UpdateProfileView() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("./images/profile.png");

    const { user, error, success, message, loading } = useSelector(state => state.user)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const profileImageUpdate = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }
        reader.onerror = (error) => {
            toast.error('Lỗi tải file', error);
        }
        reader.readAsDataURL(e.target.files[0])
    }

    const updateSubmit = (e) => {
        e.preventDefault();
        const myForm = new FormData()
        myForm.set("name", name)
        myForm.set("email", email)
        myForm.set("avatar", avatar)
        dispatch(updateProfile(myForm))
    }

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'top-center', autoClose: 3000 })
            dispatch(removeErrors())
        }
    }, [dispatch, error])

    useEffect(() => {
        if (success) {
            toast.success(message, { position: 'top-center', autoClose: 3000 })
            dispatch(removeSuccess())
            navigate("/profile")
        }
    }, [dispatch, success, message, navigate])

    useEffect(() => {
        if (user) {
            setName(user.name)
            setEmail(user.email)
            setAvatarPreview(user.avatar?.url || './images/profile.png')
        }
    }, [user])

    return (
        <>
            {loading ? (<Loader />) : (
                <>
                    <Navbar />
                    <main
                        className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden"
                        style={{
                            minHeight: '100vh',
                            background: '#ffffff',
                            fontFamily: "'Manrope', sans-serif"
                        }}
                    >
                        {/* Abstract Background Decoration */}
                        <div className="absolute top-1/4 -right-20 w-96 h-96 opacity-[0.04] pointer-events-none">
                            <svg viewBox="0 0 400 400" fill="none">
                                <circle cx="200" cy="200" r="180" stroke="#702e36" strokeWidth="1" />
                                <circle cx="200" cy="200" r="140" stroke="#702e36" strokeWidth="0.5" />
                                <circle cx="200" cy="200" r="100" stroke="#702e36" strokeWidth="0.3" />
                            </svg>
                        </div>

                        <div className="w-full max-w-[480px] space-y-8 relative z-10">
                            {/* Avatar Upload Section */}
                            <div className="flex flex-col items-center space-y-4">
                                <input
                                    id="update-profile-avatar"
                                    type="file"
                                    name="avatar"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={profileImageUpdate}
                                />
                                <label
                                    htmlFor="update-profile-avatar"
                                    className="relative cursor-pointer group"
                                >
                                    <div
                                        className="w-28 h-28 rounded-full overflow-hidden transition-all duration-300"
                                        style={{
                                            border: '3px solid #e5e7eb',
                                            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#702e36'
                                            e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(112, 46, 54, 0.3)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb'
                                            e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <img
                                            src={avatarPreview}
                                            alt="Hồ sơ người dùng"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Camera overlay */}
                                    <div
                                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #702e36 0%, #8b3a42 100%)',
                                            boxShadow: '0 2px 8px rgba(112, 46, 54, 0.3)',
                                            border: '2px solid #ffffff'
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>
                                            photo_camera
                                        </span>
                                    </div>
                                </label>
                                <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>
                                    Nhấn vào ảnh để thay đổi
                                </p>
                            </div>

                            {/* Header */}
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1a1a1a' }}>
                                    Cập nhật hồ sơ
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                                    Chỉnh sửa thông tin cá nhân của bạn
                                </p>
                            </div>

                            {/* Main Card */}
                            <div
                                className="rounded-xl p-8"
                                style={{
                                    background: '#fafafa',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 20px 60px -15px rgba(0,0,0,0.08)'
                                }}
                            >
                                <form
                                    className="space-y-6"
                                    encType='multipart/form-data'
                                    onSubmit={updateSubmit}
                                >
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold tracking-wider uppercase ml-1"
                                            style={{ color: '#6b7280' }}
                                        >
                                            Họ và tên
                                        </label>
                                        <div
                                            className="relative flex items-center rounded-xl group transition-all"
                                            style={{
                                                background: '#ffffff',
                                                border: '1.5px solid #e5e7eb',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(112, 46, 54, 0.5)'
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(112, 46, 54, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined absolute left-4 transition-colors"
                                                style={{ color: '#9ca3af' }}
                                            >person</span>
                                            <input
                                                id="update-profile-name"
                                                className="w-full bg-transparent border-none py-4 pl-12 pr-4 focus:ring-0 font-medium"
                                                style={{ color: '#1a1a1a', outline: 'none' }}
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                name="name"
                                                placeholder="VD: Nguyễn Văn A"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-bold tracking-wider uppercase ml-1"
                                            style={{ color: '#6b7280' }}
                                        >
                                            Địa chỉ Email
                                        </label>
                                        <div
                                            className="relative flex items-center rounded-xl group transition-all"
                                            style={{
                                                background: '#ffffff',
                                                border: '1.5px solid #e5e7eb',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(112, 46, 54, 0.5)'
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(112, 46, 54, 0.1)'
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb'
                                                e.currentTarget.style.boxShadow = 'none'
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined absolute left-4 transition-colors"
                                                style={{ color: '#9ca3af' }}
                                            >mail</span>
                                            <input
                                                id="update-profile-email"
                                                className="w-full bg-transparent border-none py-4 pl-12 pr-4 focus:ring-0 font-medium"
                                                style={{ color: '#1a1a1a', outline: 'none' }}
                                                type="text"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                name="email"
                                                placeholder="VD: nguyenvana@gmail.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full text-white font-bold py-4 rounded-xl transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #702e36 0%, #8b3a42 100%)',
                                            boxShadow: '0 8px 24px -4px rgba(112, 46, 54, 0.35)',
                                            letterSpacing: '0.05em'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.02)'
                                            e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(112, 46, 54, 0.45)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)'
                                            e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(112, 46, 54, 0.35)'
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    >
                                        Cập nhật hồ sơ
                                    </button>
                                </form>
                            </div>

                            {/* Cancel Link */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="text-xs font-bold uppercase tracking-widest transition-colors"
                                    style={{ color: '#9ca3af' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </>
            )}
        </>
    )
}

export default UpdateProfileView
