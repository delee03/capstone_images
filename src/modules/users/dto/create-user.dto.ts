import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    IsEmail,
    IsOptional,
    IsString,
    IsInt,
    Min,
    Max,
} from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @ApiProperty()
    email: string;

    @ApiProperty()
    @IsString()
    mat_khau: string;

    @ApiProperty()
    @IsString()
    ho_ten: string;

    @ApiProperty()
    @IsInt()
    @Min(18)
    @Max(100)
    tuoi: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    anh_dai_dien?: string;
}
