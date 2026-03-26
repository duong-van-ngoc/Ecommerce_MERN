/**
 * ============================================================================
 * COMPONENT: StockManagement
 * ============================================================================
 * 1. Component là gì: 
 *    - Màn hình quản lý Cập nhật Tồn kho/Nhập hàng trong Admin. Có 2 luồng: Import Bulk qua Excel, và Update Quick tìm Product thủ công bằng Text.
 * 
 * 2. Props: 
 *    - Không Props.
 * 
 * 3. State:
 *    - Local State (useState):
 *      + `stockPreview`: Mảng dữ liệu chuẩn bị Import khi Parse Excel.
 *      + `stockFileName`, `importResult`: Theo dõi tên file và JSON Report từ Server trả về sau khi up.
 *      + `searchQuery`: Chuỗi Search keyword tay.
 *      + `stockInputs`: Object Map lưu quantity edit của ID productId (Vd: `{ "id1": 50 }`).
 *    - Global State (useSelector): API `loading` var & list array `searchResults` từ adminStore.
 * 
 * 4. Render lại khi nào:
 *    - Trạng thái Parse xong Excel hiện Preview Table. State List Search trả về. Trigger Gõ chữ Edit Quantity.
 * 
 * 5. Event handling:
 *    - Import file Excel (Tương tự ImportProduct dùng FileReader + sheetJS).
 *    - Submit Array data lên API bulk Stock.
 *    - `handleSearch`: Dispatch tìm Sản Phẩm match Keyword. `handleUpdateStock` lưu tay 1 con.
 * 
 * 6. Conditional rendering:
 *    - Hiện Report box Import (Số lg Update, Báo Lỗi ko tồn tại).
 *    - Hide / Show Bảng search & Preview Array.
 * 
 * 7. List rendering:
 *    - `stockPreview.map`, `importResult.details.map`, `searchResults.map` render tr (row) bảng dữ liệu.
 * 
 * 8. Controlled input:
 *    - List Input số lượng Tồn kho Map Array dựa vào object local State `stockInputs[id]`.
 *    - Input File ẩn, `searchQuery` Textbox.
 * 
 * 9. Lifting state up:
 *    - Gởi API bulk Import Tồn kho / Single Update Tồn kho thông qua `adminSlice.js` (Thunk).
 * 
 * 10. Luồng hoạt động:
 *    - (1) User có 2 Lựa Chọn Giao Diện chính.
 *    - (2) Lựa chọn A (Excel): Chọn File XLS -> Parse ra Array list -> Gởi Redux bulk API -> Hiện Box Detail Update.
 *    - (3) Lựa chọn B (Tay): Search Textbar -> API Request trả List Sản Phẩm -> Lưu kết quả vô `searchResults`.
 *    - (4) Flow (B): Thao tác gõ Box cộng trừ thêm tồn kho, bấm Tick Update 1 sản phẩm 1 lúc đẩy lên API Mongoose Update. 
 * ============================================================================
 */
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importStock, searchAdminProducts, updateSingleStock } from '../adminSLice/adminSlice';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import '../styles/StockManagement.css';

/**
 * StockManagement - Tab quản lý nhập hàng
 */
