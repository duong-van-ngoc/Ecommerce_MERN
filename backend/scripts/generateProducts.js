/**
 * Script: Generate products Excel file covering all 34 categories with 5 products each
 * Usage: node scripts/generateProducts.js
 * Output: data/products_full_catalog.xlsx
 */

import * as xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// All 34 categories from sidebar
const CATEGORIES = [
    // === NAM (9) ===
    { level1: 'NAM', level2: 'Áo', level3: 'Thun' },
    { level1: 'NAM', level2: 'Áo', level3: 'Sơ mi' },
    { level1: 'NAM', level2: 'Áo', level3: 'Hoodie' },
    { level1: 'NAM', level2: 'Áo', level3: 'Khoác' },
    { level1: 'NAM', level2: 'Áo', level3: 'Polo' },
    { level1: 'NAM', level2: 'Quần', level3: 'Jean' },
    { level1: 'NAM', level2: 'Quần', level3: 'Short' },
    { level1: 'NAM', level2: 'Quần', level3: 'Kaki' },
    { level1: 'NAM', level2: 'Quần', level3: 'Jogger' },
    // === NỮ (8) ===
    { level1: 'NỮ', level2: 'Áo', level3: 'Thun' },
    { level1: 'NỮ', level2: 'Áo', level3: 'Sơ mi' },
    { level1: 'NỮ', level2: 'Áo', level3: 'Kiểu' },
    { level1: 'NỮ', level2: 'Áo', level3: 'Khoác' },
    { level1: 'NỮ', level2: 'Váy', level3: 'Ngắn' },
    { level1: 'NỮ', level2: 'Váy', level3: 'Dài' },
    { level1: 'NỮ', level2: 'Váy', level3: 'Body' },
    { level1: 'NỮ', level2: 'Quần', level3: 'Quần nữ' },
    // === UNISEX (3) ===
    { level1: 'UNISEX', level2: 'Áo', level3: 'Thun' },
    { level1: 'UNISEX', level2: 'Áo', level3: 'Hoodie' },
    { level1: 'UNISEX', level2: 'Áo', level3: 'Khoác' },
    // === PHỤ KIỆN & GIÀY DÉP (14) ===
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Giày dép', level3: 'Nam' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Giày dép', level3: 'Nữ' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Giày dép', level3: 'Unisex' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nam', level3: 'Mũ' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nam', level3: 'Thắt lưng' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nam', level3: 'Ví' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nam', level3: 'Kính' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nam', level3: 'Trang sức' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nữ', level3: 'Túi xách' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nữ', level3: 'Mũ' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nữ', level3: 'Kính' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nữ', level3: 'Trang sức' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện Nữ', level3: 'Khăn' },
    { level1: 'PHỤ KIỆN & GIÀY DÉP', level2: 'Phụ kiện', level3: 'Unisex' },
];

const BRANDS = ['Coolmate', 'Routine', 'Aristino', 'Owen', 'Zara', 'H&M', 'Uniqlo', 'Nike', 'Adidas', 'Levi\'s', 'Lacoste', 'Degrey', 'Vascara', 'Charles & Keith', 'Juno', 'Pedro', 'Pierre Cardin'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', 'Free'];
const COLORS = ['Đen', 'Trắng', 'Xám', 'Xanh navy', 'Be', 'Xanh rêu', 'Đỏ', 'Hồng', 'Nâu', 'Xanh nhạt', 'Vàng', 'Cam'];

// Helper to generate 5 products for a category
function generate5Products(cat) {
    const products = [];
    const baseName = `${cat.level2} ${cat.level3} ${cat.level1.toLowerCase()}`;
    
    for (let i = 1; i <= 5; i++) {
        const price = (Math.floor(Math.random() * 80) + 15) * 10000; // 150k - 950k
        const origPrice = price + (Math.floor(Math.random() * 20) + 5) * 10000;
        
        products.push({
            name: `${baseName} Premium Model ${i}`,
            desc: `Sản phẩm ${baseName} cao cấp phiên bản v${i}. Chất liệu bền đẹp, form dáng thời thượng phù hợp cho mọi đối tượng.`,
            price: price,
            orig: origPrice,
            brand: BRANDS[Math.floor(Math.random() * BRANDS.length)],
            material: 'Cotton Premium / Blend Fabric',
            sizes: SIZES.slice(0, 5).join(','),
            colors: COLORS.slice(0, 4).join(','),
        });
    }
    return products;
}

// Generate rows
const rows = [];
for (const cat of CATEGORIES) {
    const products = generate5Products(cat);
    for (const p of products) {
        rows.push({
            name: p.name,
            description: p.desc,
            price: p.price,
            originalPrice: p.orig,
            stock: Math.floor(Math.random() * 150) + 50, // 50-200
            category_level1: cat.level1,
            category_level2: cat.level2,
            category_level3: cat.level3,
            brand: p.brand,
            material: p.material,
            sizes: p.sizes,
            colors: p.colors,
        });
    }
}

// Create workbook
const ws = xlsx.utils.json_to_sheet(rows);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Products');

// Set column widths
ws['!cols'] = [
    { wch: 35 }, { wch: 60 }, { wch: 10 }, { wch: 12 }, { wch: 7 }, 
    { wch: 22 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, 
    { wch: 25 }, { wch: 30 }
];

// Ensure output directory exists
const outputDir = join(__dirname, '..', 'data');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, 'products_full_catalog.xlsx');
xlsx.writeFile(wb, outputPath);

console.log(`✅ Đã tạo file: ${outputPath}`);
console.log(`📦 Tổng số sản phẩm: ${rows.length} (34 danh mục * 5 sản phẩm/mục)`);

// Summary
const summary = {};
for (const row of rows) {
    const key = `${row.category_level1} → ${row.category_level2} → ${row.category_level3}`;
    summary[key] = (summary[key] || 0) + 1;
}
console.log('\n📊 Xác nhận danh mục (Phải đều là 5):');
for (const [cat, count] of Object.entries(summary)) {
    console.log(`  ${cat}: ${count} SP`);
}
