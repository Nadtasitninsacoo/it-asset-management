import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. เพิ่มอุปกรณ์ใหม่ (สำหรับ Admin)
export const addAsset = async (req: Request, res: Response) => {
    const { name, serialNumber } = req.body;
    try {
        const asset = await prisma.asset.create({
            data: { name, serialNumber }
        });
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ error: 'Serial number already exists' });
    }
};

// 2. ดึงรายชื่ออุปกรณ์ทั้งหมด
export const getAssets = async (req: Request, res: Response) => {
    const assets = await prisma.asset.findMany();
    res.json(assets);
};

// 3. ส่งคำขอยืมอุปกรณ์
export const requestBorrow = async (req: Request, res: Response) => {
    const { userId, assetId, expectedReturn } = req.body;
    try {
        const request = await prisma.borrowRequest.create({
            data: {
                userId,
                assetId,
                expectedReturn: new Date(expectedReturn),
                status: 'PENDING'
            }
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: 'Cannot create request' });
    }
};