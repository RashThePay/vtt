import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient): Promise<User[]> {
  const users = [
    {
      username: 'captain_sparrow',
      email: 'jack.sparrow@pirates.sea',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'admiral_norrington',
      email: 'james.norrington@navy.gov',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'blackbeard',
      email: 'edward.teach@pirates.sea',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'anne_bonny',
      email: 'anne.bonny@pirates.sea',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'captain_kidd',
      email: 'william.kidd@privateers.org',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'gamemaster',
      email: 'gm@highseas.vtt',
      password: await bcrypt.hash('gmpassword', 10),
    },
    {
      username: 'دریابان',
      email: 'persian.captain@seas.ir',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'ناخدا_علی',
      email: 'captain.ali@persian.seas',
      password: await bcrypt.hash('password123', 10),
    },
  ];

  const createdUsers: User[] = [];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
    console.log(`   ✓ Created user: ${user.username}`);
  }

  return createdUsers;
}
