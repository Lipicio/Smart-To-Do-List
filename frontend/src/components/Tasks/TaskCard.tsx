'use client';
import React from 'react';
import { Task } from '@/types';

export default function TaskCard({ task, onToggle, onDelete }: {
  task: Task;
  onToggle?: (id: number, next: boolean) => void;
  onDelete?: (id: number) => void;
}) {
  return (
    <article className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-lg font-medium ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Criada: {new Date(task.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => onToggle?.(task.id, !task.isCompleted)}
              className="w-4 h-4"
            />
            <span className="text-xs text-gray-600">Done</span>
          </label>

          <button
            onClick={() => onDelete?.(task.id)}
            aria-label="Deletar tarefa"
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}
