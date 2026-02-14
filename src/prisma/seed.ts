import { PrismaClient } from 'generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

const config = new ConfigService();
const adapter = new PrismaPg({
  host: config.get<string>('DATABASE_HOST'),
  port: config.get<number>('DATABASE_PORT'),
  user: config.get<string>('DATABASE_USER'),
  password: config.get<string>('DATABASE_PASSWORD'),
  database: config.get<string>('DATABASE_NAME'),
});

const prisma = new PrismaClient({ adapter });
async function main() {
  const HayderAdmin = await prisma.user.upsert({
    where: {
      email: 'hayder@dreamhouse.com',
    },
    update: {},
    create: {
      email: 'hayder@dreamhouse.com',
      Fname: 'Abd El-Rahman',
      Lname: 'Hayder',
      Username: 'hayder',
      Hash: '$2b$10$UM4teIC5tlbdqB2XIeMLNeDXxxJMJTT4PnQCk.EBg1epM4LLWxmtS', // Admin123!
      Role: 'ADMIN',
    },
  });
  console.log({ HayderAdmin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// "Username": "hayder",
// "email": "hayder@dreamhouse.com",
// "password": "Admin123!"
