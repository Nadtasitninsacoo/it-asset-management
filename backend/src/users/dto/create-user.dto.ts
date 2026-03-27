// backend/src/users/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'; // 👈 นำเข้าตัวตรวจสอบ

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้งาน' })
    username!: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'กรุณาระบุแผนก/ฝ่าย' })
    department!: string;

    @IsOptional() // 👈 ให้เป็นตัวเลือกได้ เผื่อหน้าบ้านไม่ได้ส่งมา
    @IsString()
    role?: string;
}