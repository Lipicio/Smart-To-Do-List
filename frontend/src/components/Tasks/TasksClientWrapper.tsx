'use client';
import React, { useEffect, useState } from 'react';
import TaskList from './TaskList';
import { Task } from '@/types';
import TaskCreationModal from './TaskCreationModal';

export default function TasksClientWrapper() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar tasks ao montar
  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Erro ao buscar tarefas:', err))
      .finally(() => setLoading(false));
  }, []);

  // função exposta para criar manualmente (usada pelo modal)
  const createTask = async (title: string) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Erro');
      throw new Error(text || 'Erro ao criar');
    }

    const created: Task = await res.json();
    setTasks((prev) => [created, ...prev]);
  };

  const toggle = async (id: number, next: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted: next } : t)));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: next }),
      });
    } catch {
      // rollback simples em caso de erro
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted: !next } : t)));
    }
  };

  const remove = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch {
      // em erro, refetch poderia ser feito. Simplicidade: nada por enquanto
    }
  };

  const editTitle = async (id: number, title: string) => {
    const previous = tasks;
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, title } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        setTasks(previous);
        const contentType = res.headers.get('content-type') || '';
        const payload = contentType.includes('application/json') ? await res.json().catch(()=>null) : null;
        throw payload ?? new Error(await res.text().catch(()=> 'Erro'));
      }
      const updated = await res.json().catch(()=>null);
      if (updated) setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      setTasks(previous);
      // rethrow para o TaskCard exibir mensagem local
      throw err;
    }
  };

  if (loading) return <p>Carregando tarefas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Nova Tarefa
          </button>
        </div>
      </div>

      <TaskList tasks={tasks} onToggle={toggle} onDelete={remove} onEditTitle={editTitle} />

      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateManual={async (title) => {
          await createTask(title);
        }}
      />
    </div>
  );
}
