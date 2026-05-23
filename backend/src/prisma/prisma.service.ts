import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    const pool = new Pool(
      connectionString ? { connectionString } : undefined,
    );

    super({
      adapter: new PrismaPg(pool),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
