import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { PrismaService } from './prisma/prisma.service';

import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';

import { BorrowRequestsModule } from './borrow-requests/borrow-requests.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    BorrowRequestsModule,
  ],
  controllers: [AppController, AssetsController],
  providers: [AppService, AssetsService, PrismaService],
})
export class AppModule { }