import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        // Inject the PrismaService into the UsersService
        private readonly prismaService: PrismaService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        return await this.prismaService.nguoi_dung.create({
            data: createUserDto,
        });
    }

    async findAll() {
        return await this.prismaService.nguoi_dung.findMany();
    }

    async findUserByEmail(email: string): Promise<any> {
        return await this.prismaService.nguoi_dung.findFirst({
            where: {
                email: email,
            },
        });
    }

    async findOne(id: number): Promise<any> {
        return await this.prismaService.nguoi_dung.findUnique({
            where: {
                nguoi_dung_id: id,
            },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        return await this.prismaService.nguoi_dung.update({
            where: {
                nguoi_dung_id: id,
            },
            data: updateUserDto,
        });
    }

    async remove(id: number) {
        return await this.prismaService.nguoi_dung.delete({
            where: {
                nguoi_dung_id: id,
            },
        });
    }
}
