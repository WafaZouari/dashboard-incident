import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Excel data import...\n');

    // When running from backend/, process.cwd() is incident-dashboard/backend
    const dataDir = path.join(process.cwd(), '../data');
    console.log(`📂 Data directory: ${dataDir}`);
    if (!fs.existsSync(dataDir)) {
        console.error(`❌ Data directory not found at ${dataDir}`);
        return;
    }
    console.log(`🔍 Files in directory: ${fs.readdirSync(dataDir).join(', ')}`);
    
    // --- Cleanup: Remove existing data ---
    console.log('🧹 Cleaning up old data...');
    await prisma.actionItem.deleteMany();
    await prisma.investigation.deleteMany();
    await prisma.incident.deleteMany();
    
    console.log('✨ Database cleaned.\n');

    // 1. Initial User (Admin)
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
        console.warn('⚠️ No admin user found. Creating a default admin user for import...');
        // We will just proceed, createdById can be null or we create a dummy one
    }

    // --- HELPER: Parse Date ---
    function parseExcelDate(val: any): Date {
        if (!val) return new Date();
        if (typeof val === 'number') {
            // Excel serial date
            const date = XLSX.SSF.parse_date_code(val);
            return new Date(date.y, date.m - 1, date.d, date.H, date.M, date.S);
        }
        if (typeof val === 'string') {
            const d = new Date(val);
            if (!isNaN(d.getTime())) return d;
            
            // Try DD.MM.YYYY format common in logs
            const parts = val.split(/[. :]/);
            if (parts.length >= 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                if (year > 1000) return new Date(year, month - 1, day);
            }
        }
        return new Date();
    }

    // =========================================================================
    // FILE: TPS_Incidents_Consolidated.xlsx
    // =========================================================================
    const fileName = 'TPS_Incidents_Consolidated.xlsx';
    if (fs.existsSync(path.join(dataDir, fileName))) {
        console.log(`Processing ${fileName}...`);
        const workbook = XLSX.readFile(path.join(dataDir, fileName));
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
        
        // Skip header rows (Header is at row index 2, data starts at index 3)
        let processedCount = 0;
        for (let i = 3; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue; // Skip empty rows

            // Extract variables according to columns mapped
            const sourceYearStr = String(row[0] || '').trim();
            const incidentNoRaw = String(row[1] || '').trim();
            if (!incidentNoRaw) continue; // Must have an incident number

            // Construct a unique incident number if it's just an integer
            const incidentNo = `INC-${sourceYearStr}-${incidentNoRaw.padStart(4, '0')}`;

            const reportedBy = String(row[2] || '').trim();
            const site = String(row[3] || '').trim();
            const locationOnSite = String(row[4] || '').trim();
            const dateTimeOccurred = parseExcelDate(row[5]);
            const pearClass = String(row[6] || '').trim();
            const subCategory = String(row[7] || '').trim();
            const briefDescription = String(row[8] || '').trim();
            const incTypeIfInjury = String(row[9] || '').trim();
            const assetIntegrityType = String(row[10] || '').trim();
            const damagedZone = String(row[11] || '').trim();
            const pseTiers = String(row[12] || '').trim();
            
            const actualSeverity = parseInt(row[13]) || null;
            const potentialSeverity = parseInt(row[14]) || null;
            
            const investigationDoneStr = String(row[15] || '').trim().toLowerCase();
            const investigationDone = investigationDoneStr === 'yes' || investigationDoneStr === 'y';

            const immediateCauses = String(row[16] || '').trim();
            const rootCauses = String(row[17] || '').trim();
            const correctiveActionsTaken = String(row[18] || '').trim();
            const suggestionsRecommendations = String(row[19] || '').trim();

            const status = investigationDone ? 'closed' : 'open'; // Simplified status logic

            const createdIncident = await prisma.incident.upsert({
                where: { incidentNo },
                update: {},
                create: {
                    sourceYear: parseInt(sourceYearStr) || null,
                    incidentNo,
                    reportedBy,
                    site,
                    locationOnSite,
                    dateTimeOccurred,
                    pearClass,
                    subCategory,
                    briefDescription,
                    incTypeIfInjury,
                    assetIntegrityType,
                    damagedZone,
                    pseTiers,
                    actualSeverity,
                    potentialSeverity,
                    investigationDone,
                    status,
                    createdById: admin?.id || null
                }
            });

            // Create Investigation if there are causes
            let investigation = null;
            if (investigationDone || immediateCauses || rootCauses) {
                investigation = await prisma.investigation.create({
                    data: {
                        incidentId: createdIncident.id,
                        investigatorId: admin?.id || null,
                        investigationDate: createdIncident.dateTimeOccurred,
                        status: 'completed',
                        immediateCauses,
                        rootCauses,
                    }
                });
            }

            // Create Action Items if there are actions/recommendations
            if (correctiveActionsTaken || suggestionsRecommendations) {
                await prisma.actionItem.create({
                    data: {
                        incidentId: createdIncident.id,
                        investigationId: investigation?.id || null,
                        correctiveActionsTaken,
                        suggestionsRecommendations,
                        status: 'completed',
                        assignedToId: admin?.id || null, // Default assignee
                    }
                });
            }

            processedCount++;
        }
        console.log(`✅ Processed ${processedCount} rows from ${fileName}`);
    } else {
        console.error(`❌ File not found: ${fileName} in ${dataDir}`);
    }

    console.log('\n🎉 Excel import completed!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
