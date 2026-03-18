import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const categories = [
    { l1: 'Nam', l2: 'Áo', l3: 'Thun' },
    { l1: 'Nam', l2: 'Áo', l3: 'Sơ mi' },
    { l1: 'Nam', l2: 'Quần', l3: 'Jeans' },
    { l1: 'Nam', l2: 'Quần', l3: 'Short' },
    { l1: 'Unisex', l2: 'Áo', l3: 'Hoodie' },
    { l1: 'Unisex', l2: 'Áo', l3: 'Khoác' },
    { l1: 'Nữ', l2: 'Đầm/Váy', l3: 'Midi' },
    { l1: 'Nữ', l2: 'Đầm/Váy', l3: 'Công sở' },
    { l1: 'Nữ', l2: 'Áo', l3: 'Len' },
    { l1: 'Nữ', l2: 'Quần/Váy', l3: 'Chân váy' },
    { l1: 'Nữ', l2: 'Quần/Váy', l3: 'Tây' },
    { l1: 'Unisex', l2: 'Giày', l3: 'Sneaker' },
    { l1: 'Nam', l2: 'Giày', l3: 'Loafers' },
    { l1: 'Phụ kiện', l2: 'Túi', l3: 'Tote' },
    { l1: 'Phụ kiện', l2: 'Túi', l3: 'Balo' },
    { l1: 'Phụ kiện', l2: 'Nón/Mũ', l3: 'Lưỡi trai' },
    { l1: 'Phụ kiện', l2: 'Thắt lưng', l3: 'Da' }
];

const brands = ['UrbanEase', 'GentSpace', 'DenimLab', 'DailyWear', 'CozyClub', 'StreetLayer', 'LunaMuse', 'OfficeChic', 'WarmMuse', 'SoftLine', 'MinimalHer', 'MoveOn', 'Classico', 'CarryDaily', 'PackPro', 'CapStory', 'BeltCraft'];
const materials = ['Cotton 100%', 'Oxford Cotton', 'Denim co giãn', 'Kaki Cotton', 'Nỉ bông', 'Polyester', 'Voan lót cotton', 'Tuytsi', 'Len acrylic cao cấp', 'Poly crepe', 'Tuyt mỏng', 'Da PU + lưới', 'Da tổng hợp cao cấp', 'Canvas', 'Oxford chống nước', 'Cotton twill', 'Da PU'];

const products = [];
const TOTAL_PRODUCTS = 120;

for (let i = 1; i <= TOTAL_PRODUCTS; i++) {
    const cat = categories[(i - 1) % categories.length];
    const brand = brands[(i - 1) % brands.length];
    const material = materials[(i - 1) % materials.length];
    
    products.push({
        'name': `Sản phẩm test thứ ${i} - ${cat.l3} ${brand}`,
        'description': `Mô tả chi tiết cho sản phẩm test số ${i}. Sản phẩm chất lượng cao, bền đẹp, phong cách thời trang hiện đại phù hợp cho mọi đối tượng.`,
        'price': 100000 + (i * 5000),
        'originalPrice': 150000 + (i * 5000),
        'stock': 10 + (i % 50),
        'sold': i * 2,
        'category.level1': cat.l1,
        'category.level2': cat.l2,
        'category.level3': cat.l3,
        'brand': brand,
        'material': material,
        'sizes': JSON.stringify(['S', 'M', 'L', 'XL'].slice(0, 2 + (i % 3))),
        'colors': JSON.stringify(['Đen', 'Trắng', 'Xám', 'Navy'].slice(0, 1 + (i % 4)))
    });
}

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');

const exportPath = path.resolve('..', 'test_data', 'test_import_120_products.xlsx');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(path.dirname(exportPath))) {
    fs.mkdirSync(path.dirname(exportPath), { recursive: true });
}

XLSX.writeFile(wb, exportPath);
console.log(`Successfully created: ${exportPath}`);
