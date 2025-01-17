import { Body, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { access } from 'fs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        if (!loginDto || !loginDto.email || !loginDto.mat_khau) {
            throw new Error('Please provide a valid email and password');
        }
        const user = await this.userService.findUserByEmail(loginDto.email);
        if (!user) {
            return {
                message: 'User not found',
            };
        }
        const isPasswordMatch = await bcrypt.compare(
            loginDto.mat_khau,
            user.mat_khau,
        );
        if (!isPasswordMatch) {
            return {
                message: 'Invalid password',
            };
        }
        const payload = {
            email: user.email,
            sub: user.nguoi_dung_id,
            ho_ten: user.ho_ten,
            role: user.role,
        };
        return {
            message: 'Login successfully',
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async register(registerDto: RegisterDto) {
        if (!registerDto || !registerDto.email || !registerDto.mat_khau) {
            throw new Error('Please provide a valid email and password');
        }
        const existUser = await this.userService.findUserByEmail(
            registerDto.email,
        );
        if (existUser) {
            return {
                message: 'Email already exists',
            };
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
            registerDto.mat_khau,
            saltRounds,
        );
        const newUser = await this.prismaService.nguoi_dung.create({
            data: {
                email: registerDto.email,
                mat_khau: hashedPassword,
                ho_ten: registerDto.ho_ten,
                tuoi: registerDto.tuoi,
            },
        });
        return {
            message: 'User registered successfully',
            data: newUser,
        };
    }

    async forgotPassword() {
        return 'This action sends a password reset email';
    }
}
