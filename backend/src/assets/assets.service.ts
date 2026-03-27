import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
    constructor(private prisma: PrismaService) { }

    async createAsset(data: {
        name: string;
        serialNumber: string;
        status: string;
        category: string;
        image: string | null
    }) {
        return this.prisma.asset.create({
            data: {
                name: data.name,
                serialNumber: data.serialNumber,
                status: data.status || 'AVAILABLE',
                category: data.category || 'General',
                image: data.image,
            },
        });
    }

    async findAll(page: number = 1) {
        const limit = 8;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.asset.findMany({
                skip: skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            this.prisma.asset.count(),
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

    async deleteAsset(id: number) {
        return this.prisma.asset.delete({
            where: { id },
        });
    }

    async updateAsset(id: number, data: any) {
        try {
            return await this.prisma.asset.update({
                where: { id: id },
                data: {
                    name: data.name,
                    serialNumber: data.serialNumber,
                    category: data.category,
                    status: data.status,
                    image: data.image,
                },
            });
        } catch (error) {
            console.error("❌ Prisma Update Error:", error);
            throw new Error(`ไม่สามารถอัปเดตอุปกรณ์ ID ${id} ได้`);
        }
    }
}