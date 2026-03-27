import { Controller, Post, Body, Get, Query, Patch, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        console.log("📥 [Controller] บันทึกกำลังพลใหม่:", createUserDto);
        return this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(@Query('page') page: string) {
        console.log("📡 [Controller] มีการร้องขอรายชื่อกำลังพลทั้งหมด (Page:", page, ")");
        try {
            const result = await this.usersService.findAll(+page || 1);
            console.log("✅ [Controller] ดึงรายชื่อสำเร็จ ส่งกลับหน้าบ้านแล้ว");
            return result;
        } catch (error) {
            console.error("❌ [Controller] ดึงข้อมูลล้มเหลว:", error.message);
            throw error;
        }
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}