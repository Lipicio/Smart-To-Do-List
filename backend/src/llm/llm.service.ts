import { Injectable, Inject, forwardRef } from '@nestjs/common';
import type { LlmRepository } from './repository/llm.repository';
import { CreateTaskDto } from '../task/dto/create-task.dto';
import type { Task } from '@prisma/client';
import { TaskService } from '../task/task.service';

@Injectable()
export class LlmService {
  constructor(
    @Inject('LlmRepository') private readonly provider: LlmRepository,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  async generateAndCreateTasks(script: string, token: string): Promise<Task[]> {
    const tasksFromProvider = await this.provider.askForTasks(script, token);
    const created: Task[] = [];

    for (const t of tasksFromProvider) {
      const dto: CreateTaskDto = { title: t.title } as CreateTaskDto;
      const task = await this.taskService.create(dto);
      created.push(task);
    }

    return created;
  }
}
