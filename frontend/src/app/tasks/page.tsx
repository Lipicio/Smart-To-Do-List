import React from 'react';
import TasksClientWrapper from '@/components/TasksClientWrapper';
import { Task } from '@/types';

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('http://smart-backend:3001/tasks', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export default async function TasksPage() {
  const tasks = await fetchTasks();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Tasks</h1>
      <TasksClientWrapper tasks={tasks} />
    </main>
  );
}
