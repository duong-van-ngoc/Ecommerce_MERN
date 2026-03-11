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

    const REQUIRED_FIELDS = ['name', 'description', 'price', 'stock', 'category'];

    // Parse file Excel/CSV
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel', // xls
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
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    toast.error('File không chứa dữ liệu');
                    return;
                }

                // Validate each row
                const errors = [];
                jsonData.forEach((row, idx) => {
                    const missing = REQUIRED_FIELDS.filter(f => !row[f] && row[f] !== 0);
                    if (missing.length > 0) {
                        errors.push({ row: idx + 1, name: row.name || '', message: `Thiếu: ${missing.join(', ')}` });
                    }
                    if (row.price && (isNaN(row.price) || Number(row.price) <= 0)) {
                        errors.push({ row: idx + 1, name: row.name || '', message: 'Giá không hợp lệ' });
                    }
                    if (row.stock !== '' && (isNaN(row.stock) || Number(row.stock) < 0)) {
                        errors.push({ row: idx + 1, name: row.name || '', message: 'Số lượng không hợp lệ' });
                    }
                });

                setPreviewData(jsonData);
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
                name: 'Áo khoác gió', description: 'Áo khoác chống nước, chống gió',
                price: 350000, originalPrice: 500000, stock: 100,
                category: 'Áo', brand: 'Nike', material: 'Polyester',
                sizes: 'S,M,L,XL', colors: 'Đen,Trắng,Xanh'
            },
            {
                name: 'Quần jean slim', description: 'Quần jean co giãn 4 chiều',
                price: 450000, originalPrice: 600000, stock: 50,
                category: 'Quần', brand: 'Levi\'s', material: 'Denim',
                sizes: '29,30,31,32', colors: 'Xanh đậm,Đen'
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
                    <h2>📥 Import Sản Phẩm Từ Excel/CSV</h2>
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
                                        <th>Danh mục</th>
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
                                                <td>{row.category || <em className="empty-cell">—</em>}</td>
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
