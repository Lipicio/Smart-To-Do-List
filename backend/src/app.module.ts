import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { HealthModule } from './health/health.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TaskModule, HealthModule],
  providers: [PrismaService],
})
export class AppModule {}
