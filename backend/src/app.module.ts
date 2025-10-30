import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './task/task.module';
import { HealthModule } from './health/health.module';
import { PrismaService } from './prisma/prisma.service';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TaskModule, 
    HealthModule, 
    LlmModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
