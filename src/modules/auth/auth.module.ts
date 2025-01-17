import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService, UsersService, JwtService],
})
export class AuthModule {}
