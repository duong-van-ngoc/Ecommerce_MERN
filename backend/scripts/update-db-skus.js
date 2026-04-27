import mongoose from 'mongoose';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { loadEnvironment } from './config/loadEnv.js';
loadEnvironment();

// Import models
import Product from './models/productModel.js';

const updateDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('DB Connected');

        const inputPath = path.join(__dirname, 'data', 'products_full_catalog_with_sku.xlsx');
        const workbook = xlsx.readFile(inputPath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });

        let updatedCount = 0;

        const allProducts = await Product.find(); // Find all

        for (const product of allProducts) {
            if (!product.sku || product.sku.trim() === '') {
                const matchingRow = data.find(row =>
                    (row['Tên'] || row['Tên sản phẩm'] || row['Name'] || row['name'] || '').trim() === product.name.trim()
                );

                if (matchingRow && matchingRow['SKU']) {
                    product.sku = matchingRow['SKU'];
                    await product.save({ validateBeforeSave: false });
                    updatedCount++;
                }
            }
        }

        console.log(`Đã cập nhật SKU cho ${updatedCount} sản phẩm cũ trong DB`);
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    }
};

updateDB();
