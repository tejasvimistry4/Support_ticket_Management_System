import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('admin@123', saltRounds);
  const agentPasswordHash = await bcrypt.hash('agent@123', saltRounds);

  // Upsert default Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
      name: 'System Administrator',
    },
    create: {
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // Upsert default Support Agent 1
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent@gmail.com' },
    update: {
      password: agentPasswordHash,
      role: Role.SUPPORT_AGENT,
      name: 'Alex Agent',
    },
    create: {
      name: 'Alex Agent',
      email: 'agent@gmail.com',
      password: agentPasswordHash,
      role: Role.SUPPORT_AGENT,
    },
  });

  console.log('✅ Database seeded successfully:');
  console.log(`   Admin: ${admin.email} (Role: ${admin.role}) - Password: admin@123`);
  console.log(`   Agent 1: ${agent1.email} (Role: ${agent1.role}) - Password: agent@123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

