import { IsEmail, IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ description: 'Email of the user' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Password of the user' })
    @IsString()
    @IsNotEmpty()
    mat_khau: string;

    @ApiProperty({ description: 'Full name of the user' })
    @IsString()
    @IsNotEmpty()
    ho_ten: string;

    @ApiProperty({ description: 'Age of the user', minimum: 0 })
    @IsInt()
    @Min(0)
    tuoi: number;
}
