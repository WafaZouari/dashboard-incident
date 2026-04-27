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
    { name: 'Refinery Unit A',      site: 'Main Plant',  department: 'Refining' },
    { name: 'Distillation Column B', site: 'Main Plant',  department: 'Refining' },
    { name: 'Storage Tank Farm',    site: 'Tank Area',   department: 'Storage' },
    { name: 'Compressor Station',   site: 'Utilities',   department: 'Utilities' },
    { name: 'Control Room',         site: 'Main Plant',  department: 'Operations' },
    { name: 'Maintenance Workshop', site: 'Support',     department: 'Maintenance' },
    { name: 'Loading Dock',         site: 'Logistics',   department: 'Logistics' },
    { name: 'Cooling Tower',        site: 'Utilities',   department: 'Utilities' },
  ];
  const locations = await Promise.all(locationNames.map((l) => prisma.location.create({ data: l })));
  console.log(`✅ ${locations.length} locations created`);

  // ── Incident Types ──────────────────────────────────────────────────────
  const typeNames = [
    { name: 'Process Safety',       category: 'Safety',      description: 'Process safety events' },
    { name: 'Personal Injury',      category: 'Health',      description: 'Injuries to personnel' },
    { name: 'Environmental Release',category: 'Environment', description: 'Releases to the environment' },
    { name: 'Equipment Failure',    category: 'Asset',       description: 'Failure of equipment or assets' },
    { name: 'Near Miss',            category: 'Safety',      description: 'Potential incidents averted' },
    { name: 'Fire & Explosion',     category: 'Safety',      description: 'Fire or explosion events' },
    { name: 'Spill & Leak',         category: 'Environment', description: 'Liquid or gas spills and leaks' },
    { name: 'Security',             category: 'Security',    description: 'Security-related incidents' },
  ];
  const types = await Promise.all(typeNames.map((t) => prisma.incidentType.create({ data: t })));
  console.log(`✅ ${types.length} incident types created`);

  // ── Subcategories ───────────────────────────────────────────────────────
  await prisma.incidentSubcategory.createMany({
    data: [
      { incidentTypeId: types[0].id, name: 'Pressure Release',  description: 'Unexpected pressure release' },
      { incidentTypeId: types[0].id, name: 'Chemical Exposure', description: 'Worker exposure to chemicals' },
      { incidentTypeId: types[1].id, name: 'Slip, Trip & Fall', description: 'Slips, trips, and falls' },
      { incidentTypeId: types[1].id, name: 'Struck By Object',  description: 'Being struck by moving objects' },
      { incidentTypeId: types[2].id, name: 'Air Emission',      description: 'Unauthorized air emissions' },
      { incidentTypeId: types[2].id, name: 'Water Discharge',   description: 'Water discharge incidents' },
      { incidentTypeId: types[3].id, name: 'Mechanical Failure',description: 'Mechanical equipment failure' },
      { incidentTypeId: types[3].id, name: 'Electrical Failure',description: 'Electrical system failure' },
    ],
  });
  console.log('✅ Subcategories created');

  // ── Consequences ────────────────────────────────────────────────────────
  await prisma.incidentConsequence.createMany({
    data: [
      { name: 'Fatality',             severityWeight: 5, description: 'Death of a person' },
      { name: 'Serious Injury',       severityWeight: 4, description: 'Injury requiring hospitalization' },
      { name: 'Minor Injury',         severityWeight: 3, description: 'First aid or minor medical treatment' },
      { name: 'Environmental Damage', severityWeight: 4, description: 'Damage to the environment' },
      { name: 'Asset Damage',         severityWeight: 3, description: 'Damage to equipment or facilities' },
      { name: 'Production Loss',      severityWeight: 2, description: 'Loss of production' },
      { name: 'Near Miss',            severityWeight: 1, description: 'No harm but potential for harm existed' },
    ],
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
