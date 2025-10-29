import React from 'react';
import TasksClientWrapper from '@/components/Tasks/TasksClientWrapper';

export const metadata = {
  title: 'Tasks — Smart To-Do',
  description: 'Lista de tarefas',
};

export default function TasksPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">Minhas Tarefas</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas tarefas e marque as concluídas</p>
      </header>

      <section>
        <TasksClientWrapper />
      </section>
    </main>
  );
}
