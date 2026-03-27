import { Module } from '@nestjs/common';
import { BorrowRequestsService } from './borrow-requests.service';
import { BorrowRequestsController } from './borrow-requests.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [BorrowRequestsController],
    providers: [BorrowRequestsService, PrismaService],
})
export class BorrowRequestsModule { }