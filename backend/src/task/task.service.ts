import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Task } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { TaskRepository } from './repository/task.repository';

@Injectable()
export class TaskService {
  
  constructor(
    @Inject('TaskRepository')
    private readonly repo: TaskRepository,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.repo.findOne(id);
    if (!task) throw new NotFoundException(`Tarefa ${id} não encontrada`);
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const title = dto.title?.trim();
    if (!title) throw new BadRequestException('Título é obrigatório');

    const data = {
      title,
      isCompleted: dto.isCompleted ?? false,
    };

    return this.repo.create(data);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id);

    const data: Partial<Task> = {};
    if (dto.title !== undefined) data.title = String(dto.title).trim();
    if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;

    return this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.remove(id);
  }
}
