import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    const { username, password, name, department, role } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                department,
                role: role || 'USER'
            }
        });
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (user && (await comparePassword(password, user.password))) {
        const token = generateToken(user.id, user.role);
        res.json({ token, role: user.role, name: user.name });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};