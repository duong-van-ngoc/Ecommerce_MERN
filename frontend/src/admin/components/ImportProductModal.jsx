import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importProducts } from '../adminSLice/adminSlice';
import { toast } from 'react-toastify';
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

    const REQUIRED_FIELDS = ['name', 'description', 'price', 'stock', 'category_level1'];

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
        reader.onload = (evt) => {
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
                    if (!mappedRow.category_level1) {
                        mappedRow.category_level1 = row['category_level1'] || row['category.level1'] || row['Category Level 1'] || row['Danh mục cấp 1'] || row['Danh mục Cấp 1'] || row['level1'];
                    }
                    if (!mappedRow.category_level2) {
                        mappedRow.category_level2 = row['category_level2'] || row['category.level2'] || row['Category Level 2'] || row['Danh mục cấp 2'] || row['Danh mục Cấp 2'] || row['level2'];
                    }
                    if (!mappedRow.category_level3) {
                        mappedRow.category_level3 = row['category_level3'] || row['category.level3'] || row['Category Level 3'] || row['Danh mục cấp 3'] || row['Danh mục Cấp 3'] || row['level3'];
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

                setPreviewData(mappedData);
                setValidationErrors(errors);
            } catch (err) {
                toast.error('Không thể đọc file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Handle import
    const handleImport = async () => {
        const errorRows = new Set(validationErrors.map(e => e.row));
        const validData = previewData.filter((_, idx) => !errorRows.has(idx + 1));

        if (validData.length === 0) {
            toast.error('Không có sản phẩm hợp lệ để import');
            return;
        }

        try {
            const result = await dispatch(importProducts(validData)).unwrap();
            toast.success(`✅ Import thành công ${result.imported} sản phẩm!`);
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
                name: 'Áo thun nam basic', description: 'Áo thun cotton mát mẻ',
                price: 150000, originalPrice: 200000, stock: 100,
                category_level1: 'NAM', category_level2: 'Áo', category_level3: 'Thun', 
                brand: 'Coolmate', material: 'Cotton',
                sizes: 'S,M,L,XL', colors: 'Đen,Trắng,Navy'
            },
            {
                name: 'Túi xách nữ thời trang', description: 'Túi xách da PU cao cấp',
                price: 450000, originalPrice: 600000, stock: 50,
                category_level1: 'PHỤ KIỆN & GIÀY DÉP', category_level2: 'Phụ kiện Nữ', category_level3: 'Túi xách', 
                brand: 'Juno', material: 'Da PU',
                sizes: 'Free', colors: 'Đen,Đỏ,Be'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, 'template_import_san_pham.xlsx');
    };

    const validCount = previewData.length - validationErrors.length;
    const errorCount = validationErrors.length;

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="import-modal-header">
                    <h2>📥 Import Sản Phẩm Từ Excel/CSV <span style={{fontSize: '12px', color: '#999'}}>(v2.0)</span></h2>
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
                        <div className="import-stats">
                            <span className="stat-valid">✅ {validCount} hợp lệ</span>
                            {errorCount > 0 && <span className="stat-error">❌ {errorCount} lỗi</span>}
                            <span className="stat-total">📦 Tổng: {previewData.length} dòng</span>
                        </div>

                        <div className="import-preview-container">
                            <table className="import-preview-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Trạng thái</th>
                                        <th>Tên SP</th>
                                        <th>Giá</th>
                                        <th>Kho</th>
                                        <th>Danh mục 1</th>
                                        <th>Danh mục 2</th>
                                        <th>Danh mục 3</th>
                                        <th>Thương hiệu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 50).map((row, idx) => {
                                        const rowError = validationErrors.find(e => e.row === idx + 1);
                                        return (
                                            <tr key={idx} className={rowError ? 'row-error' : 'row-valid'}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    {rowError ? (
                                                        <span className="status-error" title={rowError.message}>❌</span>
                                                    ) : (
                                                        <span className="status-valid">✅</span>
                                                    )}
                                                </td>
                                                <td>{row.name || <em className="empty-cell">—</em>}</td>
                                                <td>{row.price ? Number(row.price).toLocaleString('vi-VN') + '₫' : <em className="empty-cell">—</em>}</td>
                                                <td>{row.stock ?? <em className="empty-cell">—</em>}</td>
                                                <td>{row.category_level1 || row['Category Level 1'] || <em className="empty-cell">—</em>}</td>
                                                <td>{row.category_level2 || row['Category Level 2'] || <em className="empty-cell">—</em>}</td>
                                                <td>{row.category_level3 || row['Category Level 3'] || <em className="empty-cell">—</em>}</td>
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
