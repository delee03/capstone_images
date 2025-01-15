import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //Marking the module as @Global() allows the PrismaService to be shared across the application without needing to import the PrismaModule in every feature module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
