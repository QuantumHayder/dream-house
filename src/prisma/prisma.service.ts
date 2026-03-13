import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      host: config.get<string>('DATABASE_HOST'),
      port: config.get<number>('DATABASE_PORT'),
      user: config.get<string>('DATABASE_USER'),
      password: config.get<string>('DATABASE_PASSWORD'),
      database: config.get<string>('DATABASE_NAME'),
    });
    super({ adapter });
  }

  async cleanDb() {
    return this.$transaction([
      // Delete in dependency order — children before parents
      this.message.deleteMany(),
      this.chat.deleteMany(),
      this.payment.deleteMany(),
      this.subscription.deleteMany(),
      this.unit.deleteMany(),
      this.project.deleteMany(),
      this.user.deleteMany(),
      this.company.deleteMany(),
    ]);
  }
}
