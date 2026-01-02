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
                    <button className="authBtn">
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