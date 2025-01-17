import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { log } from 'console';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign Up user' })
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user' })
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh both access token and refresh token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                refresh_token: {
                    type: 'string',
                    description:
                        'The refresh token used to generate a new access token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
        },
    })
    async refreshToken(@Body('refresh_token') refreshToken: string) {
        return this.authService.refresh(refreshToken);
    }
}
