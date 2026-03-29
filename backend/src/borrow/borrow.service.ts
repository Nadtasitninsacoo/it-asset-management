import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BorrowService {
    constructor(private prisma: PrismaService) { }

    async createRequest(data: any) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: data.assetId },
        });

        if (!asset || asset.status !== 'AVAILABLE') {
            throw new BadRequestException('อุปกรณ์ไม่พร้อมใช้งานในขณะนี้');
        }

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

    async approveRequest(requestId: number) {
        return await this.prisma.$transaction(async (tx) => {
            const request = await tx.borrowRequest.findUnique({
                where: { id: requestId },
                include: { asset: true },
            });

            if (!request || request.status !== 'PENDING') {
                throw new BadRequestException('คำขอนี้ไม่อยู่ในสถานะที่อนุมัติได้');
            }

            const activeBorrows = await tx.borrowRequest.count({
                where: {
                    userId: request.userId,
                    status: 'APPROVED',
                },
            });

            if (activeBorrows >= 3) {
                throw new BadRequestException('พนักงานคนนี้ยืมอุปกรณ์ครบโควตา 3 ชิ้นแล้ว');
            }

            if (request.asset.status !== 'AVAILABLE') {
                throw new BadRequestException('อุปกรณ์นี้ไม่พร้อมให้ยืมในขณะนี้');
            }

            await tx.borrowRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED', approvedAt: new Date() },
            });

            await tx.asset.update({
                where: { id: request.assetId },
                data: { status: 'BORROWED' },
            });

            return { message: 'อนุมัติการยืมสำเร็จ' };
        });
    }

    async rejectRequest(requestId: number) {
        const request = await this.prisma.borrowRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.status !== 'PENDING') {
            throw new BadRequestException('ไม่สามารถปฏิเสธคำขอนี้ได้');
        }

        return await this.prisma.borrowRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
    }

    async returnAsset(requestId: number) {
        return await this.prisma.$transaction(async (tx) => {
            const request = await tx.borrowRequest.findUnique({
                where: { id: requestId },
            });

            if (!request || request.status !== 'APPROVED') {
                throw new BadRequestException('คำขอนี้ไม่ได้อยู่ในสถานะที่คืนได้');
            }

            await tx.borrowRequest.update({
                where: { id: requestId },
                data: { status: 'RETURNED', actualReturn: new Date() },
            });

            await tx.asset.update({
                where: { id: request.assetId },
                data: { status: 'AVAILABLE' },
            });

            return { message: 'คืนอุปกรณ์สำเร็จ' };
        });
    }
}