/**
 * ============================================================================
 * COMPONENT: ProductsManagement
 * ============================================================================
 * 1. Component là gì: 
 *    - Giao diện Admin quản lý Sản phẩm chính, bao gồm: Danh sách Sản phẩm, Tab Nhập Hàng (Stock) và các nút thao tác Thêm/Sửa/Xóa, Import.
 * 
 * 2. Props: 
 *    - Không nhận Props từ cha.
 * 
 * 3. State:
 *    - Local State: 
 *      + `showModal`, `showImportModal`: Boolean bật/tắt các Popup Modal.
 *      + `selectedProduct`: Lưu Object SP đang chọn để bind vào Form khi bấm Sửa.
 *      + `activeTab`: String ('list' | 'stock') quản lý đang ở Tab Danh sách hay Tab Kho.
 *    - Global State: `products`, `loading`, `error` từ `adminSlice`.
 * 
 * 4. Render lại khi nào:
 *    - Khi chuyển đổi Tab, bật/tắt hộp thoại (Modal).
 *    - Khi Call API (Fetch list sp, add/edit/delete thành công).
 * 
 * 5. Event handling:
 *    - `handleDelete`: Click -> Confirm window -> Dispatch xóa SP khỏi backend -> Báo Alert toast.
 *    - `handleEdit`, `handleAddNew`: Set state `selectedProduct` và bật popup Form.
 *    - `handleImportSuccess`: Callback sau khi upload file Excel thành công -> Tải lại Redux list Products.
 * 
 * 6. Conditional rendering:
 *    - `activeTab === 'list'`: Hiển thị Table các Sản phẩm, ngược lại mount Component `<StockManagement>`.
 *    - Check logic Show Modal: `showModal && <ProductFormModal...>` 
 *    - Table render dòng rỗng nếu `products.length === 0`.
 * 
 * 7. List rendering:
 *    - Duyệt `products.map()` tạo các `<tr>` với hình ảnh, tên, giá, số lượng tồn kho...
 * 
 * 8. Controlled input:
 *    - Tab navigation (`activeTab`) giống behavior Radio Button quản lý qua onClick setter.
 * 
 * 9. Lifting state up:
 *    - Quản lý Dispatch API qua Admin Redux Slice (Lấy danh sách, Xóa).
 * 
 * 10. Luồng hoạt động:
 *    - (1) Mount Component -> Redux gọi API fetchAllProducts. Trạng thái Loading spinner hiện.
 *    - (2) API trả Data -> Rendering Tab mặc định 'list'. Hiển thị Table SP.
 *    - (3) End-user thao tác:
 *        + Click Sửa/Thêm -> Bật File components Modal `ProductFormModal`, truyền Props.
 *        + Click Import -> Bật Component `ImportProductModal`.
 *        + Chuyển Tab "Nhập Hàng" -> Hide Table list, unmount/mount Element `StockManagement`.
 * ============================================================================
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllProducts, deleteProduct } from '../adminSLice/adminSlice';
import { formatVND } from '../../utils/formatCurrency';
import '../styles/ProductsManagement.css';
import ProductFormModal from '../components/ProductFormModal';
import ImportProductModal from '../components/ImportProductModal';
import StockManagement from '../components/StockManagement';

/**
 * ProductsManagement - Nội dung trang quản lý sản phẩm (không có layout)
 */
function ProductsManagement() {
    const dispatch = useDispatch();
    const { products, loading, error, globalSearchQuery } = useSelector(state => state.admin);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [initialFormData, setInitialFormData] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'stock'

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
            categoryStr.toLowerCase().includes(searchLower)
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
                        📥 Import Excel/CSV
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
                                                    const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="%23f4f4f2" width="60" height="60" rx="8"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a8a29e" font-size="12" font-family="sans-serif">No img</text></svg>';
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

export default ProductsManagement;

