import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaTaskRepository } from './repository/prisma-task.repository.ts';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [
    TaskService,
    PrismaService,
    {
      provide: 'TaskRepository',
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [TaskService, 'TaskRepository'],
})
export class TaskModule {}