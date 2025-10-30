import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from '../llm.service';
import type { LlmRepository } from '../repository/llm.repository';
import type { Task } from '@prisma/client';
import { TaskService } from '../../task/task.service';

describe('LlmService', () => {
  let service: LlmService;
  let providerMock: jest.Mocked<LlmRepository>;
  let taskServiceMock: jest.Mocked<TaskService>;

  beforeEach(async () => {
    providerMock = {
      askForTasks: jest.fn(),
    } as any;

    taskServiceMock = {
      create: jest.fn(),     
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        { provide: 'LlmRepository', useValue: providerMock }, // provider do LLM
        { provide: TaskService, useValue: taskServiceMock },  // mock do TaskService
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar provider.askForTasks e criar tasks via TaskService', async () => {
    const providerResult = [{ title: 'Tarefa 1' }, { title: 'Tarefa 2' }];
    providerMock.askForTasks.mockResolvedValueOnce(providerResult);

    const now = new Date();
    const createdTasks: Task[] = [
      { id: 1, title: 'Tarefa 1', isCompleted: false, createdAt: now, },
      { id: 2, title: 'Tarefa 2', isCompleted: false, createdAt: now, },
    ];

    taskServiceMock.create
      .mockResolvedValueOnce(createdTasks[0])
      .mockResolvedValueOnce(createdTasks[1]);

    // act
    const res = await service.generateAndCreateTasks(
      'script qualquer',
      'token-abc',
    );

    // assert
    expect(providerMock.askForTasks).toHaveBeenCalledWith('script qualquer', 'token-abc');
    expect(taskServiceMock.create).toHaveBeenCalledTimes(2);
    expect(taskServiceMock.create).toHaveBeenCalledWith({ title: 'Tarefa 1' });
    expect(taskServiceMock.create).toHaveBeenCalledWith({ title: 'Tarefa 2' });
    expect(res).toEqual(createdTasks);
  });

  it('deve retornar array vazio quando provider retornar vazio', async () => {
    providerMock.askForTasks.mockResolvedValueOnce([]);
    const res = await service.generateAndCreateTasks('s', 't');
    expect(providerMock.askForTasks).toHaveBeenCalledWith('s', 't');
    expect(taskServiceMock.create).not.toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('deve propagar erro quando provider falhar', async () => {
    providerMock.askForTasks.mockRejectedValueOnce(new Error('Provider down'));
    await expect(service.generateAndCreateTasks('s', 't')).rejects.toThrow('Provider down');
    expect(providerMock.askForTasks).toHaveBeenCalledWith('s', 't');
    expect(taskServiceMock.create).not.toHaveBeenCalled();
  });
});
