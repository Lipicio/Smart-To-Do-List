'use client';
import React, { useState } from 'react';
import { Task } from '@/types';
import TaskList from './TaskList';

export default function TasksClientWrapper({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial);

  const toggle = async (id: number, next: boolean) => {
    // otimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: next } : t));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isCompleted: next }) });
    } catch {
      // rollback on error (simple)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !next } : t));
    }
  };

  const remove = async (id: number) => {
    const confirmDelete = confirm('Remover tarefa?');
    if (!confirmDelete) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch {
      // on error we could refetch; for simplicity we do nothing
    }
  };

  return <TaskList tasks={tasks} onToggle={toggle} onDelete={remove} />;
}
