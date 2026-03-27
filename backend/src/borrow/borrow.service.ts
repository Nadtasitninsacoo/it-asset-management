import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BorrowService {
    constructor(private prisma: PrismaService) { }

    async approveRequest(requestId: number) {
        return await this.prisma.$transaction(async (tx) => {

            const request = await tx.borrowRequest.findUnique({
                where: { id: requestId },
                include: { user: true, asset: true },
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
                data: { status: 'APPROVED' },
            });

            await tx.asset.update({
                where: { id: request.assetId },
                data: { status: 'BORROWED' },
            });

            return { message: 'อนุมัติการยืมสำเร็จ' };
        });
    }
}