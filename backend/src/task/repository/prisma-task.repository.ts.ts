import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // ajuste o path se necessário
import { Task } from '@prisma/client';
import { TaskRepository } from './task.repository';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    description?: string | null;
    isCompleted?: boolean;
  }): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        isCompleted: data.isCompleted ?? false,
      },
    });
  }

  async update(id: number, data: Partial<Task>): Promise<Task> {
    const payload: Partial<Task> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.isCompleted !== undefined) payload.isCompleted = data.isCompleted;

    return this.prisma.task.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
