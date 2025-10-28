import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

describe('TaskController', () => {
  let controller: TaskController;
  const serviceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: serviceMock }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /tasks calls service.findAll', async () => {
    serviceMock.findAll.mockResolvedValue([]);
    const res = await controller.findAll();
    expect(res).toEqual([]);
    expect(serviceMock.findAll).toHaveBeenCalled();
  });

  it('POST /tasks calls service.create', async () => {
    serviceMock.create.mockResolvedValue({ id: 1 });
    const res = await controller.create({ title: 'Titulo Teste' } as any);
    expect(serviceMock.create).toHaveBeenCalledWith('Titulo Teste');
    expect(res).toEqual({ id: 1 });
  });

});