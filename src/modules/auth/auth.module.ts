import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        UsersModule,
        JwtModule.register({
            global: true,
            secret: process.env.ACCESS_TOKEN_SECRET,
            signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UsersService],
})
export class AuthModule {}
