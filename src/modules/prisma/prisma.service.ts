import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(); // Initialize the Prisma Client
  }

  // Called when the module is initialized
  async onModuleInit() {
    await this.$connect();
  }

  // Called when the module is destroyed
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
