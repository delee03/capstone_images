import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from 'src/common/decorater/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            });
            const { sub } = payload;
            const user = await this.prismaService.nguoi_dung.findUnique({
                where: {
                    nguoi_dung_id: sub,
                },
                select: {
                    nguoi_dung_id: true,
                    email: true,
                    role: true,
                    ho_ten: true,
                    tuoi: true,
                    anh_dai_dien: true,
                    created_at: true,
                    updated_at: true,
                    refresh_token: true,
                },
            });
            if (!user) {
                throw new UnauthorizedException();
            }
            //console.log({ userFromGuard: user });
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            //   console.log('chạy vào đây');
            request['user_profile'] = user;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
