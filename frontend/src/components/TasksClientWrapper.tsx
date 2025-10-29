'use client';
import React, { useEffect, useState } from 'react';
import TaskList from './TaskList';
import { Task } from '@/types';

export default function TasksClientWrapper() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id: number, next: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: next } : t));
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: next }),
    });
  };

  const remove = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE',
    });
  };

  if (loading) return <p>Carregando tarefas...</p>;

  return <TaskList tasks={tasks} onToggle={toggle} onDelete={remove} />;
}
