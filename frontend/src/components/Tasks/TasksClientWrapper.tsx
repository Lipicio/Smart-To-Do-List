'use client';
import React, { useEffect, useState } from 'react';
import TaskList from './TaskList';
import { Task } from '@/types';
import TaskCreationModal from './TaskCreationModal';

export default function TasksClientWrapper() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ajuste aqui caso seu backend não use o prefixo /api
  const TASKS_BASE = '/api';
  const TASKS_URL = `${TASKS_BASE}/tasks`;
  const LLM_GENERATE_URL = `${TASKS_BASE}/llm/generate`;

  // Buscar tasks ao montar
  useEffect(() => {
    fetch(TASKS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then((data) => setTasks(data))
      .catch((err) => console.error('Erro ao buscar tarefas:', err))
      .finally(() => setLoading(false));
  }, []);

  // função exposta para criar manualmente (usada pelo modal)
  const createTask = async (title: string) => {
    const res = await fetch(TASKS_URL, {
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
    // optimistic UI
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted: next } : t)));
    try {
      const res = await fetch(`${TASKS_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: next }),
      });
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }
    } catch {
      // rollback simples em caso de erro
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted: !next } : t)));
    }
  };

  const remove = async (id: number) => {
    // optimistic remove
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`${TASKS_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }
    } catch {
      // rollback
      setTasks(previous);
    }
  };

  const editTitle = async (id: number, title: string) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
    try {
      const res = await fetch(`${TASKS_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        setTasks(previous);
        const contentType = res.headers.get('content-type') || '';
        const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
        throw payload ?? new Error(await res.text().catch(() => 'Erro'));
      }
      const updated = await res.json().catch(() => null);
      if (updated) setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setTasks(previous);
      // rethrow para o TaskCard exibir mensagem local
      throw err;
    }
  };

  // ------------------------
  // Handler para tasks criadas via IA
  // ------------------------
  const generateWithAI = async (script: string, apiKey: string) => {
    if (!script || !script.trim()) throw new Error('Script inválido');
    if (!apiKey || !apiKey.trim()) throw new Error('API Key inválida');

    const res = await fetch(LLM_GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: script.trim(), openRouterToken: apiKey.trim() }),
    });

    const raw = await res.text();
    let parsed: any;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = raw;
    }

    if (!res.ok) {
      const message =
        parsed && typeof parsed === 'object' ? parsed.message ?? JSON.stringify(parsed) : String(parsed ?? `Erro ${res.status}`);
      const err: any = new Error(message);
      err.statusCode = res.status;
      err.details = parsed?.errors;
      throw err;
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Resposta inesperada do servidor');
    }

    const incoming = parsed as Task[];
    const haveIds = incoming.every((t) => typeof t.id !== 'undefined' && t.id !== null);

    if (!haveIds) {
      setTasks((prev) => [...incoming, ...prev]);
      return parsed;
    }

    const existingIds = new Set(tasks.map((t) => t.id));
    const filtered = incoming.filter((t) => !existingIds.has(t.id));
    if (filtered.length > 0) {
      setTasks((prev) => [...filtered, ...prev]);
    }

    return parsed;
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
        onGenerateAI={generateWithAI}
      />
    </div>
  );
}
