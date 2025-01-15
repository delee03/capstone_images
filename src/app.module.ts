import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ImagesModule } from './modules/images/images.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { Router } from 'express';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    UsersModule,
    ImagesModule,
    AuthModule,
    PrismaModule,
    RouterModule.register([
      {
        path: 'users-module',
        module: UsersModule, //should to change to AdminModule later on
        children: [
          {
            path: 'users-list',
            module: UsersModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
