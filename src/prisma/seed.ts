import { PrismaClient, UnitType, UserRole } from 'generated/prisma/client';
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
      fname: 'Abd El-Rahman',
      lname: 'Hayder',
      username: 'hayder',
      hash: '$2b$10$UM4teIC5tlbdqB2XIeMLNeDXxxJMJTT4PnQCk.EBg1epM4LLWxmtS', // Admin123!
      role: UserRole.ADMIN,
    },
  });
  const companyH = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Inova',
    },
  });
  const projectAura = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Aura',
      country: 'Egypt',
      city: 'Cairo',
      UnitTypes: [UnitType.APARTMENT, UnitType.VILLA],
      companyId: companyH.id,
    },
  });

  const unitA = await prisma.unit.upsert({
    where: { id: 1 }, //id: 2
    update: {},
    create: {
      type: UnitType.VILLA,
      price: 7000000,
      size: 555,
      NumBedrooms: 5,
      NumBathrooms: 3,
      projectId: projectAura.id,
    },
  });

  console.log({ HayderAdmin, companyH, projectAura, unitA });
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
