import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../task.service';
import type { Task } from '@prisma/client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import type { TaskRepository } from '../repository/task.repository';

describe('TaskService', () => {
  let service: TaskService;
  let repo: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    const repoMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: 'TaskRepository', useValue: repoMock },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repo = module.get('TaskRepository') as jest.Mocked<TaskRepository>;
  });

  it('should list tasks', async () => {
    const now = new Date();
    const fake: Task[] = [
      {
        id: 1,
        title: 'Título Teste',
        isCompleted: false,
        createdAt: now,
      },
    ];
    repo.findAll.mockResolvedValueOnce(fake);
    const res = await service.findAll();
    expect(res).toEqual(fake);
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('create should validate title', async () => {
    const dto: CreateTaskDto = { title: '' } as any;
    await expect(service.create(dto)).rejects.toThrow();
  });

  it('create should call repo.create', async () => {
    const now = new Date();
    const fake: Task = {
      id: 1,
      title: 'Título Teste - ok',
      isCompleted: false,
      createdAt: now,
    };
    const dto: CreateTaskDto = { title: 'Título Teste - ok' } as any;
    repo.create.mockResolvedValueOnce(fake);
    const res = await service.create(dto);
    expect(res).toBe(fake);
    expect(repo.create).toHaveBeenCalledWith({
      title: 'Título Teste - ok',
      isCompleted: false,
    });
  });

  it('findOne throws when not found', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow();
    expect(repo.findOne).toHaveBeenCalledWith(999);
  });

  it('remove should call repo.remove after existence check', async () => {
    const now = new Date();
    const fake: Task = {
      id: 1,
      title: 'Título Teste - ok',
      isCompleted: false,
      createdAt: now,
    };
    repo.findOne.mockResolvedValueOnce(fake);
    repo.remove.mockResolvedValueOnce(undefined);
    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repo.findOne).toHaveBeenCalledWith(1);
    expect(repo.remove).toHaveBeenCalledWith(1);
  });

  it('update should call repo.update and return updated task', async () => {
    const now = new Date();
    const existing: Task = {
      id: 1,
      title: 'old title',
      isCompleted: false,
      createdAt: now,
    };
    const updated: Task = {
      ...existing,
      title: 'new title',
    };
    repo.findOne.mockResolvedValueOnce(existing);
    repo.update.mockResolvedValueOnce(updated);

    const dto: UpdateTaskDto = { title: 'new title' } as any;
    const res = await service.update(1, dto);
    expect(repo.findOne).toHaveBeenCalledWith(1);
    expect(repo.update).toHaveBeenCalledWith(1, {
      title: 'new title',
      isCompleted: undefined,
    } as any);
    expect(res).toBe(updated);
  });
});
