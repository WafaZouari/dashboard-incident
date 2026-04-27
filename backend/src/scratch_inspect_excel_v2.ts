import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n\n==================================================`);
    console.log(`FILE: ${file}`);
    console.log(`==================================================`);
    const workbook = XLSX.readFile(path.join(dataDir, file));
    
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length > 0) {
            console.log('Headers:', data[0]);
            if (data.length > 1) {
                console.log('Sample Row 1:', data[1]);
            }
            if (data.length > 2) {
                console.log('Sample Row 2:', data[2]);
            }
            console.log(`Total Rows: ${data.length}`);
        } else {
            console.log('Sheet is empty.');
        }
    });
});
