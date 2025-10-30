import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task.controller';
import { TaskService } from '../task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import type { Task } from '@prisma/client';

describe('TaskController', () => {
  let controller: TaskController;
  let service: jest.Mocked<TaskService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<TaskService> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: serviceMock }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /tasks calls service.findAll', async () => {
    const fakeTasks: Task[] = [
      {
        id: 1,
        title: 'Teste 1',
        isCompleted: false,
        createdAt: new Date(),
      },
    ];

    service.findAll.mockResolvedValueOnce(fakeTasks);

    const res = await controller.findAll();

    expect(res).toEqual(fakeTasks);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /tasks/:id calls service.findOne', async () => {
    const fakeTask: Task = {
      id: 1,
      title: 'Task Única',
      isCompleted: false,
      createdAt: new Date(),
    };

    service.findOne.mockResolvedValueOnce(fakeTask);

    const res = await controller.findOne(1);

    expect(res).toEqual(fakeTask);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('POST /tasks calls service.create com DTO', async () => {
    const dto: CreateTaskDto = { title: 'Título Teste' } as any;
    const fakeTask: Task = {
      id: 1,
      title: dto.title,
      isCompleted: false,
      createdAt: new Date(),
    };

    service.create.mockResolvedValueOnce(fakeTask);

    const res = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual(fakeTask);
  });

  it('PATCH /tasks/:id calls service.update', async () => {
    const dto: UpdateTaskDto = { title: 'Atualizado' } as any;
    const updatedTask: Task = {
      id: 1,
      title: 'Atualizado',
      isCompleted: false,
      createdAt: new Date(),
    };

    service.update.mockResolvedValueOnce(updatedTask);

    const res = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(res).toEqual(updatedTask);
  });

  it('DELETE /tasks/:id calls service.remove', async () => {
    service.remove.mockResolvedValueOnce(undefined);

    await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
