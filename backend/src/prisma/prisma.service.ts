import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool, type PoolConfig } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const poolConfig: PoolConfig | undefined = connectionString
      ? { connectionString }
      : undefined;

    const pool = new Pool(poolConfig);

    super({
      adapter: new PrismaPg(pool),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
