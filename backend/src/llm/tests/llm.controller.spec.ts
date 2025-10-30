// src/llm/tests/llm.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from '../llm.controller';
import { LlmService } from '../llm.service';
import type { Task } from '@prisma/client';
import { GenerateTasksDto } from '../dto/generate-tasks.dto';

describe('LlmController', () => {
  let controller: LlmController;
  let serviceMock: jest.Mocked<LlmService>;

  beforeEach(async () => {
    serviceMock = {
      generateAndCreateTasks: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [{ provide: LlmService, useValue: serviceMock }],
    }).compile();

    controller = module.get<LlmController>(LlmController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /llm/generate should call llmService.generateAndCreateTasks and return created tasks', async () => {
    const now = new Date();
    const created: Task[] = [
      { id: 1, title: 'T1', isCompleted: false, createdAt: now, },
    ];

    serviceMock.generateAndCreateTasks.mockResolvedValueOnce(created);

    const dto: GenerateTasksDto = {
      script: 'Gere uma task',
      openRouterToken: 'token-1',
    };

    const res = await controller.generate(dto);

    expect(serviceMock.generateAndCreateTasks).toHaveBeenCalledWith(dto.script, dto.openRouterToken);
    expect(res).toEqual(created);
  });

  it('should propagate errors from service', async () => {
    serviceMock.generateAndCreateTasks.mockRejectedValueOnce(new Error('erro externo'));

    const dto: GenerateTasksDto = {
      script: 'Gere',
      openRouterToken: 't',
    };

    await expect(controller.generate(dto)).rejects.toThrow('erro externo');
    expect(serviceMock.generateAndCreateTasks).toHaveBeenCalledWith(dto.script, dto.openRouterToken);
  });
});
