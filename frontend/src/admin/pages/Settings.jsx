import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchSettings, updateSettings } from '../adminSLice/adminSlice';
import '../styles/Settings.css';

/**
 * ========================================
 * SETTINGS COMPONENT
 * ========================================
 * 
 * COMPONENT PURPOSE:
 * - Hiển thị form cài đặt admin
 * - Fetch settings từ server khi mount
 * - Update settings khi user click Save
 * - Sync local state với Redux state
 * 
 * STATE MANAGEMENT:
 * - Local state (useState): Form data để user edit
 * - Redux state (useSelector): Settings từ server
 * - Sync flow: Redux → Local → User edit → Submit → Redux → Server
 */
function Settings() {
    /**
     * ===== REDUX HOOKS =====
     * 
     * useDispatch: Lấy dispatch function để gọi actions
     * useSelector: Lấy data từ Redux store
     */
    const dispatch = useDispatch();

    // Destructure admin state từ Redux
    // state.admin.settings - Settings data từ server
    // state.admin.loading - Loading state cho spinner
    // state.admin.error - Error message nếu có lỗi
    const { settings, loading, error } = useSelector(state => state.admin);

    /**
     * ===== LOCAL STATE =====
     * 
     * LÝ DO DÙNG LOCAL STATE:
     * - Form cần controlled components (React-controlled inputs)
     * - User có thể edit và cancel trước khi save
     * - Không muốn update Redux mỗi lần user gõ 1 ký tự
     * - Chỉ update Redux khi click Save button
     */
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

    /**
     * ===== EFFECT 1: FETCH SETTINGS ON MOUNT =====
     * 
     * useEffect với dependency array = [dispatch]
     * - Chạy 1 lần khi component mount (và khi dispatch thay đổi - never)
     * - Dispatch fetchSettings() → call API
     * - Redux sẽ update settings state
     */
    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    /**
     * ===== EFFECT 2: SYNC REDUX STATE VỚI LOCAL STATE =====
     * 
     * useEffect với dependency = [settings]
     * - Chạy mỗi khi settings từ Redux thay đổi
     * - Update local formData với data từ server
     * - Đảm bảo form luôn hiển thị data mới nhất
     * 
     * FLOW:
     * 1. Component mount → dispatch fetchSettings()
     * 2. API success → Redux update settings
     * 3. settings thay đổi → trigger useEffect này
     * 4. setFormData với data từ server → form auto-fill
     */
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

    /**
     * ===== EFFECT 3: ERROR HANDLING =====
     * 
     * useEffect với dependency = [error]
     * - Chạy mỗi khi error state thay đổi
     * - Hiện toast notification khi có lỗi
     * - User experience: Thông báo rõ ràng khi có lỗi
     */
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'top-center',
                autoClose: 3000
            });
        }
    }, [error]);

    /**
     * ===== EVENT HANDLERS =====
     */

    /**
     * Handle input change - Text inputs
     * 
     * @param {Event} e - Change event từ input
     * 
     * FLOW:
     * 1. User gõ vào input
     * 2. onChange trigger với event
     * 3. Extract name và value từ event.target
     * 4. Update formData với spread operator
     *    - Giữ nguyên các fields khác (...prev)
     *    - Chỉ update field đang thay đổi [name]: value
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,  // Spread: Copy tất cả fields hiện tại
            [name]: value  // Computed property: Update field cụ thể
        }));
    };

    /**
     * Handle checkbox change - Notification preferences
     * 
     * @param {Event} e - Change event từ checkbox
     * 
     * NESTED STATE UPDATE:
     * - notifications là nested object trong formData
     * - Cần spread 2 lần: formData và notifications
     */
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,  // Spread level 1: formData
            notifications: {
                ...prev.notifications,  // Spread level 2: notifications
                [name]: checked  // Update checkbox cụ thể
            }
        }));
    };

    /**
     * Handle form submit - Save settings
     * 
     * @param {Event} e - Submit event từ form
     * 
     * ASYNC FLOW:
     * 1. Prevent default form submission (không reload page)
     * 2. Dispatch updateSettings(formData) → call API
     * 3. Sử dụng .unwrap() để convert Promise thành try-catch
     *    - unwrap() throw error nếu rejected
     *    - Cho phép dùng try-catch thay vì .then().catch()
     * 4. Success → show success toast
     * 5. Error → show error toast (tự động từ useEffect error handling)
     */
    const handleSave = async (e) => {
        e.preventDefault();  // Prevent page reload

        try {
            // dispatch(updateSettings(formData)) return Promise
            // .unwrap() convert Redux Promise → standard Promise
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

    /**
     * ===== LOADING STATE =====
     * 
     * Hiện loading spinner khi:
     * - Đang fetch settings lần đầu (loading && !settings)
     * - Chưa có data từ server
     * 
     * EARLY RETURN:
     * - Return JSX sớm nếu đang loading
     * - Không chạy phần render form phía dưới
     */
    if (loading && !settings) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    /**
     * ===== MAIN RENDER =====
     * Chỉ render form khi đã có settings data
     */

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

                {/* Thông tin công ty */}
                <div className="settings-section">
                    <h3 className="section-title">Thông tin công ty</h3>

                    <div className="form-group">
                        <label htmlFor="companyName">Tên công ty</label>
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
