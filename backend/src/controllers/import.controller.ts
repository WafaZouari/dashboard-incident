import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';
import * as XLSX from 'xlsx';

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

            if (rows.length === 0) continue;

            // Start from row index 3 (Header is row index 2)
            for (let i = 3; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const sourceYearStr = String(row[0] || '').trim();
                const incidentNoRaw = String(row[1] || '').trim();
                if (!incidentNoRaw) continue; 

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

                const status = investigationDone ? 'closed' : 'open';

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
                        createdById: reporterId
                    }
                });

                let investigation = null;
                if (investigationDone || immediateCauses || rootCauses) {
                    investigation = await prisma.investigation.create({
                        data: {
                            incidentId: createdIncident.id,
                            investigatorId: reporterId,
                            investigationDate: createdIncident.dateTimeOccurred,
                            status: 'completed',
                            immediateCauses,
                            rootCauses,
                        }
                    });
                }

                if (correctiveActionsTaken || suggestionsRecommendations) {
                    await prisma.actionItem.create({
                        data: {
                            incidentId: createdIncident.id,
                            investigationId: investigation?.id || null,
                            correctiveActionsTaken,
                            suggestionsRecommendations,
                            status: 'completed',
                            assignedToId: reporterId,
                        }
                    });
                }

                importedCount++;
            }
        }

        return sendSuccess(res, { count: importedCount }, `Successfully imported ${importedCount} incidents.`);
    } catch (err) {
        next(err);
    }
};
