/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang Thông tin Giao hàng (Shipping Information Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là bước đầu tiên (Step 1/3) trong quy trình Thanh toán (Checkout Flow).
 *    - Thu thập dữ liệu vận chuyển chính xác: Địa chỉ chi tiết, Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số điện thoại.
 *    - Tích hợp API địa chính Việt Nam để cung cấp trải nghiệm chọn địa chỉ chuyên nghiệp, hạn chế sai sót nhập liệu.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán & Đặt hàng (Checkout & Order Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Cascading Selects (Dropdown phân cấp): Kỹ thuật xử lý các thẻ `<select>` phụ thuộc nhau. Chọn Tỉnh -> Kích hoạt `useEffect` tải Huyện -> Chọn Huyện -> Kích hoạt tải Xã.
 *    - API Integration: Sử dụng các hàm Service (`getProvinces`, `getDistrictsByProvince`, `getWardsByDistrict`) để tương tác với API địa lý bên ngoài.
 *    - Redux Persistence: Đọc dữ liệu `shippingInfo` cũ từ Redux Store để tự động điền (Pre-fill) giúp người dùng không phải nhập lại nếu họ lỡ tay F5 trang hoặc quay lại từ bước sau.
 *    - Data Mapping: Kỹ thuật tìm kiếm tên (Name) từ mã (Code) thông qua hàm `.find()` trước khi lưu dữ liệu, giúp giao diện xác nhận đơn hàng hiển thị được tên Tỉnh/Thành rõ ràng thay vì mã số.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các lựa chọn vùng miền và thông tin liên lạc từ khách hàng.
 *    - Output: Một Object `shippingInfo` hoàn chỉnh lưu vào Redux và chuyển hướng sang bước tiếp theo.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `provinces`, `districts`, `wards`: Các mảng dữ liệu hành chính phục vụ việc hiển thị danh sách lựa chọn.
 *    - `provinceCode`, `districtCode`, `wardCode`: Lưu trữ mã số vùng đang được chọn để làm tham số cho các API cấp dưới.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Bộ 3 `useEffect`: Nòng cốt xử lý logic "Chọn cấp trên, load cấp dưới".
 *    - `shippingInfoSubmit`: Hàm tổng quát thực hiện Validation (kiểm tra SĐT) và đóng gói dữ liệu cuối cùng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Trang tải lên -> `useEffect` đầu tiên lấy danh sách Tỉnh/Thành toàn quốc.
 *    - Bước 2: Người dùng chọn Tỉnh -> `useEffect` thứ hai nhạy bén phát hiện sự thay đổi và tải ngay danh sách Quận tương ứng.
 *    - Bước 3: Người dùng hoàn tất nhập SĐT và Địa chỉ nhà.
 *    - Bước 4: Nhấn "Tiếp tục" -> Hệ thống map Code thành Name -> Lưu vào Redux -> Chuyển sang `/order/confirm`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> External Address API (Lấy danh sách vùng) -> UI components.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `disabled`: Các ô chọn cấp dưới sẽ bị "khóa" nếu cấp trên chưa được chọn, giúp tránh lỗi logic dữ liệu.
 *    - `activePath={1}`: Truyền vào component `CheckoutPath` để làm sáng bước 1 trên thanh tiến trình.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ quá trình fetch dữ liệu địa lý là bất đồng bộ (Async/Await).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Cần chú ý logic `setDistrictCode("")` và `setWardCode("")` mỗi khi cấp trên thay đổi. Nếu thiếu cái này, bạn có thể gửi lên một địa chỉ "râu ông nọ chắp cằm bà kia" (Huyện của Tỉnh cũ nhưng lại ở Tỉnh mới).
 *    - `phoneNumber.length !== 10`: Basic validation đảm bảo số điện thoại Việt Nam hợp lệ.
 */
import React, { useEffect, useState } from 'react'
import '@/pages/checkout/styles/Shipping.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import CheckoutPath from '@/pages/checkout/CheckoutPath'
import { useDispatch, useSelector } from 'react-redux'
import {Country, State, City} from 'country-state-city'
import {toast} from  'react-toastify'
import { saveShippingInfo } from '@/features/cart/cartSlice'
import { useNavigate } from 'react-router-dom'
import { getProvinces, getDistrictsByProvince, getWardsByDistrict } from '@/shared/api/apiAddress'

function Shipping() {

    const {shippingInfo} = useSelector(state => state.cart)
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [address, setAddress] = useState(shippingInfo?.address || "")
    const [pinCode, setPinCode] = useState(shippingInfo?.pinCode || "")
    const [phoneNumber, setPhoneNumber] = useState(shippingInfo?.phoneNumber || "")

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistrictsList] = useState([]);
    const [wards, setWardsList] = useState([]);

    const [provinceCode, setProvinceCode] = useState(shippingInfo?.provinceCode || "");
    const [districtCode, setDistrictCode] = useState(shippingInfo?.districtCode || "");
    const [wardCode, setWardCode] = useState(shippingInfo?.wardCode || "");

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
      <PageTitle title="Thông tin giao hàng" />
      <Navbar />
      <CheckoutPath activePath={1} />

      <main className="min-h-[calc(100vh-80px)] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Content Area */}
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">Chi tiết giao hàng</h2>
              <p className="text-slate-500 font-light max-w-md mx-auto">
                Vui lòng nhập thông tin chính xác để chúng tôi có thể gửi tác phẩm nghệ thuật đến tay bạn một cách an toàn nhất.
              </p>
            </div>

            <form className="space-y-6" onSubmit={shippingInfoSubmit}>
              <div className="grid grid-cols-1 gap-6">
                {/* Address */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Địa chỉ</label>
                  <input
                    className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm transition-all focus:bg-white focus:ring-1 focus:ring-primary/20"
                    placeholder="Nhập số nhà, tên đường..."
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                {/* 3-Column Grid for Locations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tỉnh/Thành */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Tỉnh/Thành</label>
                    <select
                      className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white"
                      value={provinceCode}
                      onChange={(e) => setProvinceCode(e.target.value)}
                      required
                    >
                      <option value="" disabled>Chọn Tỉnh/Thành</option>
                      {Array.isArray(provinces) && provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quận/Huyện */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Quận/Huyện</label>
                    <select
                      className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white"
                      value={districtCode}
                      onChange={(e) => setDistrictCode(e.target.value)}
                      disabled={!provinceCode}
                      required
                    >
                      <option value="" disabled>Chọn Quận/Huyện</option>
                      {Array.isArray(districts) && districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phường/Xã */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Phường/Xã</label>
                    <select
                      className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm focus:bg-white"
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      disabled={!districtCode}
                      required
                    >
                      <option value="" disabled>Chọn Phường/Xã</option>
                      {Array.isArray(wards) && wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2-Column Grid for Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Mã bưu điện (PinCode)</label>
                    <input
                      className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm transition-all focus:bg-white"
                      placeholder="Ví dụ: 70000"
                      type="number"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Số điện thoại</label>
                    <input
                      className="w-full bg-slate-50 border-slate-200 rounded-lg py-4 px-5 text-sm transition-all focus:bg-white"
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
                  className="gradient-hover w-full md:w-64 bg-primary text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all duration-500 hover:scale-[1.02] active:scale-95"
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

export default Shipping