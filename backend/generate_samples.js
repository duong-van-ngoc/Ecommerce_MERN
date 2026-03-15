import xlsx from 'xlsx';
import fs from 'fs';

/**
 * Script tạo file mẫu Import sản phẩm "Siêu Bền" (Robust)
 * - Chứa cả header Tiếng Anh và Tiếng Việt.
 * - Chứa field 'category' cũ để vượt qua validation frontend nếu cần.
 * - Chứa đầy đủ thông tin danh mục 3 cấp cho logic mới.
 */

const sampleData = [
    {
        'Tên sản phẩm': 'Áo thun nam Polo Trơn Cotton',
        'Mô tả': 'Áo thun Polo có cổ lịch sự, vải cotton thoáng mát, thấm hút mồ hôi tốt. Phù hợp mặc đi làm hoặc đi chơi.',
        'Giá bán': 250000,
        'Giá gốc': 350000,
        'Số lượng': 50,
        'Danh mục': 'NAM - Áo - Polo', // Fallback cho code cũ
        'Danh mục cấp 1': 'NAM',
        'Danh mục cấp 2': 'Áo',
        'Danh mục cấp 3': 'Polo',
        'Thương hiệu': 'Coolmate',
        'Chất liệu': '100% Cotton',
        'Sizes': 'M,L,XL,XXL',
        'Colors': 'Đen, Trắng, Xanh Navy, Xám',
        'category': 'NAM - Áo - Polo' // Alias cho field category
    },
    {
        'Tên sản phẩm': 'Quần Jean nữ Baggy ống rộng',
        'Mô tả': 'Quần Jean dáng Baggy thời trang, tôn dáng, chất liệu denim bền đẹp.',
        'Giá bán': 360000,
        'Giá gốc': 420000,
        'Số lượng': 120,
        'Danh mục': 'NỮ - Quần',
        'Danh mục cấp 1': 'NỮ',
        'Danh mục cấp 2': 'Quần',
        'Danh mục cấp 3': '', // Cấp 3 để trống nếu không có
        'Thương hiệu': 'Levis',
        'Chất liệu': 'Denim',
        'Sizes': '26,27,28,29,30',
        'Colors': 'Xanh nhạt, Xanh đậm, Đen',
        'category': 'NỮ - Quần'
    },
    {
        'Tên sản phẩm': 'Giày Sneaker Unisex 2024 Classic',
        'Mô tả': 'Giày sneaker phong cách cổ điển, đế cao su chống trượt, phù hợp cho cả nam và nữ.',
        'Giá bán': 520000,
        'Giá gốc': 650000,
        'Số lượng': 75,
        'Danh mục': 'PHỤ KIỆN & GIÀY DÉP - Giày dép - Giày dép unisex',
        'Danh mục cấp 1': 'PHỤ KIỆN & GIÀY DÉP',
        'Danh mục cấp 2': 'Giày dép',
        'Danh mục cấp 3': 'Giày dép unisex',
        'Thương hiệu': 'Vans',
        'Chất liệu': 'Canvas',
        'Sizes': '36,37,38,39,40,41,42,43',
        'Colors': 'Trắng Đen, Full Đen',
        'category': 'PHỤ KIỆN & GIÀY DÉP - Giày dép - Giày dép unisex'
    }
];

// Tạo file Excel
const ws = xlsx.utils.json_to_sheet(sampleData);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Products');

const excelPath = './sample_import_v2.xlsx';
xlsx.writeFile(wb, excelPath);
console.log(`✅ Đã tạo file Excel: ${excelPath}`);

// Tạo file CSV
const csvPath = './sample_import_v2.csv';
const csvContent = xlsx.utils.sheet_to_csv(ws);
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`✅ Đã tạo file CSV: ${csvPath}`);
