import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// dotenv.config() loads backend/.env (CWD is backend/ when running the seed)
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ── Guard: skip if already seeded ──────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@petrosite.com' } });
  if (existingAdmin) {
    console.log('⚠️  Database already seeded. To re-seed, delete all rows first.');
    return;
  }

  // ── Users ───────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('Admin1234!', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@petrosite.com', passwordHash: password, firstName: 'System', lastName: 'Admin', role: 'admin', department: 'HSE' },
  });
  await prisma.user.create({
    data: { email: 'manager@petrosite.com', passwordHash: password, firstName: 'John', lastName: 'Martinez', role: 'manager', department: 'Operations' },
  });
  const investigator = await prisma.user.create({
    data: { email: 'investigator@petrosite.com', passwordHash: password, firstName: 'Sarah', lastName: 'Chen', role: 'investigator', department: 'HSE' },
  });
  await prisma.user.create({
    data: { email: 'viewer@petrosite.com', passwordHash: password, firstName: 'Mike', lastName: 'Johnson', role: 'viewer', department: 'Maintenance' },
  });
  console.log('✅ 4 users created');

  // ── Locations ───────────────────────────────────────────────────────────
  const locationNames = [
    { name: 'Refinery Unit A', site: 'Main Plant', department: 'Refining' },
  ];
  const locations = await Promise.all(locationNames.map((l) => prisma.location.create({ data: l })));
  console.log(`✅ ${locations.length} locations created`);

  // ── Incident Types ──────────────────────────────────────────────────────
  const typeNames = [
    { name: 'Process Safety', category: 'Safety', description: 'Process safety events' },];
  const types = await Promise.all(typeNames.map((t) => prisma.incidentType.create({ data: t })));
  console.log(`✅ ${types.length} incident types created`);

  // ── Subcategories ───────────────────────────────────────────────────────
  await prisma.incidentSubcategory.createMany({
    data: [
      { incidentTypeId: types[0].id, name: 'Pressure Release', description: 'Unexpected pressure release' },],
  });
  console.log('✅ Subcategories created');

  // ── Consequences ────────────────────────────────────────────────────────
  await prisma.incidentConsequence.createMany({
    data: [
      { name: 'Fatality', severityWeight: 5, description: 'Death of a person' },],
  });
  console.log('✅ Consequences created');
  console.log('\n🎉 Base data seeded successfully!');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials (all passwords: Admin1234!):');
  console.log('   admin@petrosite.com        — Admin');
  console.log('   manager@petrosite.com      — Manager');
  console.log('   investigator@petrosite.com — Investigator');
  console.log('   viewer@petrosite.com       — Viewer');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
