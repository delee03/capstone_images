import { ApiProperty, PartialType } from '@nestjs/swagger'; // Use from '@nestjs/swagger' instead of '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto';
import {
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ required: false, description: 'Optional email for update' }) //can override the @ApiProperty decorators
    email?: string;
    // @IsOptional()
    // @IsEmail()
    // email?: string;

    // @IsOptional()
    // @IsString()
    // mat_khau?: string;

    // @IsOptional()
    // @IsString()
    // ho_ten?: string;

    // @IsOptional()
    // @IsInt()
    // @Min(18)
    // @Max(100)
    // tuoi?: number;

    // @IsOptional()
    // @IsString()
    // anh_dai_dien?: string;
}
