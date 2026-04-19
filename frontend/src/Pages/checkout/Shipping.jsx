import React, { useEffect, useState, useRef } from 'react'
import '@/pages/checkout/styles/Shipping.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import CheckoutPath from '@/pages/checkout/CheckoutPath'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { saveShippingInfo } from '@/features/cart/cartSlice'
import { useNavigate } from 'react-router-dom'
import { getProvinces, getDistrictsByProvince, getWardsByDistrict } from '@/shared/api/apiAddress'
import { fetchAddresses } from '@/features/address/addressSlice'

function Shipping() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. Kết nối Selectors
    const { shippingInfo } = useSelector(state => state.cart)
    const { user, isAuthenticated } = useSelector(state => state.user)
    const { addresses, loading: addressLoading } = useSelector(state => state.address)

    // State cho Form
    const [address, setAddress] = useState(shippingInfo?.address || "")
    const [pinCode, setPinCode] = useState(shippingInfo?.pinCode || "")
    const [phoneNumber, setPhoneNumber] = useState(shippingInfo?.phoneNumber || "")

    // State cho Cascading Dropdowns
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistrictsList] = useState([]);
    const [wards, setWardsList] = useState([]);

    const [provinceCode, setProvinceCode] = useState(shippingInfo?.provinceCode || "");
    const [districtCode, setDistrictCode] = useState(shippingInfo?.districtCode || "");
    const [wardCode, setWardCode] = useState(shippingInfo?.wardCode || "");

    // Ref để kiểm soát việc Auto-fill chỉ diễn ra một lần
    const hasAutoFilled = useRef(false);

    // 2. Fetch danh sách địa chỉ của người dùng khi mount
    useEffect(() => {
        if (isAuthenticated && addresses.length === 0) {
            dispatch(fetchAddresses());
        }
    }, [isAuthenticated, dispatch, addresses.length]);

    // 3. Logic Auto-fill địa chỉ mặc định
    useEffect(() => {
        if (isAuthenticated && addresses.length > 0 && !hasAutoFilled.current && !address && !phoneNumber) {
            const defaultAddr = addresses.find(addr => addr.isDefault);
            if (defaultAddr) {
                // Kiểm tra xem địa chỉ này có đầy đủ mã code không (Dành cho dữ liệu cũ)
                if (!defaultAddr.provinceCode) {
                    toast.warning("Địa chỉ mặc định của bạn cần được cập nhật để sử dụng tính năng điền tự động", {
                        position: "top-center",
                        autoClose: false
                    });
                    hasAutoFilled.current = true; // Không scan lại nữa
                    return;
                }

                // Điền thông tin cơ bản
                setAddress(defaultAddr.streetAddress || "");
                setPhoneNumber(defaultAddr.phone || "");
                setPinCode(defaultAddr.zipCode || "");
                
                // Điền thông tin địa chính (Mã code)
                setProvinceCode(String(defaultAddr.provinceCode));
                setDistrictCode(String(defaultAddr.districtCode));
                setWardCode(String(defaultAddr.wardCode));

                hasAutoFilled.current = true;
                toast.success("Đã áp dụng địa chỉ mặc định của bạn", { position: "bottom-right", autoClose: 3000 });
            }
        }
    }, [isAuthenticated, addresses, address, phoneNumber]);

    // Lấy danh sách tỉnh/thành
    useEffect(() => {
        const fetchProvincesList = async () => {
            try {
                const data = await getProvinces();
                setProvinces(data);
            } catch (err) {
                toast.error(err.message || "Không tải được danh sách tỉnh/thành", { position: "top-center" });
            }
        };
        fetchProvincesList();
    }, []);

    // 4.1 Xứ lý Tỉnh -> Quận: Cascading Dropdown thông minh
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!provinceCode) {
                setDistrictsList([]);
                setDistrictCode("");
                setWardCode("");
                return;
            }

            try {
                const data = await getDistrictsByProvince(provinceCode);
                setDistrictsList(data);
                
                // ANTI-RESET LOGIC:
                // Nếu districtCode hiện tại KHÔNG nằm trong danh sách Tỉnh mới -> Reset
                // Nếu đang auto-fill (districtCode có sẵn và nằm trong data mới) -> Giữ nguyên
                const isValid = data.find(d => String(d.code) === String(districtCode));
                if (!isValid) {
                    setDistrictCode("");
                    setWardsList([]);
                    setWardCode("");
                }
            } catch (err) {
                toast.error("Không tải được danh sách quận/huyện");
            }
        };
        fetchDistricts();
    }, [provinceCode]);

    // 4.2 Xử lý Quận -> Xã: Cascading Dropdown thông minh
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

                // ANTI-RESET LOGIC: Tương tự như phần Tỉnh -> Quận
                const isValid = data.find(w => String(w.code) === String(wardCode));
                if (!isValid) {
                    setWardCode("");
                }
            } catch (err) {
                toast.error("Không tải được danh sách phường/xã");
            }
        };
        fetchWards();
    }, [districtCode]);

    const shippingInfoSubmit = (e) => {
        e.preventDefault();
        if (phoneNumber.length !== 10) {
            toast.error("Số điện thoại phải có 10 chữ số", { position: 'top-center' });
            return;
        }
        if (!address || !provinceCode || !districtCode || !wardCode) {
            toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
            return;
        }

        const provinceName = provinces.find(p => String(p.code) === String(provinceCode))?.name || "";
        const districtName = districts.find(d => String(d.code) === String(districtCode))?.name || "";
        const wardName = wards.find(w => String(w.code) === String(wardCode))?.name || "";

        dispatch(saveShippingInfo({
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
        }));

        navigate('/order/confirm')
    }

    return (
        <>
            <PageTitle title="Thông tin giao hàng" />
            <Navbar />
            <CheckoutPath activePath={1} />

            <main className="min-h-[calc(100vh-80px)] py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white p-8 md:p-12 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100">
                        <div className="text-center mb-10">
                            <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">Chi tiết giao hàng</h2>
                            <p className="text-slate-500 font-light max-w-md mx-auto">
                                Vui lòng nhập thông tin chính xác để chúng tôi có thể gửi sản phẩm đến tay bạn một cách an toàn nhất.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={shippingInfoSubmit}>
                            <div className="grid grid-cols-1 gap-6">
                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Địa chỉ chi tiết</label>
                                    <input
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm transition-all focus:bg-white focus:ring-1 focus:ring-[#ff6b6b]/20 outline-none"
                                        placeholder="Số nhà, tên đường..."
                                        type="text"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                {/* Locations Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Tỉnh/Thành</label>
                                        <select
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white focus:ring-1 focus:ring-[#ff6b6b]/20 outline-none"
                                            value={provinceCode}
                                            onChange={(e) => setProvinceCode(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Chọn Tỉnh/Thành</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Quận/Huyện</label>
                                        <select
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white focus:ring-1 focus:ring-[#ff6b6b]/20 outline-none"
                                            value={districtCode}
                                            onChange={(e) => setDistrictCode(e.target.value)}
                                            disabled={!provinceCode}
                                            required
                                        >
                                            <option value="" disabled>Chọn Quận/Huyện</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Phường/Xã</label>
                                        <select
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white focus:ring-1 focus:ring-[#ff6b6b]/20 outline-none"
                                            value={wardCode}
                                            onChange={(e) => setWardCode(e.target.value)}
                                            disabled={!districtCode}
                                            required
                                        >
                                            <option value="" disabled>Chọn Phường/Xã</option>
                                            {wards.map((w) => (
                                                <option key={w.code} value={w.code}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Mã bưu điện</label>
                                        <input
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white focus:ring-1 focus:ring-[#ff6b6b]/20 outline-none"
                                            placeholder="Ví dụ: 70000"
                                            type="text"
                                            value={pinCode}
                                            onChange={(e) => setPinCode(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Số điện thoại</label>
                                        <input
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white focus:ring-1 focus:ring-[#ff6b6b]/20 outline-none"
                                            placeholder="090 XXX XXXX"
                                            type="tel"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex flex-col items-center gap-6">
                                <button
                                    className="w-full md:w-64 bg-primary text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all duration-500 hover:scale-[1.02] active:scale-95"
                                    type="submit"
                                >
                                    Tiếp tục thanh toán
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/cart')}
                                    className="text-[11px] uppercase tracking-widest font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    Quay lại giỏ hàng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Shipping;