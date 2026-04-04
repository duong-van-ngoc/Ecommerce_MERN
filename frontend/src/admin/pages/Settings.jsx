/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Trang Cài Đặt Hệ Thống (Settings Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý các thông tin "Meta" của toàn bộ hệ thống E-commerce như Tên cửa hàng, Địa chỉ và Email liên hệ.
 *    - Cấu hình các loại thông báo (Notifications) mà Admin muốn nhận được: Có đơn hàng mới, Sản phẩm sắp hết hàng, v.v.
 *    - Là nơi lưu giữ các thiết lập mang tính chất quyết định đến bộ mặt và vận hành của Shop.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Cấu hình Hệ thống & Quản trị trung tâm (Administrative & Config Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Deeply Nested State Management: Kỹ thuật quản lý State với Object nhiều tầng lớp. Đặc biệt là phần `notifications` nằm bên trong `formData`. Việc cập nhật này đòi hỏi dùng Spread Operator (`...`) cực kỳ khéo léo để không làm mất dữ liệu của các anh em "hàng xóm" trong cùng một Object.
 *    - Server-to-Local Synchronization Pattern: Sử dụng `useEffect` để "đổ" dữ liệu từ Redux Store (Server data) vào Local State (`formData`) ngay khi dữ liệu vừa được tải về. Đây là cách chuẩn để khởi tạo dữ liệu cho một Form chỉnh sửa.
 *    - Fully Controlled Components: TẤT CẢ các thành phần từ Input, Textarea cho đến Checkbox đều được React kiểm soát hoàn toàn. Giá trị bạn thấy trên màn hình luôn khớp 100% với giá trị trong State.
 *    - Functional Update in useState: Kỹ thuật `setFormData(prev => ({ ...prev }))`. Việc sử dụng hàm callback `prev` giúp đảm bảo bạn luôn cập nhật dựa trên dữ liệu mới nhất, tránh tình trạng bị mất dữ liệu do các thay đổi xảy ra dồn dập.
 *    - Error Handling with Redux Unwrapping: Sử dụng `.unwrap()` sau khi Dispatch. Kỹ thuật này biến Action Redux thành một Promise thực thụ, cho phép bạn sử dụng `try/catch` để hiển thị Toast thông báo thành công hoặc lỗi một cách chuyên nghiệp.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu cấu hình hệ thống hiện tại từ Redux.
 *    - Output: Một Form chỉnh sửa tích hợp sẵn logic lưu trữ và phản hồi người dùng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `formData`: Lưu trữ tạm thời các thay đổi trên giao diện trước khi gửi đi. Bao gồm 2 phần: Thông tin văn bản và Cấu hình thông báo (Checkboxes).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleInputChange`: Cập nhật các trường văn bản đơn giản.
 *    - `handleCheckboxChange`: Logic chuyên xử lý các ô tích chọn, cập nhật sâu vào Object `notifications`.
 *    - `handleSave`: Hành động nén toàn bộ `formData` thành JS Object và đẩy lên Cloud để lưu trữ.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khi mở trang, Dispatch `fetchSettings` để hỏi Server "Cấu hình shop hiện tại là gì?".
 *    - Bước 2: Server trả về -> Dữ liệu hiện ra trên các ô Input.
 *    - Bước 3: Admin thay đổi địa chỉ shop hoặc bật/tắt thông báo "Đơn hàng mới".
 *    - Bước 4: Admin bấm "Lưu thay đổi" -> Một hiệu ứng Loading xuất hiện -> Toast báo "Thành công" hiện lên.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request: `GET /api/v1/admin/settings` và `PUT /api/v1/admin/settings`.
 *    - Database: Tác động vào một Document duy nhất chứa toàn bộ Config của hệ thống.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Skeleton Loading: Trong khi chờ dữ liệu Settings từ Server về, hệ thống sẽ hiện vòng quay Loading để tránh việc người dùng gõ vào các ô Input rỗng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ quá trình FETCH và UPDATE thông tin cài đặt thông qua API.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Phần `handleCheckboxChange`: Luôn nhớ `prev.notifications` phải được spread lại để tránh làm hỏng các cài đặt thông báo khác khi bạn chỉ thay đổi một ô.
 *    - Phân biệt rõ giữa Thông tin cá nhân Admin và Thông tin của Shop.
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchSettings, updateSettings } from '../adminSLice/adminSlice';
import '../styles/Settings.css';


function Settings() {
  
    const dispatch = useDispatch();

 
    const { settings, loading, error } = useSelector(state => state.admin);

   

    const [formData, setFormData] = useState({
        adminName: '',
        email: '',
        companyName: '',
        address: '',
        notifications: {
            newOrders: true,
            lowStock: true,
            newUsers: true,
            newReviews: true
        }
    });

   
    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    
    useEffect(() => {
        if (settings) {
            setFormData({
                adminName: settings.adminName || '',
                email: settings.email || '',
                companyName: settings.companyName || '',
                address: settings.address || '',
                notifications: settings.notifications || {
                    newOrders: true,
                    lowStock: true,
                    newUsers: true,
                    newReviews: true
                }
            });
        }
    }, [settings]);

   
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'top-center',
                autoClose: 3000
            });
        }
    }, [error]);

   
   
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,  
            [name]: value  
        }));
    };

   
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,  
            notifications: {
                ...prev.notifications, 
                [name]: checked 
            }
        }));
    };

    
    const handleSave = async (e) => {
        e.preventDefault(); 

        try {
            
            await dispatch(updateSettings(formData)).unwrap();

            // Chỉ chạy nếu update thành công
            toast.success('Đã lưu cài đặt thành công!', {
                position: 'top-center',
                autoClose: 2000
            });
        } catch (err) {
            // err = error message từ rejectWithValue()
            // Fallback nếu err undefined
            toast.error(err || 'Lưu cài đặt thất bại', {
                position: 'top-center',
                autoClose: 3000
            });
        }
    };

   
    if (loading && !settings) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

   

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2 className="settings-title">Cài đặt</h2>
            </div>

            <form className="settings-form" onSubmit={handleSave}>
                {/* Thông tin cá nhân */}
                <div className="settings-section">
                    <h3 className="section-title">Thông tin cá nhân</h3>

                    <div className="form-group">
                        <label htmlFor="adminName">Tên admin</label>
                        <input
                            type="text"
                            id="adminName"
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleInputChange}
                            placeholder="Nhập tên admin"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>

                {/* Thông tin Shop*/}
                <div className="settings-section">
                    <h3 className="section-title">Thông tin Shop</h3>

                    <div className="form-group">
                        <label htmlFor="companyName">Tên Shop</label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Nhập tên công ty"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="123 Đường ABC, Quận 1, TP.HCM"
                            rows="3"
                        />
                    </div>
                </div>

                {/* Thông báo */}
                <div className="settings-section">
                    <h3 className="section-title">Thông báo</h3>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="newOrders"
                                checked={formData.notifications.newOrders}
                                onChange={handleCheckboxChange}
                            />
                            <span>Đơn hàng mới</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="lowStock"
                                checked={formData.notifications.lowStock}
                                onChange={handleCheckboxChange}
                            />
                            <span>Sản phẩm sắp hết hàng</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="newUsers"
                                checked={formData.notifications.newUsers}
                                onChange={handleCheckboxChange}
                            />
                            <span>Người dùng mới</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="newReviews"
                                checked={formData.notifications.newReviews}
                                onChange={handleCheckboxChange}
                            />
                            <span>Đánh giá mới</span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="settings-actions">
                    <button type="submit" className="btn-save">
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Settings;
