import prisma from '../config/database';
import bcrypt from 'bcryptjs';

async function setupAdmin() {
  const email = 'admin@tps.com';
  const password = 'AdminPassword123!';
  
  let admin = await prisma.user.findUnique({ where: { email } });
  
  if (!admin) {
    const passwordHash = await bcrypt.hash(password, 12);
    admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true,
      }
    });
    console.log('Created new admin user.');
  } else {
    // Ensure role is ADMIN
    if (admin.role !== 'ADMIN') {
      admin = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      });
      console.log('Updated existing user to ADMIN role.');
    }
    
    // Optionally reset password so we know what it is
    const passwordHash = await bcrypt.hash(password, 12);
    admin = await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log('Reset admin password.');
  }
  
  console.log('--- ADMIN CREDENTIALS ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('-------------------------');
}

setupAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
