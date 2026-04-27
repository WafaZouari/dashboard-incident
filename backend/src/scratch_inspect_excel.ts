import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n--- File: ${file} ---`);
    const workbook = XLSX.readFile(path.join(dataDir, file));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length > 0) {
        console.log('Headers:', data[0]);
        console.log('Sample Row:', data[1]);
    } else {
        console.log('No data found in the first sheet.');
    }
});
