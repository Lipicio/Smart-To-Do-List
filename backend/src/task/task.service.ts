import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(private readonly repo: TaskRepository) {}

  async findAll(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.repo.findOne(id);
    if (!task) throw new NotFoundException(`Tarefa ${id} não encontrada`);
    return task;
  }

  async create(title: string): Promise<Task> {
    if (!title || title.trim().length < 1) {
      throw new Error('Título é obrigatório');
    }
    return this.repo.create({ title: title.trim()});
  }

  async update(id: number, data: Partial<Task>): Promise<Task> {
    await this.findOne(id); 
    return this.repo.update(id, data);
  }

  async remove(id: number): Promise<Task> {
    await this.findOne(id);
    return this.repo.remove(id);
  }
}