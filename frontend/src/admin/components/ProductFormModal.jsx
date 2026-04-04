/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Cửa Sổ Biểu Mẫu Sản Phẩm (Product Form Modal).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "trạm sản xuất" nội dung sản phẩm. Admin thực hiện mọi thao tác Thêm mới (Create) hoặc Chỉnh sửa (Update) chi tiết hàng hóa tại đây.
 *    - Quản lý siêu dữ liệu phức tạp: Từ giá cả, kho hàng, danh mục 3 cấp cho đến các thuộc tính đặc thù như Size, Màu sắc và đặc biệt là Hình ảnh sản phẩm.
 *    - Đóng vai trò then chốt trong việc cung cấp dữ liệu cho "AI Stylist" thông qua các trường Style, Vibe và Trending.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Dữ liệu Hàng hóa (Product Catalog Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - FormData API for File Upload: Kỹ thuật bắt buộc phải biết! Thay vì gửi JSON, ta đóng gói dữ liệu vào `new FormData()`. Điều này cho phép gửi cả File ảnh (binary) và dữ liệu văn bản trong cùng một Request lên Server.
 *    - Advanced Image Handling with FileReader: Biến File ảnh từ máy tính người dùng thành chuỗi `Base64` để hiển thị bản xem trước (Preview) ngay lập tức. Giúp Admin biết ảnh có đẹp hay không trước khi bấm nút "Lưu".
 *    - Drag & Drop & Multi-image logic: Hỗ trợ kéo thả ảnh chuyên nghiệp. Quản lý đồng thời mảng ảnh cũ (`oldImages` từ Cloudinary) và mảng ảnh mới (Files đang chọn) để đảm bảo không bị mất dữ liệu khi cập nhật.
 *    - Dynamic Cascading Selects: Hệ thống danh mục 3 cấp thông minh. Khi chọn Cấp 1, Cấp 2 sẽ tự động lọc dữ liệu tương ứng. Khi thay đổi cấp cha, các cấp con sẽ tự động reset (`categoryLevel2: ''`) để tránh "râu ông nọ cắm cằm bà kia".
 *    - Tagging Input System: Tự xây dựng logic nhập "Sizes" và "Colors" bằng cách nhấn Enter. Mỗi tag là một Chip có nút "x" để xóa, lưu trữ dưới dạng mảng chuỗi (`Array of Strings`).
 *    - Auto-Discount Engine: Một `useEffect` liên tục "soi" Giá bán và Giá gốc. Chỉ cần Admin nhập giá, hệ thống tự tính toán % giảm giá và hiển thị nhãn "Giảm X%" trực quan ngay trên Form.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Object `product` (nếu sửa) và `initialData` (data gợi ý từ tab nhập kho).
 *    - Output: Một bản ghi sản phẩm hoàn chỉnh (bao gồm ảnh đã upload) được lưu vào Database.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `formData`: "Nhà kho" chứa toàn bộ thông tin sản phẩm đang sửa dở.
 *    - `imagesPreview`: Mảng chứa các đường dẫn ảnh để "vẽ" ra giao diện xem trước.
 *    - `tempTag`: Trạng thái tạm thời khi người dùng đang gõ dở một cái Size hoặc Màu.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleImageChange`: Đọc file ảnh và nạp vào hàng chờ upload.
 *    - `addTag` / `removeTag`: Thao tác với mảng thuộc tính Size/Màu.
 *    - `handleSubmit`: Bước quan trọng nhất - Đóng gói tất cả thành `FormData`, bọc JSON cho các Object lồng nhau, rồi "bắn" lên API.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Mở Modal -> Nếu là Sửa thì "đổ" dữ liệu cũ vào Form.
 *    - Bước 2: Admin gõ tên, chọn danh mục, chỉnh giá (Discount tự nhảy).
 *    - Bước 3: Kéo thả 3 tấm ảnh sản phẩm vào -> Xem trước ảnh hiện lên bên dưới.
 *    - Bước 4: Nhập "L, XL" vào ô Size -> Nhấn Lưu -> Hệ thống gửi `FormData` lên Server xử lý.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request: `POST /api/v1/admin/product/new` hoặc `PUT /api/v1/admin/product/:id`.
 *    - Database: Tác động vào Collection `Products`. Backend sẽ xử lý lưu ảnh lên Cloudinary và lưu Link vào MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `required` attribute: Đảm bảo Admin không quên nhập các thông tin cốt lõi.
 *    - AI Stylist Badge: Hiển thị mục cài đặt AI với các Icon riêng biệt để Admin chú ý gắn thuộc tính thời trang.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Đọc file hình ảnh (`FileReader.readAsDataURL`).
 *    - Dispatch Action gửi dữ liệu lên Server (Tác vụ cực kỳ nặng vì có đính kèm ảnh).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý cách dùng `JSON.stringify` bên trong `FormData`. Vì `FormData` chỉ nhận String hoặc Blob, nên các Object phức tạp (như danh mục) phải được "hóa thạch" thành chuỗi JSON trước khi gửi đi.
 *    - Logic Xóa ảnh (`removeImage`): Cần phân biệt rõ đang xóa ảnh mới chọn (xóa trong mảng `images`) hay xóa ảnh đã lưu ở server (xóa trong mảng `oldImages`).
 */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '../adminSLice/adminSlice';
import { toast } from 'react-toastify';
import { getLevel1Categories, getLevel2Categories, getLevel3Categories } from '../../constants/categories';
import { STYLE_OPTIONS } from '../../constants/aiSettings';
import '../styles/ProductFormModal.css';

function ProductFormModal({ product, onClose, initialData }) {
    const dispatch = useDispatch();
    const isEditMode = !!product;

    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        originalPrice: 0,
        stock: 0,
        categoryLevel1: '',
        categoryLevel2: '',
        categoryLevel3: '',
        brand: '',
        material: '',
        description: '',
        images: [],
        oldImages: [],
        sizes: [],
        colors: [],
        vibe: '',
        style: '',
        trending: false,
    });

    const [imagesPreview, setImagesPreview] = useState([]);
    const [tempTag, setTempTag] = useState({ size: '', color: '' });
    const [discountPercent, setDiscountPercent] = useState(0);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || 0,
                originalPrice: product.originalPrice || 0,
                stock: product.stock || 0,
                categoryLevel1: product.category?.level1 || '',
                categoryLevel2: product.category?.level2 || '',
                categoryLevel3: product.category?.level3 || '',
                brand: product.brand || '',
                material: product.material || '',
                description: product.description || '',
                images: [],
                oldImages: product.images || [],
                sizes: product.sizes || [],
                colors: product.colors || [],
                vibe: product.vibe || '',
                style: product.style || '',
                trending: product.trending || false,
            });
            setImagesPreview(product.images?.map(img => img.url) || []);
        } else if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [product, initialData]);

    // Calculate discount automatically
    useEffect(() => {
        const price = Number(formData.price);
        const original = Number(formData.originalPrice);
        if (original > price && price > 0) {
            const discount = Math.round(((original - price) / original) * 100);
            setDiscountPercent(discount);
        } else {
            setDiscountPercent(0);
        }
    }, [formData.price, formData.originalPrice]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'categoryLevel1') {
             setFormData(prev => ({ ...prev, categoryLevel1: value, categoryLevel2: '', categoryLevel3: '' }));
        } else if (name === 'categoryLevel2') {
             setFormData(prev => ({ ...prev, categoryLevel2: value, categoryLevel3: '' }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Combine existing images for upload logic
        // Note: In real app, you might want to append, not replace if multiple=true
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((old) => [...old, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        // Determine if we are removing a newly added image or an old image
        // This logic can be tricky if we mix them in preview.
        // Simplified: Just remove from preview and try to sync with formData
        // For now, let's just update preview and separate logic for submit might be needed if precise removal is required.
        // However, simplest way for 'images' array (files) is:

        // Note: This basic logic assumes imagesPreview maps 1-to-1 with 'oldImages + newImages'.
        // If we have mixed, index management is needed. 
        // Let's keep it simple: Remove from preview.

        const newPreviews = [...imagesPreview];
        newPreviews.splice(index, 1);
        setImagesPreview(newPreviews);

        // If index < oldImages.length, it's an old image
        // Else it's a new image
        // (This works if we concatenated old then new in preview)
        // But logic above: setImagesPreview(old) -> existing URLs.
        // handleImageChange -> Appends new base64.
        // So order is: [Old URL 1, Old URL 2, New Base64 1...]

        const oldImagesCount = formData.oldImages.length;

        if (index < oldImagesCount) {
            // Remove from oldImages
            const newOldImages = [...formData.oldImages];
            newOldImages.splice(index, 1);
            setFormData(prev => ({ ...prev, oldImages: newOldImages }));
        } else {
            // Remove from new images array
            const newImageIndex = index - oldImagesCount;
            const newImages = [...formData.images];
            newImages.splice(newImageIndex, 1);
            setFormData(prev => ({ ...prev, images: newImages }));
        }
    };

    const addTag = (type) => {
        const value = tempTag[type === 'sizes' ? 'size' : 'color'];
        if (!value.trim()) return;
        if (formData[type].includes(value.trim())) {
            toast.warning(`${value} đã tồn tại!`);
            return;
        }
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], value.trim()]
        }));
        setTempTag(prev => ({ ...prev, [type === 'sizes' ? 'size' : 'color']: '' }));
    };

    const handleTagKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(type);
        }
    };

    const removeTag = (type, valueToRemove) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(val => val !== valueToRemove)
        }));
    };

    // Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            // Trigger same logic as input change
            // Create simulated event or just call logic
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.readyState === 2) {
                        setImagesPreview((old) => [...old, reader.result]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const myForm = new FormData();
        myForm.set('name', formData.name);
        myForm.set('price', formData.price);
        myForm.set('originalPrice', formData.originalPrice);
        myForm.set('stock', formData.stock);
        myForm.set('category', JSON.stringify({
            level1: formData.categoryLevel1,
            level2: formData.categoryLevel2,
            level3: formData.categoryLevel3
        }));
        myForm.set('description', formData.description);
        myForm.set('brand', formData.brand);
        myForm.set('material', formData.material);

        formData.sizes.forEach((tag) => myForm.append('sizes', tag));
        formData.colors.forEach((tag) => myForm.append('colors', tag));

        myForm.set('vibe', formData.vibe || '');
        myForm.set('style', formData.style || '');
        myForm.set('trending', String(formData.trending === true));

        // Append new images
        formData.images.forEach((image) => {
            myForm.append('images', image);
        });

        // For Update: We might need to handle 'oldImages' retention logic depending on Backend.
        // If backend replaces all images, we need to send old ones back? 
        // Usually backend for update creates new array. 
        // If 'images' field is sent, it might overwrite.
        // If MERN logic is: Images are always added? Or replaced?
        // Let's assume standard behavior: we send images to ADD. 
        // If we want to KEEP old images, usually we don't need to send them again if backend logic supports partial update,
        // OR we send their Public IDs to keep?
        // Given the simple controller logic `findByIdAndUpdate(req.body)`, 
        // if we send only new images, old ones might be lost if `req.body.images` overwrites.
        // But `req.body` usually contains the JSON fields. Images are handled by `req.files`.
        // Thêm ảnh cũ (nếu có) để giữ lại khi update
        if (formData.oldImages && formData.oldImages.length > 0) {
            // Chúng ta có thể gửi từng thuộc tính hoặc cả object. 
            // Gửi dưới dạng chuỗi JSON là dễ nhất cho mảng object trong FormData.
            myForm.set('oldImages', JSON.stringify(formData.oldImages));
        }

        try {
            if (isEditMode) {
                await dispatch(updateProduct({ id: product._id, productData: myForm })).unwrap();
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                await dispatch(createProduct(myForm)).unwrap();
                toast.success('Thêm sản phẩm thành công!');
            }
            // Gọi onClose để đóng modal và làm mới dữ liệu ở component cha
            onClose();
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra khi lưu sản phẩm!');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="product-modal">
                {/* Header */}
                <div className="modal-header">
                    <h2>{isEditMode ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form className="product-form" onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="modal-grid">
                            {/* Left Column */}
                            <div>
                                {/* Basic Info */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Thông Tin Cơ Bản
                                    </h3>
                                    <div className="form-group">
                                        <label className="form-label required">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Nhập tên sản phẩm..."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Danh mục Cấp 1</label>
                                        <select
                                            name="categoryLevel1"
                                            className="form-select"
                                            value={formData.categoryLevel1}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Chọn Cấp 1</option>
                                            {getLevel1Categories().map(cat => (
                                                 <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{marginTop: '10px'}}>
                                        <label className="form-label required">Danh mục Cấp 2</label>
                                        <select
                                            name="categoryLevel2"
                                            className="form-select"
                                            value={formData.categoryLevel2}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.categoryLevel1}
                                        >
                                            <option value="">Chọn Cấp 2</option>
                                            {getLevel2Categories(formData.categoryLevel1).map(cat => (
                                                 <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{marginTop: '10px'}}>
                                        <label className="form-label required">Danh mục Cấp 3</label>
                                        <select
                                            name="categoryLevel3"
                                            className="form-select"
                                            value={formData.categoryLevel3}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.categoryLevel2}
                                        >
                                            <option value="">Chọn Cấp 3</option>
                                            {getLevel3Categories(formData.categoryLevel1, formData.categoryLevel2).map(cat => (
                                                 <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mô tả</label>
                                        <textarea
                                            name="description"
                                            className="form-textarea"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Mô tả chi tiết sản phẩm..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Giá & Kho
                                    </h3>
                                    <div className="pricing-grid">
                                        <div className="form-group">
                                            <label className="form-label required">Giá bán</label>
                                            <div className="input-with-suffix">
                                                <input
                                                    type="number"
                                                    name="price"
                                                    className="form-input"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                />
                                                <span className="input-suffix">VND</span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Giá gốc</label>
                                            <div className="input-with-suffix">
                                                <input
                                                    type="number"
                                                    name="originalPrice"
                                                    className="form-input"
                                                    value={formData.originalPrice}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                                <span className="input-suffix">VND</span>
                                            </div>
                                        </div>
                                    </div>
                                    {discountPercent > 0 && (
                                        <span className="discount-badge">Giảm {discountPercent}%</span>
                                    )}
                                </div>

                                {/* Inventory */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Kho Hàng
                                    </h3>
                                    <div className="form-group">
                                        <label className="form-label required">Số lượng tồn kho</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            className="form-input"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                {/* Attributes */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Thuộc Tính
                                    </h3>
                                    <div className="form-group">
                                        <label className="form-label">Thương hiệu</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            className="form-input"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            placeholder="VD: Nike, Local Brand..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Chất liệu</label>
                                        <input
                                            type="text"
                                            name="material"
                                            className="form-input"
                                            value={formData.material}
                                            onChange={handleChange}
                                            placeholder="VD: Cotton 100%..."
                                        />
                                    </div>

                                    {/* Sizes */}
                                    <div className="form-group">
                                        <label className="form-label">Kích thước (Size)</label>
                                        <div className="tags-container">
                                            {formData.sizes.map((tag, idx) => (
                                                <div key={idx} className="tag-chip">
                                                    {tag}
                                                    <span className="tag-remove" onClick={() => removeTag('sizes', tag)}>&times;</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tag-input-group">
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Nhập size (S, M...)"
                                                value={tempTag.size}
                                                onChange={(e) => setTempTag(prev => ({ ...prev, size: e.target.value }))}
                                                onKeyDown={(e) => handleTagKeyDown(e, 'sizes')}
                                            />
                                            <button type="button" className="tag-add-btn" onClick={() => addTag('sizes')}>Thêm</button>
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="form-group">
                                        <label className="form-label">Màu sắc</label>
                                        <div className="tags-container">
                                            {formData.colors.map((tag, idx) => (
                                                <div key={idx} className="tag-chip">
                                                    {tag}
                                                    <span className="tag-remove" onClick={() => removeTag('colors', tag)}>&times;</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tag-input-group">
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Nhập màu (Đỏ, Xanh...)"
                                                value={tempTag.color}
                                                onChange={(e) => setTempTag(prev => ({ ...prev, color: e.target.value }))}
                                                onKeyDown={(e) => handleTagKeyDown(e, 'colors')}
                                            />
                                            <button type="button" className="tag-add-btn" onClick={() => addTag('colors')}>Thêm</button>
                                        </div>
                                    </div>

                                    {/* AI Personal Stylist Fields */}
                                    <div className="form-section-block" style={{marginTop: '20px', borderTop: '1px dashed #ddd', paddingTop: '15px'}}>
                                        <h4 style={{fontSize: '0.9rem', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center'}}>
                                            <span style={{marginRight: '8px'}}>✨</span> AI Stylist Settings
                                        </h4>
                                        <div className="form-group">
                                            <label className="form-label">Phong cách (Style)</label>
                                            <select
                                                name="style"
                                                className="form-select"
                                                value={formData.style}
                                                onChange={handleChange}
                                            >
                                                <option value="">Chọn phong cách...</option>
                                                {STYLE_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.icon} {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Cảm hứng (Vibe)</label>
                                            <input
                                                type="text"
                                                name="vibe"
                                                className="form-input"
                                                value={formData.vibe}
                                                onChange={handleChange}
                                                placeholder="VD: Bí ẩn, Năng động, Quyến rũ..."
                                            />
                                        </div>
                                        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <input
                                                type="checkbox"
                                                name="trending"
                                                id="trending_check"
                                                checked={formData.trending}
                                                onChange={(e) => setFormData(prev => ({ ...prev, trending: e.target.checked }))}
                                                style={{width: '18px', height: '18px', cursor: 'pointer'}}
                                            />
                                            <label htmlFor="trending_check" style={{cursor: 'pointer', fontWeight: '500', color: '#d32f2f'}}>
                                                Sản phẩm HOT / Xu hướng 🔥
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Media */}
                                <div className="form-section-block">
                                    <h3 className="section-title">
                                        <svg className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Hình Ảnh
                                    </h3>
                                    <div
                                        className="image-upload-area"
                                        onClick={() => document.getElementById('imageInput').click()}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="upload-text">Click để tải ảnh hoặc kéo thả vào đây</p>
                                        <p className="upload-hint">Hỗ trợ JPG, PNG, GIF</p>
                                    </div>
                                    <input
                                        id="imageInput"
                                        type="file"
                                        name="images"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        multiple
                                        style={{ display: 'none' }}
                                    />

                                    <div className="image-preview-grid">
                                        {imagesPreview.map((img, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={img} alt={`Preview ${index}`} />
                                                <button
                                                    type="button"
                                                    className="image-remove"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy Bỏ</button>
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductFormModal;
