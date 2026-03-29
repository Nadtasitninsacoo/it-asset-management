import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addAsset = async (req: Request, res: Response) => {
    const { name, serialNumber, category } = req.body;

    try {
        const asset = await prisma.asset.create({
            data: {
                name,
                serialNumber,
                category: category || 'Other',
                status: 'AVAILABLE'
            }
        });
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ message: 'Serial number นี้มีอยู่ในระบบคลังแสงแล้ว' });
    }
};

export const getAssets = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const [assets, total] = await prisma.$transaction([
            prisma.asset.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.asset.count()
        ]);

        res.json({
            data: assets,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'การดึงข้อมูลยุทโธปกรณ์ขัดข้อง' });
    }
};

export const requestBorrow = async (req: Request, res: Response) => {
    const { userId, assetId, expectedReturn, purpose } = req.body;

    try {
        const asset = await prisma.asset.findUnique({ where: { id: Number(assetId) } });

        if (!asset) {
            return res.status(404).json({ message: 'ไม่พบยุทโธปกรณ์ชิ้นนี้' });
        }

        if (asset.status !== 'AVAILABLE') {
            return res.status(400).json({ message: 'ยุทโธปกรณ์นี้ถูกหน่วยอื่นยืมไปแล้วหรือกำลังซ่อมบำรุง' });
        }

        const activeCount = await prisma.borrowRequest.count({
            where: {
                userId: Number(userId),
                status: { in: ['PENDING', 'APPROVED'] }
            }
        });

        if (activeCount >= 3) {
            return res.status(400).json({ message: 'พนักงานท่านนี้มียุทโธปกรณ์ค้างสายเกิน 3 ชิ้นแล้ว' });
        }

        const request = await prisma.borrowRequest.create({
            data: {
                userId: Number(userId),
                assetId: Number(assetId),
                expectedReturn: new Date(expectedReturn),
                purpose: purpose || 'ไม่มีระบุวัตถุประสงค์',
                status: 'PENDING'
            }
        });

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'ไม่สามารถส่งคำขอยืมได้ในขณะนี้' });
    }
};