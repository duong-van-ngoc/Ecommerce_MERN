/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Trang Quản Lý Sản Phẩm Toàn Diện (Products Management Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trung tâm điều phối mọi hoạt động liên quan đến hàng hóa trong cửa hàng.
 *    - Quản lý hai phân hệ chính thông qua các Tab: "Danh sách sản phẩm" (Để chỉnh sửa thông tin) và "Nhập hàng" (Để quản lý tồn kho).
 *    - Tích hợp các công cụ mạnh mẽ: Tìm kiếm nâng cao, Lọc theo phong cách (Style), và Nhập dữ liệu hàng loạt từ Excel (Import).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Hàng hóa & Kho vận (Product & Inventory Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Tab-based UI Architecture: Sử dụng trạng thái `activeTab` để thay đổi nội dung trang mà không cần tải lại hoặc nhảy Route. Giúp Admin làm việc tập trung hơn.
 *    - Advanced Multi-layer Filtering: Logic lọc sản phẩm cực kỳ thông minh. Nó có thể tìm kiếm cùng lúc theo Tên, Phong cách (Style), Vibe (tâm trạng) và thậm chí là theo từng cấp danh mục (Category names).
 *    - Component Composition: File này là "nhạc trưởng" lắp ghép các thành phần lại với nhau. Nó gọi đến `ProductFormModal` để sửa, `ImportProductModal` để nhập hàng loạt, và `StockManagement` để soi kho.
 *    - Redux Thunk & Promise Unwrapping: Sử dụng `unwrap()` khi Dispatch Action xóa. Đây là cách hiện đại để xử lý logic "Nếu xóa thành công ở Server thì báo Toast xanh, lỗi thì báo Toast đỏ" ngay tại chỗ mà không cần viết quá nhiều `useEffect`.
 *    - Dynamic Visual Cues: Sử dụng màu sắc để "cảnh báo" Admin: Chữ đỏ cho sản phẩm sắp hết hàng (`stock < 10`), nhãn "HOT" cho sản phẩm xu hướng, và ảnh Placeholder SVG nếu sản phẩm bị thiếu ảnh.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mảng `products` từ Redux và từ khóa tìm kiếm (`globalSearchQuery`).
 *    - Output: Một hệ thống quản lý kho hàng đa năng và trực quan.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `showModal`, `showImportModal`: Điều khiển việc đóng/mở các cửa sổ Popup.
 *    - `activeTab`: Quyết định đang xem danh sách hay đang làm việc với kho hàng.
 *    - `filterStyle`: Bộ lọc theo phong cách thời trang (Minimalist, Streetwear,...).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleDelete`: Xử lý xóa sản phẩm kèm bước xác nhận bảo mật.
 *    - `filteredProducts`: Hàm "lọc dầu" dữ liệu, đảm bảo Admin luôn nhìn thấy đúng thứ mình đang tìm.
 *    - `handleImportSuccess`: Hành động "làm mới" (refresh) lại toàn bộ danh sách ngay sau khi nạp file Excel thành công.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khi mở trang, tự động gọi API lấy toàn bộ danh sách sản phẩm.
 *    - Bước 2: Hiển thị bảng danh sách sản phẩm kèm ảnh Thumbnail.
 *    - Bước 3: Admin có thể lọc, tìm kiếm hoặc chuyển sang Tab "Nhập hàng" để xem biểu đồ kho.
 *    - Bước 4: Khi bấm Sửa hoặc Thêm, một Modal sẽ hiện lên để thao tác mà không làm mất trạng thái của trang hiện tại.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request: `GET /api/v1/admin/products` và `DELETE /api/v1/admin/product/:id`.
 *    - Database: Tác động trực tiếp vào Collection `Products` trong MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Empty State Handling: Nếu không tìm thấy kết quả, hệ thống hiển thị thông báo "Không tìm thấy" thay vì để bảng trắng trơn.
 *    - Thumbnail Guard: Sử dụng hàm `onError` và chuỗi `placeholder` SVG để đảm bảo giao diện không bao giờ bị "vỡ" nếu ảnh từ server gặp sự cố.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Quá trình Fetching dữ liệu sản phẩm.
 *    - Quá trình nộp file Import Excel (Bất đồng bộ thông qua Componet con).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `filteredProducts` là trái tim của file. Nếu bạn thêm thuộc tính mới cho sản phẩm (ví dụ: `material`), hãy thêm nó vào logic tìm kiếm ở đây.
 *    - `btn-clear-filter`: Luôn cung cấp nút "Xóa lọc" để Admin quay về trạng thái ban đầu nhanh nhất.
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllProducts, deleteProduct } from '@/admin/adminSLice/adminSlice';
import { selectAdminProducts } from '@/features/admin/state/adminSelectors';
import { formatVND } from '@/shared/utils/formatCurrency';
import '@/pages/admin/styles/ProductsManagement.css';
import ProductFormModal from '@/admin/components/ProductFormModal';
import ImportProductModal from '@/admin/components/ImportProductModal';
import StockManagement from '@/admin/components/StockManagement';
import { STYLE_OPTIONS } from '@/shared/constants/aiSettings';

/**
 * ProductsManagement - Nội dung trang quản lý sản phẩm (không có layout)
 */
function ProductsManagementView() {
    const dispatch = useDispatch();
    const { products, loading, error, globalSearchQuery } = useSelector(selectAdminProducts);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [initialFormData, setInitialFormData] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'stock'
    const [filterStyle, setFilterStyle] = useState('');

    // Fetch products khi component mount
    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    // Hiển thị error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Xử lý xóa sản phẩm
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success('Xóa sản phẩm thành công!');
            } catch (err) {
                toast.error(err || 'Xóa sản phẩm thất bại');
            }
        }
    };

    // Xử lý edit
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    // Xử lý add new
    const handleAddNew = (data = null) => {
        setSelectedProduct(null);
        setInitialFormData(data);
        setShowModal(true);
    };

    // Reload products after import
    const handleImportSuccess = () => {
        dispatch(fetchAllProducts());
    };

    if (loading && products.length === 0) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    // Filter products based on global search query
    const filteredProducts = products.filter(product => {
        if (!globalSearchQuery) return true;
        const searchLower = globalSearchQuery.toLowerCase();
        
        // Cố gắng lấy chuỗi danh mục an toàn
        let categoryStr = '';
        if (typeof product.category === 'string') {
            categoryStr = product.category;
        } else if (product.category && typeof product.category === 'object') {
            categoryStr = product.category.level1 || '';
        }

        return (
            (product.name && product.name.toLowerCase().includes(searchLower)) ||
            (product.style && product.style.toLowerCase().includes(searchLower)) ||
            (product.vibe && product.vibe.toLowerCase().includes(searchLower)) ||
            categoryStr.toLowerCase().includes(searchLower)
        ) && (
            filterStyle === '' || product.style === filterStyle
        );
    });

    return (
        <div className="products-page-content">
            {/* Header */}
            <div className="products-header">
                <div>
                    <h2 className="products-page-title">Quản Lý Sản Phẩm</h2>
                    <p className="products-subtitle">Hiển thị {filteredProducts?.length || 0} / Tổng số {products?.length || 0} sản phẩm</p>
                </div>
                <div className="products-header-actions">
                    <button className="btn-import-product" onClick={() => setShowImportModal(true)}>
                        📥 Nhập Excel/CSV
                    </button>
                    <button className="btn-add-product" onClick={handleAddNew}>
                        ➕ Thêm Sản Phẩm
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="products-tabs">
                <button
                    className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    📦 Danh sách sản phẩm
                </button>
                <button
                    className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                >
                    📊 Nhập hàng
                </button>
                {activeTab === 'list' && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>Lọc phong cách:</span>
                        <select 
                            className="form-select" 
                            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={filterStyle}
                            onChange={(e) => setFilterStyle(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {STYLE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button 
                            className="btn-clear-filter"
                            style={{ background: 'none', border: 'none', color: '#004aeb', fontSize: '13px', cursor: 'pointer', display: filterStyle ? 'block' : 'none' }}
                            onClick={() => setFilterStyle('')}
                        >
                            Xóa lọc
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === 'list' && (
                <>
                    {/* Products Table */}
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Hình Ảnh</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Giá</th>
                                    <th>Phong cách</th>
                                    <th>Danh Mục</th>
                                    <th>Kho</th>
                                    <th>Đánh Giá</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts && filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                {(() => {
                                                    const imgUrl = product.images?.[0]?.url;
                                                    const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="%23f4f4f2" width="60" height="60" rx="8"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a8a29e" font-size="12" font-family="sans-serif">Chưa có ảnh</text></svg>';
                                                    return (
                                                        <img
                                                            src={imgUrl && imgUrl.startsWith('http') ? imgUrl : placeholder}
                                                            alt={product.name}
                                                            className="product-thumbnail"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = placeholder;
                                                            }}
                                                        />
                                                    );
                                                })()}
                                            </td>
                                            <td className="product-name">{product.name}</td>
                                            <td className="product-price">{formatVND(product.price)}</td>
                                            <td>
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                                    <span className={`style-badge ${!product.style ? 'no-style' : ''}`}>
                                                        {product.style || 'Chưa gắn tag'}
                                                    </span>
                                                    {product.trending && (
                                                        <span className="trending-tag">HOT</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{typeof product.category === 'object' ? product.category?.level1 : product.category}</td>
                                            <td>
                                                <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="rating">
                                                    ⭐ {product.ratings?.toFixed(1) || 0} ({product.numOfReviews || 0})
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(product)}
                                                        title="Sửa"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(product._id)}
                                                        title="Xóa"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-products">
                                            {globalSearchQuery 
                                                ? `Không tìm thấy sản phẩm nào khớp với "${globalSearchQuery}"` 
                                                : "Chưa có sản phẩm nào"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'stock' && <StockManagement onAddNew={handleAddNew} />}

            {/* Modal - ProductForm */}
            {showModal && (
                <ProductFormModal
                    product={selectedProduct}
                    initialData={initialFormData}
                    onClose={() => {
                        setShowModal(false);
                        setInitialFormData(null);
                    }}
                />
            )}

            {/* Modal - Import Products */}
            {showImportModal && (
                <ImportProductModal
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={handleImportSuccess}
                />
            )}
        </div>
    );
}

export default ProductsManagementView;
