/**
 * ============================================================================
 * COMPONENT: UpdatePassword
 * ============================================================================
 * 1. Component là gì: 
 *    - Màn hình Đổi mật khẩu cho người dùng ĐÃ đăng nhập (Bắt buộc cung cấp mk cũ, mk mới).
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props.
 * 
 * 3. State:
 *    - Local State (useState):
 *      + `oldPassword` (string): Mật khẩu hiện tại (verify).
 *      + `newPassword` (string): Mật khẩu mong muốn.
 *      + `confirmPassword` (string): Nhập lại Mật khẩu mong muốn.
 *    - Global State (useSelector): Pull state `user` (`error`, `loading`, `success`).
 * 
 * 4. Render lại khi nào:
 *    - Local State 3 trường mật khẩu thay đổi.
 *    - Trạng thái Request (Redux `loading`) cập nhật đẩy thành Spinner UI.
 * 
 * 5. Event handling:
 *    - `updatePasswordSubmit(e)`: Gói 3 mật khẩu vào Data/FormData và call API đổi pass.
 * 
 * 6. Conditional rendering:
 *    - `loading ? <Loader /> : Component Content`.
 * 
 * 7. List rendering:
 *    - Không sử dụng array map.
 * 
 * 8. Controlled input:
 *    - Form input mật khẩu map chặc vào local state hook để validate (thông qua React).
 * 
 * 9. Lifting state up:
 *    - Call action `updatePassword` update State store phía Redux.
 * 
 * 10. Luồng hoạt động:
 *    - (1) User nhập 3 trường mật khẩu.
 *    - (2) Nhấn Submit -> `updatePasswordSubmit` tạo FormData (BE đang require FormData, hoặc body raw) -> bắn tới store `updatePassword(myForm)`.
 *    - (3) API response Error/Success -> `useEffect` đón lấy trả Message Toast. -> Chuyển về Home Profile nếu thành công.
 * ============================================================================
 */
import React, { useEffect, useState } from 'react'
import '../UserStyles/Form.css'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import PageTitle from '../components/PageTitle'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeErrors, removeSuccess, updatePassword } from '../features/user/userSlice'
import { toast } from 'react-toastify'
import Loader from '../components/Loader'
function UpdatePassword() {
    const {success , error, loading} = useSelector(state => state.user)
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const [oldPassword, setOldPassWord] = useState("")
    const [newPassword, setNewPassWord] = useState("")
    const [confirmPassword, setConfirmPassword] =useState("")


    const updatePasswordSubmit = (e) => {
        e.preventDefault();
        const myForm = new FormData();
        myForm.set("oldPassword" ,oldPassword )
        myForm.set("newPassword",newPassword)
        myForm.set("confirmPassword",confirmPassword)
         for(let pair of myForm.entries() ) {
            console.log(pair[0]+ ':' + pair[1]);
            
        }
        dispatch(updatePassword(myForm))
    }

    useEffect(() => {
        if(error)  {
            toast.error(error, { position: 'top-center', autoClose:3000})
            dispatch(removeErrors())
        }
    },[dispatch, error])


    useEffect(() => {
        if(success) {
            toast.success("Cập nhật mật khẩu thành công"), {position:'top-center', autoClose: 3000}
            dispatch(removeSuccess())
            navigate("/profile")
        }
    },[dispatch, success,navigate])


  return (
    <>
        {loading ? (<Loader />):(
                <>
    <Navbar />
    <PageTitle title = "Cập nhật mật khẩu"  />
            <div className="container update-container">
            <div className="form-content">
                <form  className="form" encType='multipart/form-data'
                onSubmit={updatePasswordSubmit}
                >
                    <h2>Cập nhật mật khẩu </h2>
                    
                    <div className="input-group">
                        <input type="password" 
                               name = "oldPassword" 
                               placeholder='Old Passwod' 
                               value= {oldPassword} 
                               onChange={(e) => setOldPassWord(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <input type="password" 
                               name="newPassword"  
                               placeholder='New Passwod' 
                               value= {newPassword} 
                               onChange={(e) => setNewPassWord(e.target.value)}/>
                    </div>
                    <div className="input-group">
                        <input type="password"
                               name="confirmPassword"  
                               placeholder='Confirm Passwod' 
                               value= {confirmPassword} 
                               onChange={(e) => setConfirmPassword(e.target.value)}/>
                    </div>
                    <button className="authBtn hover-btn-gradient">
                        Cập Nhật Mật Khẩu  
                    </button>
                </form>
            </div>
        </div>
        <Footer />
    </>
        )} 
    </>
  )
}

export default UpdatePassword