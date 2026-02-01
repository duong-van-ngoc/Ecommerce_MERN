import React, { useEffect, useState } from 'react'
import '../CartStyles/Shipping.css'
import PageTitle from '../components/PageTitle'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CheckoutPath from './CheckoutPath'
import { useDispatch, useSelector } from 'react-redux'
import {Country, State, City} from 'country-state-city'
import {toast} from  'react-toastify'
import { saveShippingInfo } from '../features/cart/cartSlice'
import { useNavigate } from 'react-router-dom'
import { getProvinces, getDistrictsByProvince, getWardsByDistrict } from '../api/apiAdress'

function Shipping() {

    const {shippingInfo} = useSelector(state => state.cart)
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [address, setAddress] = useState(shippingInfo.address || "")
    const [pinCode, setPinCode] = useState(shippingInfo.pinCode || "")
    const [phoneNumber, setPhoneNumber] = useState(shippingInfo.phoneNumber || "")

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistrictsList] = useState([]);
    const [wards, setWardsList] = useState([]);

    const [provinceCode, setProvinceCode] = useState(shippingInfo.provinceCode || "");
    const [districtCode, setDistrictCode] = useState(shippingInfo.districtCode || "");
    const [wardCode, setWardCode] = useState(shippingInfo.wardCode || "");

    // const [country, setCountry] = useState(shippingInfo.country || "")
    // const [province, setState] = useState(shippingInfo.province || "")
    // const [city, setCity] = useState(shippingInfo.city || "")

    // Lấy danh sách tỉnh/thành
    useEffect(() => {
        const fetchProvinces = async () => {
        try {
            const data = await getProvinces();
            setProvinces(data);
        } catch (err) {
            toast.error(err.message || "Không tải được danh sách tỉnh/thành", {
            position: "top-center",
            autoClose: 3000,
            });
        }
        };
        fetchProvinces();
    }, []);

  // Lấy danh sách quận/huyện khi provinceCode thay đổi
    useEffect(() => {
        const fetchDistricts = async () => {
        if (!provinceCode) {
            setDistrictsList([]);
            setWardsList([]);
            setDistrictCode("");
            setWardCode("");
            return;
        }

        try {
            const data = await getDistrictsByProvince(provinceCode);
            setDistrictsList(data);
            setWardsList([]);
            setDistrictCode("");
            setWardCode("");
        } catch (err) {
            toast.error(err.message || "Không tải được danh sách quận/huyện", {
            position: "top-center",
            autoClose: 3000,
            });
        }
        };

        fetchDistricts();
    }, [provinceCode]);


// Lấy danh sách phường/xã khi districtCode thay đổi
    useEffect(() => {
        const fetchWards = async () => {
        if (!districtCode) {
            setWardsList([]);
            setWardCode("");
            return;
        }

        try {
            const data = await getWardsByDistrict(districtCode);
            setWardsList(data);
            setWardCode("");
        } catch (err) {
            toast.error(err.message || "Không tải được danh sách phường/xã", {
            position: "top-center",
            autoClose: 3000,
            });
        }
        };

        fetchWards();
    }, [districtCode]);

    const shippingInfoSubmit = (e) => {
        e.preventDefault();
        if(phoneNumber.length !== 10){
            toast.error("So dien thoai phai co 10 chu so",
                {position:'top-center', autoClose: 3000}
            )
            return;
        }
        if (!address || !provinceCode || !districtCode || !wardCode) {
            toast.error("Vui lòng nhập đầy đủ thông tin giao hàng", { position: "top-center", autoClose: 3000 });
            return;
        }
        // dispatch(saveShippingInfo({address, pinCode, phoneNumber, country, province, city}))
        const provinceName = provinces.find((p) => String(p.code) === String(provinceCode))?.name || "";
        const districtName = districts.find((d) => String(d.code) === String(districtCode))?.name || "";
        const wardName = wards.find((w) => String(w.code) === String(wardCode))?.name || "";

    
            dispatch(
                saveShippingInfo({
                    address,
                    pinCode,
                    phoneNumber,
                    country: "VN",

                    provinceCode,
                    districtCode,
                    wardCode,

                    provinceName,
                    districtName,
                    wardName,
                })
            );

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
              <label htmlFor="province">Tỉnh/Thành</label>
              <select
                name="province"
                id="province"
                value={provinceCode}
                onChange={(e) => setProvinceCode(e.target.value)}
              >
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Quận/Huyện */}
            {provinceCode && (
              <div className="shipping-form-group">
                <label htmlFor="district">Quận/Huyện</label>
                <select
                  name="district"
                  id="district"
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ✅ Phường/Xã */}
            {districtCode && (
              <div className="shipping-form-group">
                <label htmlFor="ward">Phường/Xã</label>
                <select name="ward" id="ward" value={wardCode} onChange={(e) => setWardCode(e.target.value)}>
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
                <button className="shipping-submit-btn">Tiếp tục</button>
            </form>
        </div>

        <Footer />

    </>

)
}

export default Shipping