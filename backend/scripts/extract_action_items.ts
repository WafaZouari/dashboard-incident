import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

// Define the output directory
const DATA_DIR = path.resolve(__dirname, '../../data');
const EXCEL_PATH = path.join(DATA_DIR, 'TPS_Incidents_Consolidated.xlsx');
const OUTPUT_CSV_PATH = path.join(DATA_DIR, 'extracted_action_items.csv');
const OUTPUT_JSON_PATH = path.join(DATA_DIR, 'extracted_action_items.json');

interface ActionItemRecord {
    incidentNo: string;
    dateTimeOccurred: string;
    site: string;
    actualSeverity: string | number | null;
    potentialSeverity: string | number | null;
    sourceColumn: 'Corrective Actions' | 'Suggestions';
    actionItemText: string;
}

function parseExcelDate(val: any): string {
    if (!val) return '';
    if (typeof val === 'number') {
        const date = XLSX.SSF.parse_date_code(val);
        return new Date(date.y, date.m - 1, date.d, date.H, date.M, date.S).toISOString();
    }
    if (typeof val === 'string') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toISOString();
    }
    return String(val);
}

function extractDiscreteItems(text: string): string[] {
    if (!text || typeof text !== 'string') return [];
    
    // Split by common bullet points, numbers, or newlines
    const rawItems = text.split(/(?:\r?\n|(?<=\s|^)-(?=\s)|(?<=\s|^)\*(?=\s)|(?<=\s|^)\d+\.(?=\s)|(?<=\s|^)\.(?=\s))/g);
    
    return rawItems
        .map(item => item.trim())
        .filter(item => item.length > 2) // Filter out empty or very short artifacts like "-", "."
        .map(item => item.replace(/^- /, '').replace(/^\* /, '').replace(/^\. /, '').trim());
}

async function runExtraction() {
    console.log(`Loading Excel file from: ${EXCEL_PATH}`);
    if (!fs.existsSync(EXCEL_PATH)) {
        console.error('Excel file not found!');
        process.exit(1);
    }

    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array of arrays
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
    
    if (rows.length < 3) {
        console.error('No data found in Excel sheet.');
        process.exit(1);
    }

    const extractedItems: ActionItemRecord[] = [];

    // Skip headers (assumed to be rows 0-2 based on previous checks)
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Assuming Incident No is at index 0 based on the script output earlier
        // 'Incident No.' is at row[0]
        const incidentNoRaw = String(row[0] || '').trim();
        if (!incidentNoRaw || incidentNoRaw === 'Incident No.') continue; // skip header row if any

        // The user's system prepends 'INC-YYYY-XXXX' so let's check if we can format it
        // Note: The previous header output showed column 0 is 'Incident No.'
        const incidentNo = incidentNoRaw; // Keeping it raw for analytics export
        
        const site = String(row[2] || '').trim();
        const dateTimeOccurred = parseExcelDate(row[4]);
        const actualSeverity = row[12];
        const potentialSeverity = row[13];

        const correctiveActions = String(row[17] || '').trim();
        const suggestions = String(row[18] || '').trim();

        // Extract discrete corrective actions
        if (correctiveActions) {
            const items = extractDiscreteItems(correctiveActions);
            for (const text of items) {
                extractedItems.push({
                    incidentNo,
                    dateTimeOccurred,
                    site,
                    actualSeverity,
                    potentialSeverity,
                    sourceColumn: 'Corrective Actions',
                    actionItemText: text
                });
            }
        }

        // Extract discrete suggestions
        if (suggestions) {
            const items = extractDiscreteItems(suggestions);
            for (const text of items) {
                extractedItems.push({
                    incidentNo,
                    dateTimeOccurred,
                    site,
                    actualSeverity,
                    potentialSeverity,
                    sourceColumn: 'Suggestions',
                    actionItemText: text
                });
            }
        }
    }

    console.log(`Extracted ${extractedItems.length} atomic action items.`);

    // 1. Export to JSON
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(extractedItems, null, 2), 'utf8');
    console.log(`Saved JSON output to: ${OUTPUT_JSON_PATH}`);

    // 2. Export to CSV
    const csvWriter = createObjectCsvWriter({
        path: OUTPUT_CSV_PATH,
        header: [
            { id: 'incidentNo', title: 'Incident No' },
            { id: 'dateTimeOccurred', title: 'Date Occurred' },
            { id: 'site', title: 'Site' },
            { id: 'actualSeverity', title: 'Actual Severity' },
            { id: 'potentialSeverity', title: 'Potential Severity' },
            { id: 'sourceColumn', title: 'Source (Corrective/Suggestion)' },
            { id: 'actionItemText', title: 'Action Item Text' }
        ]
    });

    await csvWriter.writeRecords(extractedItems);
    console.log(`Saved CSV output to: ${OUTPUT_CSV_PATH}`);
}

runExtraction().catch(err => {
    console.error('Error extracting data:', err);
    process.exit(1);
});
