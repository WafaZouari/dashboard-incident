import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Guard: skip if already seeded
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@petrosite.com' } });
  if (existingAdmin) {
    console.log('⚠️  Database already seeded. Skipping user creation.');
    console.log('\n📋 Login credentials (password: Admin1234!):');
    console.log('   admin@petrosite.com        — Admin');
    console.log('   manager@petrosite.com      — Manager');
    console.log('   investigator@petrosite.com — Investigator');
    console.log('   viewer@petrosite.com       — Viewer');
    return;
  }

  // Users
  const password = await bcrypt.hash('Admin1234!', 12);

  await prisma.user.create({
    data: { email: 'admin@petrosite.com', passwordHash: password, firstName: 'System', lastName: 'Admin', role: 'admin', department: 'HSE' },
  });
  await prisma.user.create({
    data: { email: 'manager@petrosite.com', passwordHash: password, firstName: 'John', lastName: 'Martinez', role: 'manager', department: 'Operations' },
  });
  await prisma.user.create({
    data: { email: 'investigator@petrosite.com', passwordHash: password, firstName: 'Sarah', lastName: 'Chen', role: 'investigator', department: 'HSE' },
  });
  await prisma.user.create({
    data: { email: 'viewer@petrosite.com', passwordHash: password, firstName: 'Mike', lastName: 'Johnson', role: 'viewer', department: 'Maintenance' },
  });
  console.log('✅ 4 users created');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials (password: Admin1234!):');
  console.log('   admin@petrosite.com        — Admin');
  console.log('   manager@petrosite.com      — Manager');
  console.log('   investigator@petrosite.com — Investigator');
  console.log('   viewer@petrosite.com       — Viewer');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
