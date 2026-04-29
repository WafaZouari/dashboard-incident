const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const incidents = await prisma.incident.findMany({
    select: { incTypeIfInjury: true, pearClass: true, actualSeverity: true, subCategory: true }
  });
  
  const types = new Set(incidents.map(i => i.incTypeIfInjury));
  console.log('Injury Types:', [...types]);

  const classes = new Set(incidents.map(i => i.pearClass));
  console.log('PEAR Classes:', [...classes]);

  const subcats = new Set(incidents.map(i => i.subCategory));
  console.log('Sub Categories:', [...subcats]);
}

main().finally(() => prisma.$disconnect());
