import XLSX from 'xlsx';
import path from 'path';

const filePath = 'd:/Projects/E_Commerce_MERN/test_data/mau_20_san_pham.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Headers found in Excel:');
    console.log(JSON.stringify(jsonData[0], null, 2));
    
    console.log('\nFirst row of data:');
    console.log(JSON.stringify(jsonData[1], null, 2));
} catch (error) {
    console.error('Error reading excel:', error.message);
}
