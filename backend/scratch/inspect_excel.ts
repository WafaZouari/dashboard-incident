/// <reference types="node" />
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join(process.cwd(), '../data');
const fileName = 'TPS_Incidents_Consolidated.xlsx';
const filePath = path.join(dataDir, fileName);

if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
    
    if (rows.length > 0) {
        console.log('--- Row 0 (Header 1) ---');
        console.log(rows[0]);
        console.log('--- Row 1 (Header 2) ---');
        console.log(rows[1]);
        console.log('--- Row 2 (Header 3) ---');
        console.log(rows[2]);
        console.log('--- Row 3 (First Data Row) ---');
        console.log(rows[3]);
    }
} else {
    console.error('File not found');
}
