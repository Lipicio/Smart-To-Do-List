import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateTasksDto } from './dto/generate-tasks.dto';
import type { Task } from '@prisma/client';

@Controller('llm')
export class LlmController {
  constructor(private readonly service: LlmService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(@Body() dto: GenerateTasksDto): Promise<Task[]> {
    const { script, openRouterToken } = dto;
    return this.service.generateAndCreateTasks(script, openRouterToken);
  }
}
