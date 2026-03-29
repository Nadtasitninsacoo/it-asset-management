import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BorrowService {
    constructor(private prisma: PrismaService) { }

    async createRequest(data: any) {
        return await this.prisma.borrowRequest.create({
            data: {
                userId: data.userId,
                assetId: data.assetId,
                expectedReturn: new Date(data.expectedReturn),
                purpose: data.purpose,
                status: 'PENDING',
            },
        });
    }

    async approveRequest(id: number) {
        return await this.prisma.borrowRequest.update({
            where: { id },
            data: { status: 'APPROVED', approvedAt: new Date() },
        });
    }

    async rejectRequest(id: number) {
        return await this.prisma.borrowRequest.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }

    async returnAsset(id: number) {
        return await this.prisma.borrowRequest.update({
            where: { id },
            data: { status: 'RETURNED', actualReturn: new Date() },
        });
    }
}