import { Task } from '@prisma/client';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findOne(id: number): Promise<Task | null>;
  create(data: {
    title: string;
    description?: string | null;
    isCompleted?: boolean;
  }): Promise<Task>;
  update(id: number, data: Partial<Task>): Promise<Task>;
  remove(id: number): Promise<void>;
}
