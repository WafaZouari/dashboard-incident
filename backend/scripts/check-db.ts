import prisma from '../src/config/database';

async function main() {
  try {
    const count = await prisma.incident.count();
    console.log(`Total incidents: ${count}`);
    const users = await prisma.user.count();
    console.log(`Total users: ${count}`);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
