/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const incidents = await prisma.incident.findMany({
        select: {
            incidentNo: true,
            pseTiers: true,
            assetIntegrityType: true
        },
        take: 10
    });
    
    console.log('--- Sample Data ---');
    console.table(incidents);
    
    const pseTierCounts = await prisma.incident.groupBy({
        by: ['pseTiers'],
        _count: { _all: true }
    });
    console.log('--- PSE Tier Counts ---');
    console.log(pseTierCounts);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
