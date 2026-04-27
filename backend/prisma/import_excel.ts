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
    
    // --- Cleanup: Remove existing mock data ---
    console.log('🧹 Cleaning up old data...');
    await prisma.actionItem.deleteMany();
    await prisma.investigation.deleteMany();
    await prisma.incidentDetail.deleteMany();
    await prisma.incident.deleteMany();
    console.log('✨ Database cleaned.\n');

    // 1. Initial User (Admin)
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
        console.error('❌ No admin user found. Please run seed first to create users.');
        return;
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

    // --- HELPER: Upsert Location ---
    async function getOrCreateLocation(name: string) {
        if (!name) return null;
        return prisma.location.upsert({
            where: { id: -1 }, // Dummy where for upsert with non-unique field
            create: { name: name.trim() },
            update: {},
            // We'll actually use findFirst + create for safety since name is not unique in schema
        }).catch(async () => {
             let loc = await prisma.location.findFirst({ where: { name: name.trim() } });
             if (!loc) loc = await prisma.location.create({ data: { name: name.trim() } });
             return loc;
        });
    }

    // --- HELPER: Upsert Incident Type ---
    async function getOrCreateType(name: string) {
        if (!name) return null;
        return prisma.incidentType.upsert({
            where: { name: name.trim() },
            update: {},
            create: { name: name.trim() }
        });
    }

    // =========================================================================
    // FILE 1: incident-List_from 2012 Till November 2023
    // =========================================================================
    const file1 = 'incident-List_from 2012 Till November 2023.xlsx';
    if (fs.existsSync(path.join(dataDir, file1))) {
        console.log(`Processing ${file1}...`);
        const workbook = XLSX.readFile(path.join(dataDir, file1));
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
        
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 5) continue;

            const incidentId = String(row[0] || '');
            const dateStr = row[1];
            const locName = String(row[2] || 'Unknown');
            const title = String(row[3] || 'Untitled Incident');
            const typeName = String(row[4] || 'Other');
            const description = String(row[7] || ''); // Index 7 based on scratch output
            const severity = parseInt(row[11]) || 1; // Index 11 based on scratch output
            const isHiPo = String(row[12]).toLowerCase() === 'yes';

            const location = await getOrCreateLocation(locName);
            const type = await getOrCreateType(typeName);

            await prisma.incident.upsert({
                where: { incidentId },
                update: {},
                create: {
                    incidentId,
                    dateOccurred: parseExcelDate(dateStr),
                    title,
                    description,
                    locationId: location?.id,
                    incidentTypeId: type?.id,
                    actualSeverity: severity,
                    isHighPotential: isHiPo,
                    status: 'closed',
                    reportedById: admin.id,
                    createdById: admin.id
                }
            });
        }
        console.log(`✅ Processed ${rows.length - 1} rows from ${file1}`);
    }

    // =========================================================================
    // FILE 3: TCM-01-Incidents Tracking list 2025
    // =========================================================================
    const file3 = 'TCM-01-Incidents Tracking list from January 2025 until February 2026 (Rev 01).xlsx';
    if (fs.existsSync(path.join(dataDir, file3))) {
        console.log(`Processing ${file3}...`);
        const workbook = XLSX.readFile(path.join(dataDir, file3));
        const sheet = workbook.Sheets['Incident Lists'];
        if (sheet) {
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
            // Header starts at Row 5 (index 5)
            for (let i = 6; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length < 5 || !row[0]) continue;

                const n = String(row[0]);
                const incidentId = `INC-2025-${n.padStart(4, '0')}`;
                const locName = String(row[2] || 'Unknown');
                const dateStr = row[4];
                const typeName = String(row[5] || 'Other');
                const description = String(row[7] || '');
                const severity = parseInt(row[12]) || 1;
                const potSeverity = parseInt(row[13]) || 1;

                const location = await getOrCreateLocation(locName);
                const type = await getOrCreateType(typeName);

                await prisma.incident.upsert({
                    where: { incidentId },
                    update: {},
                    create: {
                        incidentId,
                        dateOccurred: parseExcelDate(dateStr),
                        title: description.substring(0, 50) + '...',
                        description,
                        locationId: location?.id,
                        incidentTypeId: type?.id,
                        actualSeverity: severity,
                        potentialSeverity: potSeverity,
                        isHighPotential: potSeverity >= 4,
                        status: 'open',
                        reportedById: admin.id,
                        createdById: admin.id
                    }
                });
            }
            console.log(`✅ Processed ${rows.length - 6} rows from ${file3}`);
        }
    }

    console.log('\n🎉 Excel import completed!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
