import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');

const filesToInspect = [
    'Incident Repartition Form January to December-09-2024.xlsx',
    'TCM-01-Incidents Tracking list from January 2025 until February 2026 (Rev 01).xlsx'
];

filesToInspect.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) return;

    console.log(`\n\n==================================================`);
    console.log(`FILE: ${file}`);
    console.log(`==================================================`);
    const workbook = XLSX.readFile(filePath);
    
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length > 0) {
            // Find the first row that looks like headers (has text)
            let headerRowIndex = 0;
            while (headerRowIndex < data.length && (!data[headerRowIndex] || (data[headerRowIndex] as any[]).every(cell => !cell))) {
                headerRowIndex++;
            }

            if (headerRowIndex < data.length) {
                console.log('Detected Headers (Row ' + headerRowIndex + '):', data[headerRowIndex]);
                if (data.length > headerRowIndex + 1) {
                    console.log('Sample Row 1:', data[headerRowIndex + 1]);
                }
                if (data.length > headerRowIndex + 2) {
                    console.log('Sample Row 2:', data[headerRowIndex + 2]);
                }
            }
            console.log(`Total Rows: ${data.length}`);
        } else {
            console.log('Sheet is empty.');
        }
    });
});
