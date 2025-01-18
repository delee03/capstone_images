import { Body, Injectable, UnauthorizedException } from '@nestjs/common';

interface TUserExist {
    nguoi_dung_id: number;
    email: string;
    mat_khau: string;
    role: string;
}
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { access } from 'fs';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login(loginDto: LoginDto): Promise<{
        message: string;
        tokens?: { accessToken: string; refreshToken: string };
    }> {
        if (!loginDto || !loginDto.email || !loginDto.mat_khau) {
            throw new Error('Please provide a valid email and password');
        }
        const user = await this.prismaService.nguoi_dung.findFirst({
            where: {
                email: loginDto.email,
            },
            select: {
                nguoi_dung_id: true,
                mat_khau: true,
                email: true,
                role: true,
            },
        });
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
        // const payload = {
        //     email: user.email,
        //     sub: user.nguoi_dung_id,
        //     ho_ten: user.ho_ten,
        //     role: user.role,
        // };
        // console.log(user);

        // wait for it to resolve
        const tokens = await this.createToken(user);
        // console.log({ token2: tokens });
        return {
            message: 'Login successfully',
            tokens,
        };
    }

    async register(
        registerDto: RegisterDto,
    ): Promise<{ message: string; content?: any }> {
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
            content: newUser,
        };
    }

    async forgotPassword() {
        return 'This action sends a password reset email';
    }

    async refresh(refreshToken: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
    }> {
        try {
            //verify refresh token and get the payload
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            });

            if (!payload) {
                throw new Error('Invalid or expired refresh token');
            }
            console.log(payload);

            //extract the user id from the payload
            const { sub, role } = payload;
            const userChecking = await this.prismaService.nguoi_dung.findFirst({
                where: {
                    nguoi_dung_id: sub,
                },
            });
            if (!userChecking || userChecking.refresh_token !== refreshToken) {
                throw new UnauthorizedException();
            }

            const newAccessToken = await this.jwtService.signAsync(
                {
                    email: userChecking.email,
                    sub: userChecking.nguoi_dung_id,
                    role: userChecking.role,
                },
                {
                    secret: this.configService.get<string>(
                        'ACCESS_TOKEN_SECRET',
                    ),
                    expiresIn: this.configService.get<string>(
                        'ACCESS_TOKEN_EXPIRES_IN',
                    ),
                },
            );

            // Generate a new refresh token
            const newRefreshToken = await this.jwtService.signAsync(
                {
                    email: userChecking.email,
                    sub: userChecking.nguoi_dung_id,
                    role: userChecking.role,
                },
                {
                    secret: this.configService.get<string>(
                        'REFRESH_TOKEN_SECRET',
                    ),
                    expiresIn: this.configService.get<string>(
                        'REFRESH_TOKEN_EXPIRES_IN',
                    ),
                },
            );

            // Update the new refresh token in the database
            await this.prismaService.nguoi_dung.update({
                where: { nguoi_dung_id: userChecking.nguoi_dung_id },
                data: { refresh_token: newRefreshToken },
            });

            return {
                message: 'Tokens refreshed successfully',
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        } catch (error) {
            // Handle expired or invalid refresh token
            throw {
                statusCode: 401,
                message:
                    'Refresh token is invalid or has expired. Please log in again.',
            };
        }
    }

    async createToken(
        userExist: TUserExist,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        console.log({
            token: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>(
                'ACCESS_TOKEN_EXPIRES_IN',
            ),
            refreshTokenSecret: this.configService.get<string>(
                'REFRESH_TOKEN_SECRET',
            ),
            refreshTokenExpiresIn: this.configService.get<string>(
                'REFRESH_TOKEN_EXPIRES_IN',
            ),
        });
        const accessToken = await this.jwtService.signAsync(
            {
                email: userExist.email,
                sub: userExist.nguoi_dung_id,
                role: userExist.role,
            },
            {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>(
                    'ACCESS_TOKEN_EXPIRES_IN',
                ),
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            {
                email: userExist.email,
                sub: userExist.nguoi_dung_id,
                role: userExist.role,
            },
            {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>(
                    'REFRESH_TOKEN_EXPIRES_IN',
                ),
            },
        );

        //store refresh token in db
        await this.prismaService.nguoi_dung.update({
            where: {
                nguoi_dung_id: userExist.nguoi_dung_id,
            },
            data: {
                refresh_token: refreshToken,
            },
        });
        // console.log(accessToken + '----' + refreshToken);
        return { accessToken, refreshToken };
    }

    async getProfile(id: number) {
        return this.userService.findOne(id);
    }
}
