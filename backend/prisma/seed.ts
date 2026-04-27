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

  // ── Sample Incidents (30 across 12 months) ──────────────────────────────
  const incidentData = [
    { title: 'Pressure relief valve failure in Unit A',      typeIdx: 0, locIdx: 0, sev: 4 },
    { title: 'Worker slip near cooling tower base',          typeIdx: 1, locIdx: 7, sev: 2 },
    { title: 'Hydrocarbon leak detected at flange joint',    typeIdx: 6, locIdx: 1, sev: 3 },
    { title: 'Compressor bearing overheating alarm',         typeIdx: 3, locIdx: 3, sev: 3 },
    { title: 'Chemical eye irritation incident in lab',      typeIdx: 1, locIdx: 4, sev: 2 },
    { title: 'Near miss: crane swing over walkway',          typeIdx: 4, locIdx: 6, sev: 4 },
    { title: 'Control panel electrical fault',               typeIdx: 3, locIdx: 4, sev: 3 },
    { title: 'Gas detector false alarm — evacuation',        typeIdx: 4, locIdx: 0, sev: 2 },
    { title: 'Oil spill in storage area — 50L',              typeIdx: 6, locIdx: 2, sev: 3 },
    { title: 'Heat exchanger tube failure',                  typeIdx: 3, locIdx: 0, sev: 4 },
    { title: 'Worker fall from scaffold — 2m',               typeIdx: 1, locIdx: 5, sev: 4 },
    { title: 'Pump seal failure — benzene release',          typeIdx: 0, locIdx: 1, sev: 5 },
    { title: 'Forklift near miss at dock gate',              typeIdx: 4, locIdx: 6, sev: 3 },
    { title: 'Small fire in electrical substation',          typeIdx: 5, locIdx: 4, sev: 4 },
    { title: 'Waste water discharge limit exceeded',         typeIdx: 2, locIdx: 7, sev: 3 },
    { title: 'Pipe corrosion detected in inspection',        typeIdx: 3, locIdx: 0, sev: 2 },
    { title: 'Struck by hand tool — minor laceration',       typeIdx: 1, locIdx: 5, sev: 2 },
    { title: 'Thermal relief discharge to flare',            typeIdx: 0, locIdx: 0, sev: 3 },
    { title: 'Security breach at perimeter fence',           typeIdx: 7, locIdx: 6, sev: 2 },
    { title: 'Nitrogen over-pressurization event',           typeIdx: 0, locIdx: 3, sev: 5 },
    { title: 'Dust explosion in catalyst hopper',            typeIdx: 5, locIdx: 1, sev: 5 },
    { title: 'Vehicle backing incident at warehouse',        typeIdx: 4, locIdx: 5, sev: 2 },
    { title: 'Cooling water contamination',                  typeIdx: 2, locIdx: 7, sev: 3 },
    { title: 'Manual handling back strain injury',           typeIdx: 1, locIdx: 5, sev: 2 },
    { title: 'Tank overfill near-miss',                      typeIdx: 4, locIdx: 2, sev: 4 },
    { title: 'Valve packing leak — H2S detection',           typeIdx: 0, locIdx: 0, sev: 5 },
    { title: 'Scaffold collapse incident',                   typeIdx: 1, locIdx: 0, sev: 4 },
    { title: 'Instrumentation failure during startup',       typeIdx: 3, locIdx: 4, sev: 3 },
    { title: 'Contractor fall — inadequate PPE',             typeIdx: 1, locIdx: 6, sev: 3 },
    { title: 'Flammable liquid spill during transfer',       typeIdx: 6, locIdx: 2, sev: 4 },
  ];

  const statuses = ['open', 'under_investigation', 'closed'];

  for (let i = 0; i < incidentData.length; i++) {
    const inc = incidentData[i];
    const monthOffset = Math.floor(i / 3);
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    date.setDate(Math.floor(Math.random() * 28) + 1);

    const year = date.getFullYear();
    const incidentId = `INC-${year}-${String(i + 1).padStart(4, '0')}`;

    await prisma.incident.create({
      data: {
        incidentId,
        title: inc.title,
        description: `${inc.title}. All personnel accounted for. Corrective actions being implemented per safety procedures.`,
        dateOccurred: date,
        locationId:      locations[inc.locIdx]?.id,
        incidentTypeId:  types[inc.typeIdx]?.id,
        actualSeverity:  inc.sev,
        potentialSeverity: Math.min(5, inc.sev + 1),
        isHighPotential: inc.sev >= 4,
        status:           statuses[i % 3],
        reportedById:     admin.id,
        createdById:      admin.id,
        responsibleSupervisorId: investigator.id,
      },
    });
  }

  console.log(`✅ ${incidentData.length} sample incidents created`);
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
