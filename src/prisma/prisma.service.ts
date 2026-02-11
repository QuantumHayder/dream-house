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

  cleanDb() {
    return this.$transaction([
      // this.bookmark.deleteMany(),
      // this.user.deleteMany()
    ]);
  }
}
