import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaTaskRepository } from './repository/prisma-task.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    PrismaService,
    PrismaTaskRepository,
    { provide: 'TaskRepository', useClass: PrismaTaskRepository },
  ],
  exports: [TaskService, 'TaskRepository'],
})
export class TaskModule {}