function StockManagement({ onAddNew }) {
    const dispatch = useDispatch();
    const { loading, searchResults } = useSelector(state => state.admin);
    const fileInputRef = useRef(null);

    // Import stock states
    const [stockPreview, setStockPreview] = useState([]);
    const [stockFileName, setStockFileName] = useState('');
    const [importResult, setImportResult] = useState(null);

    // Manual update states
    const [searchQuery, setSearchQuery] = useState('');
    const [stockInputs, setStockInputs] = useState({}); // { productId: quantity }

    // ===== IMPORT STOCK FROM FILE =====
    const handleStockFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStockFileName(file.name);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    toast.error('File không chứa dữ liệu');
                    return;
                }

                // Validate
                const validData = jsonData.filter(row => row.name && row.quantity && !isNaN(row.quantity) && Number(row.quantity) > 0);
                if (validData.length === 0) {
                    toast.error('File cần có cột "name" và "quantity" hợp lệ');
                    return;
                }

                setStockPreview(validData);
            } catch (err) {
                toast.error('Không thể đọc file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImportStock = async () => {
        if (stockPreview.length === 0) return;

        try {
            const items = stockPreview.map(row => ({
                name: row.name,
                quantity: Number(row.quantity)
            }));

            const result = await dispatch(importStock(items)).unwrap();
            setImportResult(result);
            toast.success(`✅ Cập nhật ${result.updated} sản phẩm thành công!`);
            if (result.notFound?.length > 0) {
                toast.warning(`⚠️ ${result.notFound.length} sản phẩm không tìm thấy`);
            }
        } catch (err) {
            toast.error(err || 'Import tồn kho thất bại');
        }
    };

    const handleDownloadStockTemplate = () => {
        const template = [
            { name: 'Áo khoác gió', quantity: 100 },
            { name: 'Quần jean slim', quantity: 50 },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stock');
        XLSX.writeFile(wb, 'template_nhap_hang.xlsx');
    };

    // ===== MANUAL STOCK UPDATE =====
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast.warning('Nhập tên sản phẩm để tìm kiếm');
            return;
        }
        dispatch(searchAdminProducts(searchQuery.trim()));
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleStockInputChange = (productId, value) => {
        setStockInputs(prev => ({ ...prev, [productId]: value }));
    };

    const handleUpdateStock = async (productId) => {
        const quantity = Number(stockInputs[productId]);
        if (!quantity || quantity <= 0) {
            toast.warning('Nhập số lượng hợp lệ (> 0)');
            return;
        }

        try {
            await dispatch(updateSingleStock({ id: productId, quantity })).unwrap();
            toast.success('✅ Cập nhật tồn kho thành công!');
            setStockInputs(prev => ({ ...prev, [productId]: '' }));
        } catch (err) {
            toast.error(err || 'Cập nhật thất bại');
        }
    };

    return (
        <div className="stock-management">
            {/* Section 1: Import from file */}
            <div className="stock-section">
                <div className="stock-section-header">
                    <h3>📥 Nhập hàng từ file Excel/CSV</h3>
                    <button className="btn-download-template-sm" onClick={handleDownloadStockTemplate}>
                        📥 Tải template
                    </button>
                </div>

                <div className="stock-upload-row">
                    <div
                        className="stock-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleStockFileChange}
                            hidden
                        />
                        <span>📎 {stockFileName || 'Chọn file (name, quantity)'}</span>
                    </div>
                    <button
                        className="btn-import-stock"
                        onClick={handleImportStock}
                        disabled={loading || stockPreview.length === 0}
                    >
                        {loading ? '⏳...' : `📥 Import (${stockPreview.length})`}
                    </button>
                </div>

                {/* Stock Preview */}
                {stockPreview.length > 0 && (
                    <div className="stock-preview">
                        <table className="stock-preview-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockPreview.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{row.name}</td>
                                        <td className="qty-cell">+{Number(row.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Import Result */}
                {importResult && (
                    <div className="import-result-box">
                        <p className="result-success">✅ Cập nhật: {importResult.updated} sản phẩm</p>
                        {importResult.notFound?.length > 0 && (
                            <div className="result-notfound">
                                <p>❌ Không tìm thấy:</p>
                                <ul>
                                    {importResult.notFound.map((item, i) => (
                                        <li key={i} className="notfound-item">
                                            <span>{item.name} — {item.reason}</span>
                                            <button 
                                                className="btn-add-missing"
                                                onClick={() => onAddNew({ name: item.name })}
                                                title="Thêm sản phẩm này vào hệ thống"
                                            >
                                                ➕ Thêm mới
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {importResult.details?.length > 0 && (
                            <div className="result-details">
                                <p>📊 Chi tiết:</p>
                                <table className="result-table">
                                    <thead>
                                        <tr>
                                            <th>Tên SP</th>
                                            <th>Tồn cũ</th>
                                            <th>Nhập thêm</th>
                                            <th>Tồn mới</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResult.details.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.name}</td>
                                                <td>{item.oldStock}</td>
                                                <td className="qty-add">+{item.addedQty}</td>
                                                <td className="qty-new">{item.newStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="stock-divider" />

            {/* Section 2: Manual update */}
            <div className="stock-section">
                <h3>🔍 Cập nhật tồn kho thủ công</h3>

                <div className="stock-search-row">
                    <input
                        type="text"
                        className="stock-search-input"
                        placeholder="Tìm tên sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button className="btn-search" onClick={handleSearch} disabled={loading}>
                        🔍 Tìm
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="stock-search-results">
                        <table className="stock-results-table">
                            <thead>
                                <tr>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Tồn kho</th>
                                    <th>Nhập thêm</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((product) => (
                                    <tr key={product._id}>
                                        <td className="product-name-cell">
                                            {product.images?.[0]?.url && (
                                                <img src={product.images[0].url} alt="" className="mini-thumb" />
                                            )}
                                            {product.name}
                                        </td>
                                        <td>{typeof product.category === 'object' ? product.category?.level1 : product.category}</td>
                                        <td>
                                            <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="stock-qty-input"
                                                placeholder="0"
                                                min="1"
                                                value={stockInputs[product._id] || ''}
                                                onChange={(e) => handleStockInputChange(product._id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn-update-stock"
                                                onClick={() => handleUpdateStock(product._id)}
                                                disabled={loading || !stockInputs[product._id]}
                                            >
                                                ✅
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {searchQuery && searchResults.length === 0 && !loading && (
                    <div className="no-results-container">
                        <p className="no-results">Không tìm thấy sản phẩm nào khớp với "{searchQuery}"</p>
                        <button 
                            className="btn-add-notfound"
                            onClick={() => onAddNew({ name: searchQuery })}
                        >
                            ➕ Thêm mới sản phẩm này
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StockManagement;
