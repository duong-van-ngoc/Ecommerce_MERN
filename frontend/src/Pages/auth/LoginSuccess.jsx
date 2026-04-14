/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Xử lý Đăng nhập thành công" (Login Success Handler).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trang trung gian (Middleware-like page) dùng để xử lý dữ liệu trả về từ các phương thức đăng nhập mạng xã hội (Google, Facebook).
 *    - Giải mã Token từ URL, lưu trữ vào LocalStorage và cập nhật trạng thái người dùng toàn cục trên Redux.
 *    - Tạo ra hiệu ứng chuyển cảnh mượt mà từ lúc nhận phản hồi của Server đến khi vào trang chủ.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xác thực Mạng xã hội (Social Authentication Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `URLSearchParams`: Kỹ thuật lấy tham số từ thanh địa chỉ (Query String) một cách nhanh chóng.
 *    - LocalStorage: Lưu trữ Token bền vững dưới trình duyệt để duy trì phiên đăng nhập kể cả khi F5 hoặc tắt tab.
 *    - `setTimeout`: Kỹ thuật tạo độ trễ nhân tạo (Artificial Delay) giúp trải nghiệm người dùng không bị "giật" và tạo cảm giác an toàn (đang xác thực).
 *    - Cleanup Function: Sử dụng `clearTimeout` trong hàm trả về của `useEffect` để tránh lỗi "memory leak" nếu người dùng chuyển trang quá nhanh.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Tham số `?token=...` trên thanh địa chỉ URL sau khi Redirect từ Social Auth.
 *    - Output: Token được lưu vào máy, dữ liệu User được tải vào Redux, và điều hướng về trang chủ.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `urlToken`: Token được trích xuất từ URL.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `dispatch(loaderUser())`: Kích hoạt luồng lấy thông tin chi tiết của User ngay khi vừa có Token mới.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Trình duyệt nhận Redirect từ Backend kèm Token trên URL.
 *    - Bước 2: Component mount -> `useEffect` nhặt Token và cất vào `localStorage`.
 *    - Bước 3: Gọi lệnh `loaderUser()` để Redux đi lấy thông tin Profile chính thức.
 *    - Bước 4: Hiện Toast báo thành công -> Chờ 1 giây -> `navigate("/")` về trang chủ.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Browser URL -> LocalStorage -> Redux Action (Get User Details) -> API /api/v1/me.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Hiển thị một Loader đơn giản kèm dòng chữ "Đang xác thực..." để người dùng yên tâm chờ đợi.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Thao tác `dispatch(loaderUser())` và bộ đếm thời gian `setTimeout`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - File này là mắt xích cuối cùng của luồng OAuth2. Nếu logic ở đây hỏng (VD: không lưu được token), người dùng sẽ liên tục bị văng ra trang Login dù đã xác thực Google/FB xong.
 */
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// Giả sử có action loadUser để cập nhật trạng thái sau khi login thành công
import { loaderUser } from '@/features/user/userSlice';

const LoginSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Lấy token từ URL (Social Login redirect)
        const params = new URLSearchParams(location.search);
        const urlToken = params.get("token");
        
        if (urlToken) {
            localStorage.setItem("token", urlToken);
        }

        // Gọi loadUser để lấy thông tin user mới nhất và cập nhật Redux
        dispatch(loaderUser());
        
        toast.success("Đăng nhập thành công!");
        
        // Chuyển hướng về trang chủ sau 1 giây
        const timer = setTimeout(() => {
            navigate("/");
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, dispatch, location.search]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Đang xác thực...</h2>
            <div className="loader"></div>
        </div>
    );
};

export default LoginSuccess;
