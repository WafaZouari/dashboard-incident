import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';
import * as XLSX from 'xlsx';

// Helper functions (same logic as our import script)
function parseExcelDate(val: any): Date {
    if (!val) return new Date();
    if (typeof val === 'number') {
        const date = XLSX.SSF.parse_date_code(val);
        return new Date(date.y, date.m - 1, date.d, date.H, date.M, date.S);
    }
    if (typeof val === 'string') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d;
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

async function getOrCreateLocation(name: string) {
    if (!name) return null;
    return prisma.location.upsert({
        where: { id: -1 },
        create: { name: name.trim() },
        update: {},
    }).catch(async () => {
         let loc = await prisma.location.findFirst({ where: { name: name.trim() } });
         if (!loc) loc = await prisma.location.create({ data: { name: name.trim() } });
         return loc;
    });
}

async function getOrCreateType(name: string) {
    if (!name) return null;
    return prisma.incidentType.upsert({
        where: { name: name.trim() },
        update: {},
        create: { name: name.trim() }
    });
}

export const importExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
        const reporterId = req.user?.userId || admin?.id;

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        let importedCount = 0;

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];

            // Determine structure based on headers
            if (rows.length === 0) continue;

            // Simplified heuristic: If the first row looks like 2012-2023 format
            if (rows[0] && rows[0][0] === 'Report #') {
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length < 5) continue;

                    const incidentId = String(row[0] || '');
                    if (!incidentId) continue;

                    const dateStr = row[1];
                    const locName = String(row[2] || 'Unknown');
                    const title = String(row[3] || 'Untitled Incident');
                    const typeName = String(row[4] || 'Other');
                    const description = String(row[7] || '');
                    const severity = parseInt(row[11]) || 1;
                    const isHiPo = String(row[12]).toLowerCase() === 'yes';

                    const location = await getOrCreateLocation(locName);
                    const type = await getOrCreateType(typeName);

                    await prisma.incident.upsert({
                        where: { incidentId },
                        update: {},
                        create: {
                            incidentId,
                            dateOccurred: parseExcelDate(dateStr),
                            title: title.substring(0, 100),
                            description,
                            locationId: location?.id,
                            incidentTypeId: type?.id,
                            actualSeverity: severity,
                            isHighPotential: isHiPo,
                            status: 'closed',
                            reportedById: reporterId,
                            createdById: reporterId
                        }
                    });
                    importedCount++;
                }
            } else {
                // Try 2025 format where data starts at row 6 (index 5)
                // Search for a header row
                let dataStartIdx = -1;
                for (let i = 0; i < Math.min(10, rows.length); i++) {
                    if (rows[i] && rows[i][0] === 'N°') {
                        dataStartIdx = i + 1;
                        break;
                    }
                }

                if (dataStartIdx !== -1) {
                    for (let i = dataStartIdx; i < rows.length; i++) {
                        const row = rows[i];
                        if (!row || row.length < 5 || !row[0]) continue;

                        const n = String(row[0]);
                        const incidentId = `INC-IMPORT-${n.padStart(4, '0')}`;
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
                                status: 'closed', // default to closed for imported data unless specified
                                reportedById: reporterId,
                                createdById: reporterId
                            }
                        });
                        importedCount++;
                    }
                }
            }
        }

        return sendSuccess(res, { count: importedCount }, `Successfully imported ${importedCount} incidents.`);
    } catch (err) {
        next(err);
    }
};
