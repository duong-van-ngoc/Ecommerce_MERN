import React, { use, useEffect, useState } from 'react'
import '../UserStyles/Form.css'
import { Link, Navigate } from 'react-router-dom'
import { useSelector, useDispatch} from 'react-redux'
import { login, removeSuccess } from '../features/user/userSlice'
import { toast } from 'react-toastify'
import { removeErrors } from '../features/user/userSlice'
import { useNavigate } from 'react-router-dom'

function Login() {

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const {error, loading, isAuthenticated,success} = useSelector(state=> state.user)
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const loginSubmit = (e) => {
        e.preventDefault();
        console.log('hello');

        dispatch(login({
            email: loginEmail,
            password: loginPassword
        }))
    }

    useEffect(() => {
        if(error) {
            toast.error(error, {position:'top-center',autoClose:3000})

            dispatch(removeErrors())
        }
    },[dispatch, error])

    useEffect(() => {
        if(isAuthenticated) {
            navigate("/")
        }
    },[isAuthenticated])

    useEffect(() => {
        if(success) {
            toast.success("Đăng nhập thành công", {position: 'top-center' , autoClose:3000});
            dispatch(removeSuccess())
        }
    },[dispatch, success])
  return (
    <div className="form-container container">
        <div className="form-content">
            <form action="" className="form" onSubmit={loginSubmit}>
                <div className="input-group">
                    <input type="email" 
                           placeholder='Email' 
                           value={loginEmail} 
                           onChange={(e) => {setLoginEmail(e.target.value)}} />
                </div>
                <div className="input-group">
                    <input type="password"
                           placeholder='Password' 
                           value={loginPassword} 
                           onChange={(e) => {setLoginPassword(e.target.value)}} />
                </div>
                <button className="authBtn">Đăng Nhập</button>
                <p className="form-links">Quên mật khẩu <Link to ="/password/forgot">
                 Đặt lại mật khẩu </Link></p>
                 <p className="form-links">Ban chưa có tài khoản? <Link to ="/register">
                 Đăng ký </Link></p>
            </form>
        </div>
    </div>
  )
}

export default Login