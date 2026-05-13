import prisma from '../src/config/database';

async function main() {
  console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('$')));
}

main().catch(console.error);
