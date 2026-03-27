import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

            return await this.prisma.user.create({
                data: {
                    username: createUserDto.username,
                    password: hashedPassword,
                    name: createUserDto.name,
                    department: createUserDto.department,
                    role: createUserDto.role || 'USER',
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Username นี้ถูกใช้ไปแล้วในกองทัพ');
            }
            console.error("💥 [Prisma Error]:", error);
            throw new InternalServerErrorException('เกิดข้อผิดพลาดภายในระบบฐานข้อมูล');
        }
    }

    async findOne(username: string) {
        return await this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findAll(page: number = 1) {
        try {
            return await this.prisma.user.findMany({
                orderBy: [
                    { role: 'asc' },
                    { createdAt: 'desc' }
                ],
            });
        } catch (error) {
            console.error("❌ [Prisma findAll Error]:", error);
            throw new InternalServerErrorException('ไม่สามารถดึงข้อมูลจากศูนย์บัญชาการได้');
        }
    }

    async update(id: number, updateUserDto: any) {
        try {
            const dataToUpdate: any = { ...updateUserDto };

            if (updateUserDto.password) {
                const salt = await bcrypt.genSalt(10);
                dataToUpdate.password = await bcrypt.hash(updateUserDto.password, salt);
            }

            return await this.prisma.user.update({
                where: { id },
                data: dataToUpdate,
            });
        } catch (error) {
            console.error("❌ [Update Error]:", error);
            throw new InternalServerErrorException('ไม่สามารถแก้ไขข้อมูลกำลังพลได้');
        }
    }

    async remove(id: number) {
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            console.error("❌ [Delete Error]:", error);
            throw new InternalServerErrorException('ไม่สามารถลบข้อมูลออกจากระบบได้');
        }
    }
}