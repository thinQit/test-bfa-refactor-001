import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'jane.doe@example.com',
      name: 'Jane Doe',
      passwordHash
    }
  });

  const dueSoon = new Date();
  dueSoon.setDate(dueSoon.getDate() + 3);

  await prisma.todo.create({
    data: {
      userId: user.id,
      title: 'Finish onboarding tasks',
      description: 'Complete the project setup and read the guidelines.',
      completed: false,
      dueDate: dueSoon
    }
  });

  await prisma.todo.create({
    data: {
      userId: user.id,
      title: 'Plan weekly goals',
      description: 'Outline priorities for the week and assign timelines.',
      completed: true
    }
  });

  const refreshExpires = new Date();
  refreshExpires.setDate(refreshExpires.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: 'seed-refresh-token',
      userId: user.id,
      expiresAt: refreshExpires
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });