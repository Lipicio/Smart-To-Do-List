'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Task } from '@/types';

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onEditTitle,
  isHideCompleted,
}: {
  task: Task;
  onToggle?: (id: number, next: boolean) => void;
  onDelete?: (id: number) => void;
  onEditTitle?: (id: number, title: string) => Promise<void>;
  isHideCompleted: boolean
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setDraftTitle(task.title), [task.title]);

  useEffect(() => {
    if (isEditing) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setLocalError(null);
      setSaving(false);
    }
  }, [isEditing]);

  const startEdit = () => {
    setDraftTitle(task.title);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftTitle(task.title);
    setIsEditing(false);
    setLocalError(null);
  };

  const handleSave = async () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      setLocalError('Título obrigatório');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 150) {
      setLocalError('O título não pode ter mais que 150 caracteres');
      inputRef.current?.focus();
      return;
    }      

    if (!onEditTitle) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      setLocalError(null);
      await onEditTitle(task.id, trimmed);
      setIsEditing(false);
    } catch (err: any) {
      setLocalError(err?.message ?? 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article 
      className={`bg-white rounded-md shadow-sm p-4 border border-gray-100 flex flex-col justify-between h-full ${task.isCompleted && isHideCompleted ? 'hidden' : 'block'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                ref={inputRef}
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  if (localError) setLocalError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') cancelEdit();
                }}
                aria-label="Editar título da tarefa"
                className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={saving}
              />
              {localError && <div className="mt-2 text-sm text-red-600">{localError}</div>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-red-700 bg-red-600"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <h3
                className={`text-lg font-medium ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}
              >
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Criada: {new Date(task.createdAt).toLocaleString()}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => !isEditing && onToggle?.(task.id, !task.isCompleted)}
              className="w-4 h-4"
              disabled={isEditing}
            />
            <span className="text-xs text-gray-600">Done</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        {!isEditing && (
          <>
            <button
              onClick={startEdit}
              aria-label="Editar tarefa"
              className="text-blue-500 hover:text-blue-700 text-sm transition-colors pr-2"
            >
              Editar tarefa
            </button>

            <button
              onClick={() => onDelete?.(task.id)}
              aria-label="Deletar tarefa"
              className="text-red-500 hover:text-red-700 text-sm transition-colors"
            >
              Excluir tarefa
            </button>
          </>
        )}
      </div>
    </article>
  );
}
