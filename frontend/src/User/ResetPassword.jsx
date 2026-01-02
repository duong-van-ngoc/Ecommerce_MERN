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
                    <button className="authBtn">
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