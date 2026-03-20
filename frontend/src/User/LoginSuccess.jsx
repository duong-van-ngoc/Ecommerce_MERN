import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// Giả sử có action loadUser để cập nhật trạng thái sau khi login thành công
// import { loadUser } from '../features/user/userSlice';

const LoginSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // Có thể gọi loadUser ở đây nếu cần đồng bộ Redux
        // dispatch(loadUser());
        
        toast.success("Đăng nhập thành công!");
        
        // Lưu trạng thái vào localStorage nếu hệ thống yêu cầu
        localStorage.setItem("isAuthenticated", "true");
        
        // Chuyển hướng về trang chủ sau 1.5 giây
        setTimeout(() => {
            navigate("/");
        }, 1500);
    }, [navigate, dispatch]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Đang xác thực...</h2>
            <div className="loader"></div>
        </div>
    );
};

export default LoginSuccess;
