/// <reference types="node" />
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join(process.cwd(), '../data');
const fileName = 'Process Safety Chart.xlsx';
const filePath = path.join(dataDir, fileName);

if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
    
    console.log(`--- Sheet: ${sheetName} ---`);
    rows.slice(0, 10).forEach((row, i) => {
        console.log(`Row ${i}:`, row);
    });
} else {
    console.error('File not found');
}
