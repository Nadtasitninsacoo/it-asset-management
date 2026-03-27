import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BorrowRequestsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: any) {
        console.log('--------------------------------------------------');
        console.log('🚀 [COMMANDER DEBUG] START CREATE REQUEST');

        const assetId = Number(dto.assetId);
        const userId = Number(dto.userId);

        if (!assetId || !userId || isNaN(assetId) || isNaN(userId)) {
            throw new BadRequestException(`ข้อมูลไม่ครบถ้วน - assetId: ${dto.assetId}, userId: ${dto.userId}`);
        }

        const activeRequestsCount = await this.prisma.borrowRequest.count({
            where: {
                userId: userId,
                status: { in: ['PENDING', 'APPROVED'] }
            }
        });

        if (activeRequestsCount >= 3) {
            throw new BadRequestException('ท่านจอมพล! พนักงานท่านนี้มียุทโธปกรณ์ค้างสายเกิน 3 ชิ้นแล้ว');
        }

        const expectedReturnDate = new Date(dto.expectedReturn);
        if (isNaN(expectedReturnDate.getTime())) {
            throw new BadRequestException('รูปแบบวันที่คืนไม่ถูกต้อง');
        }

        try {
            const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
            if (!asset) throw new NotFoundException('ไม่พบยุทโธปกรณ์นี้ในคลังแสง');

            if (asset.status !== 'AVAILABLE') {
                throw new BadRequestException('ยุทโธปกรณ์นี้ไม่พร้อมใช้งาน (อาจถูกยืมหรือซ่อมบำรุง)');
            }

            return await this.prisma.borrowRequest.create({
                data: {
                    assetId,
                    userId,
                    purpose: dto.purpose || 'ไม่มีระบุวัตถุประสงค์',
                    expectedReturn: expectedReturnDate,
                    status: 'PENDING',
                },
            });
        } catch (error: any) {
            console.error("💥 [DATABASE ERROR]:", error);

            if (error.code === 'P2003') {
                throw new BadRequestException('ข้อมูล User หรือ Asset ไม่มีความเชื่อมโยงในระบบ');
            }

            if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('ศูนย์บัญชาการฐานข้อมูลขัดข้อง (Database Failed)');
        }
    }

    async findMyHistory(targetUserId: number) {
        return await this.prisma.borrowRequest.findMany({
            where: { userId: targetUserId },
            include: {
                asset: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: number, dto: { status: string; adminComment?: string }) {
        const request = await this.prisma.borrowRequest.findUnique({
            where: { id },
        });

        if (!request) throw new NotFoundException('Request not found');

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.borrowRequest.update({
                where: { id },
                data: {
                    status: dto.status,
                    adminComment: dto.adminComment,
                    approvedAt: dto.status === 'APPROVED' ? new Date() : undefined,
                    actualReturn: dto.status === 'RETURNED' ? new Date() : undefined,
                },
            });

            if (dto.status === 'APPROVED') {
                await tx.asset.update({ where: { id: request.assetId }, data: { status: 'BORROWED' } });
            } else if (dto.status === 'RETURNED' || dto.status === 'REJECTED') {
                await tx.asset.update({ where: { id: request.assetId }, data: { status: 'AVAILABLE' } });
            }

            return updated;
        });
    }

    async handleReturnProcess(requestId: number) {
        return await this.prisma.$transaction(async (tx) => {

            const request = await tx.borrowRequest.findUnique({
                where: { id: requestId },
                include: { asset: true }
            });

            if (!request || request.status !== 'APPROVED') {
                throw new BadRequestException('ยุทโธปกรณ์นี้ไม่ได้อยู่ในสถานะที่สามารถส่งคืนได้');
            }

            const updatedRequest = await tx.borrowRequest.update({
                where: { id: requestId },
                data: {
                    status: 'RETURNED',
                    actualReturn: new Date()
                }
            });

            await tx.asset.update({
                where: { id: request.assetId },
                data: { status: 'AVAILABLE' }
            });

            console.log(`✨ [AUDIT] Asset ${request.asset.name} returned by User ${request.userId} at ${new Date().toISOString()}`);

            return updatedRequest;
        });
    }

    async findAll(page: number = 1, limit: number = 6) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.borrowRequest.findMany({
                skip,
                take: limit,
                include: {
                    user: { select: { name: true, department: true } },
                    asset: { select: { name: true, serialNumber: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.borrowRequest.count(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async hardDelete(id: number) {
        try {
            return await this.prisma.borrowRequest.delete({
                where: { id: id },
            });
        } catch (error) {
            throw new BadRequestException('ไม่สามารถทำลายข้อมูลได้ เนื่องจากไม่พบรหัสยุทโธปกรณ์นี้');
        }
    }
}