'use client';
import React from 'react';
import { Task } from '@/types';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, onToggle, onDelete }: {
  tasks: Task[];
  onToggle?: (id: number, next: boolean) => void;
  onDelete?: (id: number) => void;
}) {
  if (!tasks?.length) {
    return <div className="text-gray-500">Nenhuma tarefa.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tasks.map(t => (
        <TaskCard key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}
