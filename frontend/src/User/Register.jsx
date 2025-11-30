import React, { useState , useEffect} from 'react'
import '../UserStyles/Form.css'
import {Link, useNavigate} from "react-router-dom"
import { toast } from 'react-toastify'

import {useSelector, useDispatch} from 'react-redux'
import { register, removeSuccess } from '../features/user/userSlice'
import { removeErrors } from '../features/user/userSlice'
function Register() {

    const [user, setUser] = useState({
        name:'',
        email:'',
        password:''
    })
    const [avatar, setAvatar] = useState("")
   
    const [avatarPreview, setAvatarPreview] = useState('./images/profile.png')
     const {name, email, password} = user
    const {success, loading, error} = useSelector(state => state.user)
    const dispatch = useDispatch() 
    const navigate = useNavigate()

    const registerDataChange= (e) => {
        if(e.target.name === 'avatar') {
           const reader=  new FileReader()
           reader.onload = () => {
            if(reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
           }
           reader.readAsDataURL(e.target.files[0])
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
        myForm.set('avatar', avatar);
        console.log(myForm.entries());
        for(let pair of myForm.entries() ) {
            console.log(pair[0]+ ':' + pair[1]);
            
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
    <div className="form-container container">
        <div className="form-content">
            <form action="" className="form" onSubmit={registerSubmit} encType='multipart/form-data'>
                <h2>Đăng kí</h2>
                {/* name  */}
                <div className="input-group">
                    <input 
                    type="text" 
                    name="name" 
                    placeholder='Username' 
                    value={name}
                    onChange={registerDataChange}
                    />
                </div>
                {/* email  */}
                <div className="input-group">
                    <input 
                    type="email" 
                    name="email" 
                    placeholder='Email' 
                    value={email}
                    onChange={registerDataChange}
                    
                    />
                </div>
                {/* pasword  */}
                <div className="input-group">
                    <input 
                    type="password" 
                    name="password" 
                    placeholder='Password' 
                    value={password} 
                    onChange={registerDataChange}

                    />
                </div>
                {/* avatar  */}
                <div className="input-group avatar-group">
                    <input 
                    type="file" 
                    name="avatar" 
                    placeholder='Avatar' 
                    className='file-input'
                    accept='image/*'
                    onChange={registerDataChange}

                    />
                    <img src={avatarPreview} 
                         alt="Avatar Preview " 
                         className='avatar' />
                    
                </div>
                <button className="authBtn">Đăng Kí</button>
                    <p className="form-links">
                        Bạn đã có tài khoản? <Link to="/login"> Đăng nhập</Link>
                    </p>
            </form>
        </div>
    </div>
  )
}

export default Register