import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: any) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }
}