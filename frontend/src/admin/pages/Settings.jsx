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
