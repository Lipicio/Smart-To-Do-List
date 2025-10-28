import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';

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
        { provide: TaskRepository, useValue: repoMock },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repo = module.get(TaskRepository) as jest.Mocked<TaskRepository>;
  });

  it('should list tasks', async () => {
    const fake = [{ id: 1, title: 'Título Teste', isCompleted: false, createdAt: new Date() }];
    repo.findAll.mockResolvedValueOnce(fake as any);
    const res = await service.findAll();
    expect(res).toEqual(fake);
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('create should validate title', async () => {
    await expect(service.create('')).rejects.toThrow();
  });

  it('create should call repo.create', async () => {
    const fake = { id: 1, title: 'Título Teste - ok', isCompleted: false, createdAt: new Date() } as any;
    repo.create.mockResolvedValueOnce(fake);
    const res = await service.create('Título Teste - ok');
    expect(res).toBe(fake);
    expect(repo.create).toHaveBeenCalledWith({ title: 'Título Teste - ok'});
  });

  it('findOne throws when not found', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow();
  });

  it('remove should call repo.remove after existence check', async () => {
    const fake = { id: 1, title: 'Título Teste - ok', isCompleted: false, createdAt: new Date() } as any;
    repo.findOne.mockResolvedValueOnce(fake);
    repo.remove.mockResolvedValueOnce(fake);
    const res = await service.remove(1);
    expect(repo.remove).toHaveBeenCalledWith(1);
    expect(res).toBe(fake);
  });
});
