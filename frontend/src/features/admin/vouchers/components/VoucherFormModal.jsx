import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createVoucher, updateVoucher } from '@/admin/adminSLice/adminSlice';
import { toast } from 'react-toastify';

const VoucherFormModal = ({ voucher, onClose }) => {
    const dispatch = useDispatch();
    const isEditMode = !!voucher;

    const [formData, setFormData] = useState({
        code: '',
        type: 'general',
        discountType: 'fixed',
        discountValue: 0,
        maxAmount: 0,
        minOrderAmount: 0,
        usageLimit: 0,
        limitPerUser: 1,
        startDate: '',
        endDate: '',
        isPublic: true,
        description: ''
    });

    useEffect(() => {
        if (voucher) {
            setFormData({
                code: voucher.code || '',
                type: voucher.type || 'general',
                discountType: voucher.discount?.type || 'fixed',
                discountValue: voucher.discount?.value || 0,
                maxAmount: voucher.discount?.maxAmount || 0,
                minOrderAmount: voucher.conditions?.minOrderAmount || 0,
                usageLimit: voucher.conditions?.usageLimit || 0,
                limitPerUser: voucher.conditions?.limitPerUser || 1,
                startDate: voucher.conditions?.startDate ? new Date(voucher.conditions.startDate).toISOString().split('T')[0] : '',
                endDate: voucher.conditions?.endDate ? new Date(voucher.conditions.endDate).toISOString().split('T')[0] : '',
                isPublic: voucher.targeting?.isPublic ?? true,
                description: voucher.description || ''
            });
        }
    }, [voucher]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            discount: {
                type: formData.discountType,
                value: Number(formData.discountValue),
                maxAmount: formData.discountType === 'percentage' ? Number(formData.maxAmount) : undefined
            },
            conditions: {
                minOrderAmount: Number(formData.minOrderAmount),
                usageLimit: Number(formData.usageLimit) === 0 ? -1 : Number(formData.usageLimit),
                limitPerUser: Number(formData.limitPerUser),
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined
            },
            targeting: {
                isPublic: formData.isPublic
            },
            description: formData.description
        };

        try {
            if (isEditMode) {
                await dispatch(updateVoucher({ id: voucher._id, voucherData: payload })).unwrap();
                toast.success('Cập nhật voucher thành công!');
            } else {
                await dispatch(createVoucher(payload)).unwrap();
                toast.success('Tạo voucher thành công!');
            }
            onClose();
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra!');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-[#001738]/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Body */}
            <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                <div className="px-8 py-6 flex items-center justify-between border-b border-[#edeeef]">
                    <div>
                        <h2 className="text-2xl font-['Manrope'] font-extrabold text-[#191c1d]">
                            {isEditMode ? 'Chỉnh sửa Voucher' : 'Thiết lập Voucher'}
                        </h2>
                        <p className="text-sm text-[#434655] font-medium">Lấp đầy cấu hình khuyến mãi cho chiến dịch của bạn.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-[#434655] hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 1: Core Info */}
                        <div className="md:col-span-2 space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#004ac6] flex items-center gap-2">
                                <span className="w-6 h-[2px] bg-[#004ac6]"></span>
                                Thông tin cơ bản
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Mã giảm giá *</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            disabled={isEditMode}
                                            required
                                            className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all uppercase font-mono font-bold tracking-widest disabled:bg-slate-50 disabled:text-slate-400 group-hover:border-[#c3c6d7]"
                                            placeholder="GIAMGIA2026"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#434655] group-focus-within:text-[#004ac6]">confirmation_number</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Phân nhóm Voucher</label>
                                    <select 
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all font-medium appearance-none bg-white"
                                    >
                                        <option value="general">Khách hàng phổ thông</option>
                                        <option value="limited">Tài khoản giới hạn</option>
                                        <option value="exclusive">Độc quyền (VIP/Partner)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Discount Config */}
                        <div className="md:col-span-2 space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#004ac6] flex items-center gap-2">
                                <span className="w-6 h-[2px] bg-[#004ac6]"></span>
                                Cài đặt chiết khấu
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6 p-6 bg-[#f8f9fa] rounded-2xl border-2 border-dashed border-[#edeeef]">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Kiểu ưu đãi</label>
                                    <div className="flex p-1 bg-white rounded-lg border-2 border-[#edeeef]">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, discountType: 'fixed'}))}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.discountType === 'fixed' ? 'bg-[#004ac6] text-white shadow-md' : 'text-[#434655] hover:bg-slate-50'}`}
                                        >Tự chọn VND</button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, discountType: 'percentage'}))}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.discountType === 'percentage' ? 'bg-[#004ac6] text-white shadow-md' : 'text-[#434655] hover:bg-slate-50'}`}
                                        >Phần trăm %</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Giá trị giảm giá *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all font-bold text-xl"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#434655]">
                                            {formData.discountType === 'fixed' ? '₫' : '%'}
                                        </span>
                                    </div>
                                </div>

                                {formData.discountType === 'percentage' && (
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-[#191c1d]">Giảm tối đa (Optional)</label>
                                        <input
                                            type="number"
                                            name="maxAmount"
                                            value={formData.maxAmount}
                                            onChange={handleChange}
                                            className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all"
                                            placeholder="VD: 50000"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Limits & Logic */}
                        <div className="md:col-span-2 space-y-6 pt-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#004ac6] flex items-center gap-2">
                                <span className="w-6 h-[2px] bg-[#004ac6]"></span>
                                Ràng buộc & Thời gian
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Đơn tối thiểu (Min Spend)</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Tổng số lượt phát hành</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all"
                                        placeholder="Để 0 nếu vô tận"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Ngày có hiệu lực</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#191c1d]">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-[#edeeef] focus:border-[#004ac6] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Targeting Toggle */}
                        <div className="md:col-span-2 pt-4">
                           <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-[#edeeef]">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#004ac6]">visibility</span>
                                    <div>
                                        <p className="text-sm font-bold text-[#191c1d]">Hiển thị công khai</p>
                                        <p className="text-xs text-[#434655]">Cho phép khách hàng thấy mã này tại trang thanh toán/khuyến mãi.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6]"></div>
                                </label>
                           </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 bg-[#edeeef]/30 border-t border-[#edeeef] flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-[#434655] hover:bg-white rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#edeeef]"
                    >Hủy bỏ</button>
                    <button 
                        onClick={handleSubmit}
                        className="px-10 py-2.5 text-sm font-bold text-white bg-[#004ac6] hover:bg-[#003ea8] rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        {isEditMode ? 'Lưu thay đổi' : 'Kích hoạt ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherFormModal;
