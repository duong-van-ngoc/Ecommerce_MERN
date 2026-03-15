import xlsx from 'xlsx';
import fs from 'fs';

const sampleData = [
    {
        name: 'Áo thun nam Polo Trơn',
        description: 'Áo thun Polo có cổ lịch sự, vải cotton thoáng mát',
        price: 250000,
        originalPrice: 350000,
        stock: 50,
        category_level1: 'NAM',
        category_level2: 'Áo',
        category_level3: 'Polo',
        brand: 'Coolmate',
        material: 'Cotton',
        sizes: 'M,L,XL',
        colors: 'Đen,Trắng,Navy'
    },
    {
        name: 'Quần Jean nữ ống rộng',
        description: 'Quần Jean ống rộng tôn vóc dáng',
        price: 360000,
        originalPrice: 420000,
        stock: 120,
        category_level1: 'NỮ',
        category_level2: 'Quần',
        category_level3: '',
        brand: 'Levis',
        material: 'Denim',
        sizes: '26,27,28,29',
        colors: 'Xanh nhạt,Đen'
    },
    {
        name: 'Giày sneaker Unisex Classic',
        description: 'Giày sneaker phong cách cổ điển, dễ phối đồ',
        price: 520000,
        originalPrice: 650000,
        stock: 75,
        category_level1: 'PHỤ KIỆN & GIÀY DÉP',
        category_level2: 'Giày dép',
        category_level3: 'Giày dép unisex',
        brand: 'Vans',
        material: 'Canvas',
        sizes: '38,39,40,41,42',
        colors: 'Đen Trắng'
    }
];

// Tạo file Excel
const ws = xlsx.utils.json_to_sheet(sampleData);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Products');

const excelPath = './sample_import_products.xlsx';
xlsx.writeFile(wb, excelPath);
console.log(`Đã tạo file: ${excelPath}`);

// Tạo file CSV
const csvPath = './sample_import_products.csv';
const csvContent = xlsx.utils.sheet_to_csv(ws);
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`Đã tạo file: ${csvPath}`);
