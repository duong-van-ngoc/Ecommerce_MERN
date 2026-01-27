import React, { useEffect, useState } from 'react'
import '../CartStyles/Shipping.css'
import PageTitle from '../Components/PageTitle'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import CheckoutPath from './CheckoutPath'
import { useDispatch, useSelector } from 'react-redux'
import {Country, State, City} from 'country-state-city'
import {toast} from  'react-toastify'
import { saveShippingInfo } from '../features/cart/cartSlice'
import { useNavigate } from 'react-router-dom'


function Shipping() {

    const {shippingInfo} = useSelector(state => state.cart)
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [address, setAddress] = useState(shippingInfo.address || "")
    const [pinCode, setPinCode] = useState(shippingInfo.pinCode || "")
    const [phoneNumber, setPhoneNumber] = useState(shippingInfo.phoneNumber || "")
    const [country, setCountry] = useState(shippingInfo.country || "")
    const [province, setState] = useState(shippingInfo.province || "")
    const [city, setCity] = useState(shippingInfo.city || "")

    const shippingInfoSubmit = (e) => {
        e.preventDefault();
        if(phoneNumber.length !== 10){
            toast.error("So dien thoai phai co 10 chu so",
                {position:'top-center', autoClose: 3000}
            )
            return;
        }
        if (!address || !country || !province || !city) {
            toast.error("Vui lòng nhập đầy đủ thông tin giao hàng", { position: "top-center", autoClose: 3000 });
            return;
        }
        dispatch(saveShippingInfo({address, pinCode, phoneNumber, country, province, city}))
        navigate('/order/confirm')
    }

   
  return (
    <>
        <PageTitle  title="Thong tin giao hang"/>
        <Navbar />
        <CheckoutPath activePath ={0} />
        <div className="shipping-form-container">
            <h1 className="shipping-form-header">Chi tiet giao hang</h1>
            <form className="shipping-form" onSubmit={shippingInfoSubmit}>
                <div className="shipping-section">
                    <div className="shipping-form-group">
                        <label htmlFor="address">Dia chi</label>
                        <input type="text" 
                               id='address' 
                               name='address' 
                               placeholder='Nhap dia chi...' 
                               value={address}
                               onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="shipping-form-group">
                        <label htmlFor="pinCode">pinCode</label>
                        <input type="number" 
                               id='pinCode' 
                               name='pinCode' 
                               placeholder='Nhap pinCode ...' 
                               value={pinCode}
                               onChange={(e) => setPinCode(e.target.value)}

                        />
                    </div>
                    <div className="shipping-form-group">
                        <label htmlFor="phoneNumber">Số điện thoại</label>
                        <input type="tel" 
                               id='phoneNumber'
                               name='phoneNumber' 
                               placeholder='Nhap số điện thoại...' 
                               value={phoneNumber}
                               onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    
                </div>
                <div className="shipping-section">
                    <div className="shipping-form-group">
                        <label htmlFor="country">Quốc gia</label>
                        <select name = "country" id = "country" 
                               value={country}
                               onChange={(e) => {
                                setCountry(e.target.value)
                                // đặt lại state và city khi thay đổi quốc gia
                                setState("")
                                setCity("")
                               }
                            }
                        >
                            <option value="">Chon quoc gia</option>
                            {Country && Country.getAllCountries().map((item) => (
                                <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
                            ))}
            
                        </select>
                    </div>
                    {country && <div className="shipping-form-group">
                        <label htmlFor="state">Tỉnh/Thành</label>
                        <select name = "state" id = "state" 
                               value={province}
                               onChange={(e) =>{
                                 setState(e.target.value)
                                 setCity("")
                               }}
                        >
                            <option value=""> Chon Tỉnh/Thành</option>
                            {State && State.getStatesOfCountry(country).map((item) => (
                                <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
                            ))}
            
                        </select>
                    </div>}

                    {province && <div className="shipping-form-group">
                        <label htmlFor="city">Quận/Huyện</label>
                        <select name = "city" id = "city" 
                               value={city}
                               onChange={(e) => setCity(e.target.value)}
                        >
                            <option value="">Chon Quận/Huyện</option>
                            {City && City.getCitiesOfState(country, province).map((item) => (
                                <option key={item.name} value={item.name}>{item.name}</option>
                            ))}
            
                        </select>
                    </div>}
                    
                </div>
                <button className="shipping-submit-btn">Tiếp tục</button>
            </form>
        </div>

        <Footer />

    </>

)
}

export default Shipping