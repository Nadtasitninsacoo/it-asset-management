import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);

        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: 'secret_key_jomphon_2026'
            }),
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                department: user.department
            }
        };
    }

    async register(dto: any) {
        const newUser = await this.usersService.create({
            username: dto.username,
            password: dto.password,
            name: dto.name,
            department: dto.department,
            role: dto.role || 'USER',
        });

        return this.login(newUser);
    }
}