import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  create(data: { title: string; source?: string }): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  update(id: number, data: Partial<Task>): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }

  remove(id: number): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}