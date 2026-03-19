/**
 * ============================================================================
 * COMPONENT: UpdateProfile
 * ============================================================================
 * 1. Component là gì: 
 *    - Màn hình Cập nhật thông tin Hồ sơ người dùng (Name, Email, Ảnh đại diện).
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Local State (useState):
 *      + `name` (string): Tên user nhập vào.
 *      + `email` (string): Email user nhập vào.
 *      + `avatar` (Base64 String): Nội dung file ảnh đại diện upload lên.
 *      + `avatarPreview` (string URL/Base64): Đường dẫn hiển thị preview ảnh đại diện.
 *    - Global State (useSelector): Lấy từ `state.user` (`user`, `error`, `success`, `message`, `loading`).
 * 
 * 4. Render lại khi nào:
 *    - Khi người dùng gõ thay đổi `name`, `email` hoặc upload `avatar`.
 *    - Khi Global State (loading, success) thay đổi để render Loader hoặc Redirect.
 * 
 * 5. Event handling:
 *    - `profileImageUpdate(e)`: Xử lý file input, fetch ra FileReader đổi về chuỗi Base64 gán vào `avatar`.
 *    - `updateSubmit(e)`: Bọc Form Submit vào object `FormData`, gọi action `dispatch(updateProfile)`.
 * 
 * 6. Conditional rendering:
 *    - Render loading skeleton/spinner `<Loader />` hoặc Form UI phụ thuộc vào trạng thái `loading` từ Redux.
 * 
 * 7. List rendering:
 *    - Không mảng dữ liệu.
 * 
 * 8. Controlled input:
 *    - Name, Email được bound chặt qua `value={state}` và `onChange={setState}`.
 * 
 * 9. Lifting state up:
 *    - `updateProfile` Action đẩy FormData lên Redux Global xử lý call network.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component render -> `useEffect` điền thông tin `user` đang đăng nhập (nếu có) vào các `useState` input tương ứng (tự động load Name/Email/Avatar cũ).
 *    - (2) Người dùng sửa fields -> Local state React cập nhật lập tức -> UI Preview thay đổi (đặc biệt Image file input).
 *    - (3) Click Update -> Form Trigger action cập nhật trên BE thông qua Redux `updateProfile`.
 *    - (4) `useEffect` trigger khi `success=true` -> Toast báo mực thành công, clear state, Redirect quay về `/profile`.
 * ============================================================================
 */
import React, { useEffect, useState } from 'react'
import '../UserStyles/UpdateProfile.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeSuccess, updateProfile } from '../features/user/userSlice';
import { removeErrors } from '../features/user/userSlice';
import Loader from '../components/Loader'

function UpdateProfile() {
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
    }, [dispatch, success])

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
                    <main className="update-profile-page">
                        <section className="update-profile-card">
                            <form
                                className="update-profile-form"
                                encType='multipart/form-data'
                                onSubmit={updateSubmit}
                            >
                                <input
                                    id="update-profile-avatar"
                                    type="file"
                                    name="avatar"
                                    accept="image/*"
                                    className="update-profile-file-input"
                                    onChange={profileImageUpdate}
                                />

                                <label htmlFor="update-profile-avatar" className="update-profile-avatar-upload hover-scale-up">
                                    <div className="update-profile-avatar-frame">
                                        <img
                                            src={avatarPreview}
                                            alt="User Profile"
                                            className="update-profile-avatar-image"
                                        />
                                        <div className="update-profile-avatar-overlay">
                                            <svg
                                                className="update-profile-avatar-icon"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span>Change Photo</span>
                                        </div>
                                    </div>
                                </label>

                                <h1 className="update-profile-title">Update Profile</h1>

                                <div className="update-profile-field">
                                    <label htmlFor="update-profile-name">Full Name</label>
                                    <input
                                        id="update-profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        name="name"
                                        placeholder="e.g., Jane Doe"
                                    />
                                </div>

                                <div className="update-profile-field">
                                    <label htmlFor="update-profile-email">Email Address</label>
                                    <input
                                        id="update-profile-email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        name="email"
                                        placeholder="e.g., jane.doe@example.com"
                                    />
                                </div>

                                <button className="update-profile-submit hover-btn-gradient" type="submit">
                                    Update Profile
                                </button>
                            </form>
                        </section>
                    </main>
                    <Footer />
                </>
            )}
        </>
    )
}

export default UpdateProfile
