import prisma from '../config/database';

const defaultRoles = [
  { name: 'ADMIN', permissions: { all: true } },
  { name: 'MANAGER', permissions: { viewDashboard: true, manageIncidents: true, viewAnalytics: true, manageInvestigations: true, manageActionItems: true, manageGuardians: true } },
  { name: 'INVESTIGATOR', permissions: { viewDashboard: true, viewIncidents: true, manageInvestigations: true, viewActionItems: true } },
  { name: 'USER', permissions: { viewDashboard: true, viewIncidents: true } },
  { name: 'GUARDIAN', permissions: { viewDashboard: true, viewIncidents: true, viewActionItems: true } },
];

async function main() {
  console.log('Seeding roles...');
  for (const role of defaultRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        permissions: role.permissions,
      },
    });
  }
  console.log('Roles seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
