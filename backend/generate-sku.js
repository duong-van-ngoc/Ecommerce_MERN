import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'data', 'products_full_catalog.xlsx');
const outputPath = path.join(__dirname, 'data', 'products_full_catalog_with_sku.xlsx');

console.log('Đang đọc file:', inputPath);

try {
  // Read the workbook
  const workbook = xlsx.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  
  if (data.length === 0) {
    console.log('File rỗng.');
    process.exit(0);
  }

  console.log(`Tìm thấy ${data.length} sản phẩm. Đang tạo mã SKU...`);

  const categoryCounts = {};

  const newData = data.map((row, index) => {
    // Get existing SKU or create one based on Name/Category
    let sku = row['SKU'] || row['sku'] || row['Mã SP'] || row['Mã sản phẩm'];
    
    if (!sku) {
        // Try to generate a meaningful prefix
        const name = row['Tên'] || row['Tên sản phẩm'] || row['Name'] || row['name'] || '';
        const cat1 = row['category_level1'] || row['Category Level 1'] || row['Danh mục cấp 1'] || row['Danh mục Cấp 1'] || '';
        
        // Use first two letters of category + first letter of name, or just 'SP'
        let prefix = 'SP';
        if (cat1 && name) {
            const catPrefix = cat1.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            const namePrefix = name.split(' ')[0].replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase();
            prefix = `${catPrefix}${namePrefix}`.padEnd(3, 'X');
        }

        if (!categoryCounts[prefix]) {
            categoryCounts[prefix] = 1;
        } else {
            categoryCounts[prefix]++;
        }

        const countStr = String(categoryCounts[prefix]).padStart(3, '0');
        sku = `${prefix}-${countStr}`;
    }

    // Return the new object with SKU at the beginning
    return {
        'SKU': sku,
        ...row
    };
  });

  // Convert back to worksheet
  const newWorksheet = xlsx.utils.json_to_sheet(newData);
  
  // Replace the old worksheet in a new workbook
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
  
  // Write to a new file
  xlsx.writeFile(newWorkbook, outputPath);
  
  console.log('✅ Đã tạo thành công file mới tại:', outputPath);
  
} catch (error) {
  console.error('Lỗi trong quá trình tạo SKU:', error.message);
}
