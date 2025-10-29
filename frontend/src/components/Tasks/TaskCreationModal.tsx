'use client';
import { useEffect, useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreateManual: (title: string) => Promise<void>; // função passada pelo wrapper
};

export default function TaskCreationModal({ isOpen, onClose, onCreateManual }: Props) {
  const [activeTab, setActiveTab] = useState<'manual' | 'ia'>('manual');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focar input ao abrir quando na aba manual
  useEffect(() => {
    if (isOpen && activeTab === 'manual') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setTitle('');
      setSaving(false);
      setActiveTab('manual');
    }
  }, [isOpen, activeTab]);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    try {
      setSaving(true);
      await onCreateManual(trimmed);
      setTitle('');
      onClose();
    } catch (err) {      
      console.error(err);
      alert('Erro ao criar tarefa.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => { if (!saving) onClose(); }}
      />

      {/* modal */}
      <div className="relative bg-white w-full max-w-4xl mx-4 min-h-[30vh] rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 id="task-modal-title" className="text-lg font-semibold text-black">Nova Tarefa</h2>
          <button
            onClick={() => { if (!saving) onClose(); }}
            aria-label="Fechar modal"
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div className="px-4 py-3 border-b">
          <nav className="flex gap-2" aria-label="Tabs">
            <button
              className={`px-3 py-1 rounded ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('manual')}
            >
              Manual
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTab === 'ia' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('ia')}
            >
              Inteligência Artificial
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'manual' ? (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Título</label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                placeholder="Descreva a tarefa..."
                className="text-gray-700 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={saving}
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => { setTitle(''); onClose(); }}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-red-700 bg-red-600"
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Placeholder para integração IA futura */}
              <p className="text-sm text-gray-600 mb-3">
                Aqui você poderá gerar tarefas automaticamente a partir de um objetivo (ex.: "planejar viagem").
                Integração com IA será implementada em seguida.
              </p>

              <textarea
                rows={4}
                placeholder="Descreva seu objetivo de alto nível..."
                className="text-gray-700 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setActiveTab('manual')}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-red-700 bg-red-600"
                >
                  Voltar
                </button>
                <button
                  onClick={() => alert('Funcionalidade IA será implementada em breve')}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Em breve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
