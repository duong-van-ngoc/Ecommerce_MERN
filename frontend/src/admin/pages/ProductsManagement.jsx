import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllProducts, deleteProduct } from '../adminSLice/adminSlice';
import '../styles/ProductsManagement.css';
import ProductFormModal from '../components/ProductFormModal';
import ImportProductModal from '../components/ImportProductModal';
import StockManagement from '../components/StockManagement';

/**
 * ProductsManagement - Nội dung trang quản lý sản phẩm (không có layout)
 */
function ProductsManagement() {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector(state => state.admin);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
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
    const handleAddNew = () => {
        setSelectedProduct(null);
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

    return (
        <div className="products-page-content">
            {/* Header */}
            <div className="products-header">
                <div>
                    <h2 className="products-page-title">Quản Lý Sản Phẩm</h2>
                    <p className="products-subtitle">Tổng cộng {products?.length || 0} sản phẩm</p>
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
                                {products && products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <img
                                                    src={product.images && product.images[0]?.url}
                                                    alt={product.name}
                                                    className="product-thumbnail"
                                                />
                                            </td>
                                            <td className="product-name">{product.name}</td>
                                            <td className="product-price">{Number(product.price).toLocaleString('vi-VN')}₫</td>
                                            <td>{product.category}</td>
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
                                            Chưa có sản phẩm nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'stock' && <StockManagement />}

            {/* Modal - ProductForm */}
            {showModal && (
                <ProductFormModal
                    product={selectedProduct}
                    onClose={() => setShowModal(false)}
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

