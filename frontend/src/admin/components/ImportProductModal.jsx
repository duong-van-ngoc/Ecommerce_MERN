/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Cửa Sổ Nhập Sản Phẩm Hàng Loạt (Import Product Modal).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Giải quyết bài toán "nhập liệu quy mô lớn". Thay vì Admin phải gõ tay từng sản phẩm, họ chỉ cần chuẩn bị một file Excel/CSV và tải lên.
 *    - Đóng vai trò là một "bộ lọc" thông minh: Kiểm tra lỗi định dạng, kiểm tra trùng lặp SKU và cho phép Admin chọn cách xử lý (Cộng dồn kho hay Ghi đè dữ liệu).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Dữ liệu Hàng hóa (Product Catalog Management) - Nhánh Xử lý hàng loạt (Batch Processing).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - SheetJS (XLSX Library): Thư viện hàng đầu để thao tác với file Excel trong JavaScript. Dùng để chuyển đổi từ file Binary sang mảng JSON (`sheet_to_json`).
 *    - Smart Header Detection: Hàm `findHeaderRow` tự động lùng sục trong 20 dòng đầu của file Excel để tìm dòng chứa tiêu đề (Name, SKU...). Kỹ thuật này giúp hệ thống linh hoạt, chấp nhận cả những file Excel có vài dòng ghi chú ở đầu trang.
 *    - SKU Pre-check Mechanism: Trước khi Import, hệ thống gửi toàn bộ SKU lên Server để "soi" xem cái nào có rồi, cái nào chưa. Đây là bước cực kỳ quan trọng để tránh tạo ra dữ liệu rác hoặc ghi đè nhầm hàng hóa.
 *    - Validation Logic: Kiểm tra tính hợp lệ của từng dòng (Giá phải là số > 0, Kho không được âm, thiếu trường bắt buộc...). Trả về danh sách lỗi chi tiết kèm số dòng để Admin dễ dàng sửa lại file.
 *    - Bulk Update Strategies: Cung cấp 3 chế độ cho sản phẩm đã tồn tại: 
 *      + Accumulate: Cộng dồn số lượng vào kho cũ.
 *      + Overwrite: Xóa thông tin cũ, thay bằng thông tin mới từ file.
 *      + Skip: Giữ nguyên sản phẩm cũ, không làm gì cả.
 *    - FileReader API: Đọc nội dung file từ máy tính người dùng dưới dạng `ArrayBuffer` để xử lý bất đồng bộ.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: File `.xlsx`, `.xls`, hoặc `.csv` từ máy tính Admin.
 *    - Output: Một Request "Bulk Import" được gửi lên Backend để cập nhật hàng loạt hàng nghìn sản phẩm cùng lúc.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `previewData`: "Bản nháp" dữ liệu sau khi parse, dùng để hiển thị lên bảng cho Admin kiểm tra trước khi bấm nút chốt.
 *    - `validationErrors`: "Danh sách đen" các dòng bị lỗi định dạng.
 *    - `fileName`: Lưu tên file để hiển thị lên UI, tạo cảm giác thân thiện.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleFileChange`: Trái tim của quá trình đọc file. Thực hiện Parse -> Map trường -> Validate -> Pre-check trùng lặp.
 *    - `handleImport`: Gom tất cả các dòng hợp lệ (valid) và gửi API.
 *    - `handleDownloadTemplate`: Tạo và tải xuống file Excel mẫu chuẩn 2024 (bao gồm cả các trường AI Stylist cho Admin).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin tải file mẫu -> Điền dữ liệu sản phẩm.
 *    - Bước 2: Tải file lên -> Hệ thống Parse ra Table Preview.
 *    - Bước 3: Nhìn bảng Preview: Dòng đỏ là lỗi (cần sửa file), dòng vàng là đã có (chọn chế độ cập nhật), dòng xanh là mới tinh.
 *    - Bước 4: Admin chọn "Cộng dồn" cho các SP cũ -> Bấm "Import" -> Kết thúc.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request 1 (Pre-check): `POST /api/v1/admin/products/import-precheck` (Gửi mảng SKU).
 *    - Request 2 (Bulk Import): `POST /api/v1/admin/products/import` (Gửi mảng Data khổng lồ).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Preview Table: Hiển thị tối đa 50 dòng đầu để tránh làm đơ trình duyệt nếu file có hàng vạn sản phẩm.
 *    - Import Button: Bị disable nếu file không có dòng nào hợp lệ (`validCount === 0`).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Đọc file (`reader.onload`).
 *    - Các lời gọi API `unwrap()` để check SKU và thực hiện Import.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - File này xử lý dữ liệu thô từ Excel, nên việc "Mapping" tiêu đề cột là cực kỳ nhạy cảm. Lưu ý mảng `REQUIRED_FIELDS` và các biến thể của tên cột (ví dụ: 'name' hay 'Tên sản phẩm' đều phải được hiểu là một).
 *    - Chế độ `accumulate` (Cộng dồn) là tính năng cực kỳ hữu ích cho các đợt nhập thêm hàng mới về kho.
 */
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importProducts, importProductsPreCheck } from '../adminSLice/adminSlice';
import { toast } from 'react-toastify';
import { formatVND } from '../../utils/formatCurrency';
import * as XLSX from 'xlsx';
import '../styles/ImportProductModal.css';

/**
 * ImportProductModal - Modal import sản phẩm từ Excel/CSV
 */
function ImportProductModal({ onClose, onImportSuccess }) {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.admin);
    const fileInputRef = useRef(null);

    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    const REQUIRED_FIELDS = ['sku', 'name', 'description', 'price', 'stock', 'category_level1'];

    // Hàm tìm dòng chứa Header thực sự
    const findHeaderRow = (rows) => {
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
            const row = rows[i];
            if (Array.isArray(row) && row.some(cell =>
                typeof cell === 'string' &&
                (cell.toLowerCase().includes('name') || cell.toLowerCase().includes('tên'))
            )) {
                return i;
            }
        }
        return 0; // Mặc định là dòng đầu nếu không tìm thấy
    };

    // Parse file Excel/CSV
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Chỉ hỗ trợ file .xlsx, .xls hoặc .csv');
            return;
        }

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Đọc thô toàn bộ rows để tìm Header
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const headerIdx = findHeaderRow(rawRows);

                // Parse lại dữ liệu từ dòng Header đã tìm thấy
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    range: headerIdx,
                    defval: ''
                });

                if (jsonData.length === 0) {
                    toast.error('File không chứa dữ liệu');
                    return;
                }

                // Map and Validate each row
                const errors = [];
                const mappedData = jsonData.map((row, idx) => {
                    const mappedRow = { ...row };

                    // Linh hoạt map tiêu đề cho category (bao gồm cả định dạng category.level1)
                    if (!mappedRow.sku) {
                        mappedRow.sku = row['sku'] || row['SKU'] || row['Mã SP'] || row['Mã sản phẩm'];
                    }
                    if (!mappedRow.category_level1) {
                        mappedRow.category_level1 = row['category_level1'] || row['category.level1'] || row['Category Level 1'] || row['Danh mục cấp 1'] || row['Danh mục Cấp 1'] || row['level1'];
                    }
                    if (!mappedRow.category_level2) {
                        mappedRow.category_level2 = row['category_level2'] || row['category.level2'] || row['Category Level 2'] || row['Danh mục cấp 2'] || row['Danh mục Cấp 2'] || row['level2'];
                    }
                    if (!mappedRow.category_level3) {
                        mappedRow.category_level3 = row['category_level3'] || row['category.level3'] || row['Category Level 3'] || row['Danh mục cấp 3'] || row['Danh mục Cấp 3'] || row['level3'];
                    }

                    // --- Mapping AI Stylist fields ---
                    if (!mappedRow.vibe) {
                        mappedRow.vibe = row['vibe'] || row['Vibe'] || row['Cảm hứng'] || row['Cảm xúc'];
                    }
                    if (!mappedRow.style) {
                        mappedRow.style = row['style'] || row['Style'] || row['Phong cách'] || row['Gu thời trang'];
                    }
                    if (mappedRow.trending === undefined) {
                        mappedRow.trending = row['trending'] || row['Trending'] || row['Xu hướng'] || row['Hot'] || row['Nổi bật'];
                    }

                    // Thỏa mãn validation cũ nếu file có field 'category' hoặc 'Danh mục'
                    if (!mappedRow.category_level1) {
                        const oldCat = row['category'] || row['Category'] || row['Danh mục'];
                        if (oldCat) mappedRow.category_level1 = oldCat;
                    }

                    const missing = REQUIRED_FIELDS.filter(f => !mappedRow[f] && mappedRow[f] !== 0);
                    if (missing.length > 0) {
                        errors.push({ row: idx + 1, name: mappedRow.name || '', message: `Thiếu: ${missing.join(', ')}` });
                    }
                    if (mappedRow.price && (isNaN(mappedRow.price) || Number(mappedRow.price) <= 0)) {
                        errors.push({ row: idx + 1, name: mappedRow.name || '', message: 'Giá không hợp lệ' });
                    }
                    if (mappedRow.stock !== '' && (isNaN(mappedRow.stock) || Number(mappedRow.stock) < 0)) {
                        errors.push({ row: idx + 1, name: mappedRow.name || '', message: 'Số lượng không hợp lệ' });
                    }
                    return mappedRow;
                });

                const validSkus = mappedData
                    .filter((_, idx) => !errors.find(e => e.row === idx + 1) && _.sku)
                    .map(r => String(r.sku).trim());

                let preCheckData = [];
                if (validSkus.length > 0) {
                    try {
                        const preCheckRes = await dispatch(importProductsPreCheck(validSkus)).unwrap();
                        preCheckData = preCheckRes.results || [];
                    } catch (e) {
                        toast.warning('Không thể kiểm tra sản phẩm trùng lặp theo SKU');
                    }
                }

                const finalData = mappedData.map((row, idx) => {
                    const existing = preCheckData.find(item => item.sku === String(row.sku).trim() && item.exists);
                    if (existing) {
                        return { ...row, _isExisting: true, _existingName: existing.name, _existingStock: existing.currentStock, _existingId: existing._id, _importMode: 'accumulate' };
                    }
                    return { ...row, _isExisting: false, _importMode: 'create' };
                });

                setPreviewData(finalData);
                setValidationErrors(errors);
            } catch (err) {
                toast.error('Không thể đọc file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleModeChange = (index, mode) => {
        setPreviewData(prev => {
            const newData = [...prev];
            newData[index] = { ...newData[index], _importMode: mode };
            return newData;
        });
    };

    // Handle import
    const handleImport = async () => {
        const errorRows = new Set(validationErrors.map(e => e.row));
        const validData = previewData.filter((row, idx) => !errorRows.has(idx + 1) && row._importMode !== 'skip');

        if (validData.length === 0) {
            toast.error('Không có sản phẩm hợp lệ để import (hoặc tất cả đã bị bỏ qua)');
            return;
        }

        try {
            const result = await dispatch(importProducts(validData)).unwrap();

            // Build success message showing both imported and updated counts
            const messages = [];
            if (result.imported > 0) messages.push(`🆕 Thêm mới ${result.imported} sản phẩm`);
            if (result.updated > 0) messages.push(`🔄 Cập nhật ${result.updated} sản phẩm`);
            toast.success(`✅ ${messages.join(', ')}`);

            if (result.failed > 0) {
                toast.warning(`⚠️ ${result.failed} sản phẩm lỗi`);
            }
            onImportSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err || 'Import thất bại');
        }
    };

    // Generate and download template
    const handleDownloadTemplate = () => {
        const template = [
            {
                sku: 'AOM01', name: 'Áo thun nam basic', description: 'Áo thun cotton mát mẻ',
                price: 150000, originalPrice: 200000, stock: 100,
                category_level1: 'NAM', category_level2: 'Áo', category_level3: 'Thun',
                brand: 'Coolmate', material: 'Cotton',
                sizes: 'S,M,L,XL', colors: 'Đen,Trắng,Navy',
                vibe: 'Năng động, Thoải mái', style: 'Streetwear', trending: 'true'
            },
            {
                sku: 'TXN01', name: 'Túi xách nữ thời trang', description: 'Túi xách da PU cao cấp',
                price: 450000, originalPrice: 600000, stock: 50,
                category_level1: 'PHỤ KIỆN & GIÀY DÉP', category_level2: 'Phụ kiện Nữ', category_level3: 'Túi xách',
                brand: 'Juno', material: 'Da PU',
                sizes: 'Free', colors: 'Đen,Đỏ,Be',
                vibe: 'Thanh lịch, Sang trọng', style: 'Office', trending: 'false'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, 'template_import_san_pham.xlsx');
    };

    const errorRows = new Set(validationErrors.map(e => e.row));
    const validCount = previewData.filter((row, idx) => !errorRows.has(idx + 1) && row._importMode !== 'skip').length;
    const errorCount = validationErrors.length;

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="import-modal-header">
                    <h2>📥 Import Sản Phẩm Từ Excel/CSV <span style={{ fontSize: '12px', color: '#999' }}>(v2.0)</span></h2>
                    <button className="import-modal-close" onClick={onClose}>×</button>
                </div>

                {/* Upload Area */}
                <div className="import-upload-area" onClick={() => fileInputRef.current?.click()}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        hidden
                    />
                    {fileName ? (
                        <div className="upload-file-info">
                            <span className="upload-icon">📄</span>
                            <span className="upload-filename">{fileName}</span>
                            <span className="upload-change">Click để đổi file</span>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <span className="upload-icon">📎</span>
                            <p>Kéo thả hoặc click để chọn file</p>
                            <span className="upload-hint">Hỗ trợ: .xlsx, .xls, .csv</span>
                        </div>
                    )}
                </div>

                {/* Preview Table */}
                {previewData.length > 0 && (
                    <>
                        <div className="import-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span className="stat-valid">✅ {validCount} hợp lệ</span>
                                {errorCount > 0 && <span className="stat-error">❌ {errorCount} lỗi</span>}
                                <span className="stat-total">📦 Tổng: {previewData.length} dòng</span>
                            </div>

                            {previewData.some(row => row._isExisting) && (
                                <div className="bulk-action" style={{ background: '#f8f9fa', padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                    <label style={{ marginRight: '8px', fontSize: '13px', fontWeight: 'bold', color: '#333' }}> Áp dụng cho SP cũ:</label>
                                    <select
                                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                                        onChange={(e) => {
                                            const mode = e.target.value;
                                            if (!mode) return;
                                            setPreviewData(prev => prev.map(row =>
                                                row._isExisting ? { ...row, _importMode: mode } : row
                                            ));
                                        }}
                                    >
                                        <option value="">-- Chọn hành động --</option>
                                        <option value="accumulate">Cập nhật (Cộng dồn)</option>
                                        <option value="overwrite">Cập nhật (Ghi đè)</option>
                                        <option value="skip">Bỏ qua</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="import-preview-container">
                            <table className="import-preview-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                        <th>SKU</th>
                                        <th>Tên SP</th>
                                        <th>Giá</th>
                                        <th>Style</th>
                                        <th>Trending</th>
                                        <th>Kho</th>
                                        <th>Danh mục 1</th>
                                        <th>Thương hiệu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 50).map((row, idx) => {
                                        const rowError = validationErrors.find(e => e.row === idx + 1);
                                        return (
                                            <tr key={idx} className={rowError ? 'row-error' : row._isExisting ? 'row-warning' : 'row-valid'}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    {rowError ? (
                                                        <span className="status-error" title={rowError.message}>❌ Lỗi</span>
                                                    ) : row._isExisting ? (
                                                        <span className="status-warning" title="Đã tồn tại" style={{ color: '#d97706', fontWeight: 'bold' }}>⚠️ Đã tồn tại</span>
                                                    ) : (
                                                        <span className="status-valid" style={{ color: '#16a34a', fontWeight: 'bold' }}>✨ Mới</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {!rowError && row._isExisting ? (
                                                        <select
                                                            value={row._importMode}
                                                            onChange={(e) => handleModeChange(idx, e.target.value)}
                                                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        >
                                                            <option value="accumulate">Cập nhật (Cộng dồn)</option>
                                                            <option value="overwrite">Cập nhật (Ghi đè)</option>
                                                            <option value="skip">Bỏ qua</option>
                                                        </select>
                                                    ) : !rowError ? (
                                                        <span style={{ color: '#16a34a' }}>Thêm mới</span>
                                                    ) : <span>—</span>}
                                                </td>
                                                <td>{row.sku || <em className="empty-cell">—</em>}</td>
                                                <td>{row.name || <em className="empty-cell">—</em>}</td>
                                                <td>{row.price ? formatVND(row.price) : <em className="empty-cell">—</em>}</td>
                                                <td>{row.style || <em className="empty-cell">—</em>}</td>
                                                <td style={{textAlign: 'center'}}>{row.trending === true || String(row.trending).toLowerCase() === 'true' ? '🔥' : '—'}</td>
                                                <td>
                                                    {rowError ? row.stock :
                                                        (row._isExisting && row._importMode === 'accumulate') ?
                                                            <span title={`Cũ: ${row._existingStock} + Mới: ${row.stock}`}>
                                                                {row._existingStock} <strong style={{ color: 'green' }}>+{row.stock}</strong>
                                                            </span> : row.stock ?? <em className="empty-cell">—</em>}
                                                </td>
                                                <td>{row.category_level1 || row['Category Level 1'] || <em className="empty-cell">—</em>}</td>
                                                <td>{row.brand || 'No Brand'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {previewData.length > 50 && (
                                <p className="preview-truncated">... và {previewData.length - 50} dòng khác</p>
                            )}
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="import-errors">
                                <h4>⚠️ Chi tiết lỗi:</h4>
                                <ul>
                                    {validationErrors.slice(0, 10).map((err, i) => (
                                        <li key={i}>Dòng {err.row}: <strong>{err.name || '(trống)'}</strong> — {err.message}</li>
                                    ))}
                                    {validationErrors.length > 10 && (
                                        <li>... và {validationErrors.length - 10} lỗi khác</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {/* Actions */}
                <div className="import-modal-actions">
                    <button className="btn-download-template" onClick={handleDownloadTemplate}>
                        📥 Tải template mẫu
                    </button>
                    <div className="import-actions-right">
                        <button className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button
                            className="btn-import"
                            onClick={handleImport}
                            disabled={loading || previewData.length === 0 || validCount === 0}
                        >
                            {loading ? '⏳ Đang import...' : `✅ Import ${validCount} sản phẩm`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportProductModal;
