'use client';
import { useEffect, useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreateManual: (title: string) => Promise<void>;
  /**
   * Callback opcional que será chamado com a lista de tasks retornadas
   * pelo backend após a geração via IA. Use-o para atualizar a lista em tela.
   */
  onTasksCreated?: (tasks: any[]) => void;
};

type ServerError = {
  statusCode?: number;
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

export default function TaskCreationModal({
  isOpen,
  onClose,
  onCreateManual,
  onTasksCreated,
}: Props) {
  const [activeTab, setActiveTab] = useState<'manual' | 'ia'>('ia');

  // manual
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ia
  const [aiScript, setAiScript] = useState('');
  const [aiKey, setAiKey] = useState('');
  const aiScriptRef = useRef<HTMLTextAreaElement | null>(null);

  // shared state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ServerError | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'manual') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (isOpen && activeTab === 'ia') {
      setTimeout(() => aiScriptRef.current?.focus(), 50);
    }
    if (!isOpen) {
      // reset state when modal closes
      setTitle('');
      setAiScript('');
      setAiKey('');
      setSaving(false);
      setActiveTab('ia');
      setError(null);
    }
  }, [isOpen, activeTab]);

  const validateTitle = (t: string) => {
    if (!t.trim()) return { ok: false, message: 'Título obrigatório' };
    if (t.trim().length > 150) return { ok: false, message: 'O título não pode ter mais que 150 caracteres' };
    return { ok: true };
  };

  const handleCreate = async () => {
    const trimmed = title.trim();
    const clientValidation = validateTitle(trimmed);

    if (!clientValidation.ok) {
      setError({ message: clientValidation.message });
      inputRef.current?.focus();
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onCreateManual(trimmed);

      setTitle('');
      onClose();
    } catch (err: any) {
      const parsed: ServerError =
        err && typeof err === 'object'
          ? {
              statusCode: err.statusCode ?? err.status,
              message: err.message ?? String(err),
              errors: Array.isArray(err.errors) ? err.errors : undefined,
            }
          : { message: String(err) };
      setError(parsed);
      inputRef.current?.focus();
    } finally {
      setSaving(false);
    }
  };

  // limpa erro ao digitar (melhora UX)
  const handleManualChange = (v: string) => {
    if (error) setError(null);
    setTitle(v);
  };

  // ----------------------
  // IA flow
  // ----------------------
  const validateAiInputs = () => {
    if (!aiKey.trim()) return { ok: false, message: 'A API Key é obrigatória' };
    if (!aiScript.trim()) return { ok: false, message: 'Descreva o objetivo/script' };
    if (aiScript.trim().length > 5000) return { ok: false, message: 'Script muito grande' };
    return { ok: true };
  };

  const handleGenerateWithAI = async () => {
    const v = validateAiInputs();
    if (!v.ok) {
      setError({ message: v.message });
      if (!aiKey.trim()) {
        // focus na key se for o caso
        (document.getElementById('ai-key-input') as HTMLInputElement | null)?.focus();
      } else {
        aiScriptRef.current?.focus();
      }
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // chama backend /llm/generate
      const resp = await fetch('/llm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: aiScript.trim(),
          openRouterToken: aiKey.trim(),
        }),
      });

      if (!resp.ok) {
        // tenta parsear erro do servidor
        let parsedErr: any = null;
        try {
          parsedErr = await resp.json();
        } catch {
          parsedErr = { message: await resp.text() };
        }
        const serverError: ServerError = {
          statusCode: resp.status,
          message: parsedErr?.message ?? parsedErr ?? `Erro ${resp.status}`,
          errors: parsedErr?.errors,
        };
        setError(serverError);
        return;
      }

      // sucesso: resposta deve ser array de tasks (com ids gerados)
      const data = await resp.json();
      if (!Array.isArray(data)) {
        setError({ message: 'Resposta inesperada do servidor' });
        return;
      }

      // chama callback do pai para atualizar a lista sem reload
      if (onTasksCreated) {
        try {
          onTasksCreated(data);
        } catch (e) {
          // não parar fluxo se callback falhar, apenas log
          // eslint-disable-next-line no-console
          console.warn('onTasksCreated callback failed', e);
        }
      }

      // limpa e fecha modal
      setAiScript('');
      setAiKey('');
      onClose();
    } catch (err: any) {
      const parsed: ServerError =
        err && typeof err === 'object'
          ? {
              statusCode: err.statusCode ?? err.status,
              message: err.message ?? String(err),
              errors: Array.isArray(err.errors) ? err.errors : undefined,
            }
          : { message: String(err) };
      setError(parsed);
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
        onClick={() => {
          if (!saving) onClose();
        }}
      />

      {/* modal */}
      <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 id="task-modal-title" className="text-lg font-semibold text-black">
            Nova Tarefa
          </h2>
          <button
            onClick={() => {
              if (!saving) onClose();
            }}
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
              className={`px-3 py-1 rounded ${activeTab === 'ia' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('ia')}
            >
              Inteligência Artificial
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('manual')}
            >
              Criar Manualmente
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
                onChange={(e) => handleManualChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                placeholder="Descreva a tarefa..."
                className="text-gray-700 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={saving}
              />

              {/* bloco de erro: logo abaixo do input, entre input e botões */}
              {error && (
                <div
                  role="alert"
                  className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded"
                >
                  <div className="font-medium">
                    Erro{error.statusCode ? ` (${error.statusCode})` : ''}
                  </div>

                  {error.message && <div className="mt-1">{error.message}</div>}

                  {error.errors && error.errors.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-red-600">
                      {error.errors.map((e, idx) => (
                        <li key={idx}>
                          {e.field ? `${e.field}: ` : ''}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setTitle('');
                    onClose();
                  }}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-red-700 bg-red-600"
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Criar tarefa'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Adicione sua API Key do OpenRouter e descreva o objetivo desejado — as tarefas serão geradas automaticamente por uma Inteligência Artificial. 
                <span className="mt-1 text-xs text-gray-500 italic">
                  Sua API Key será usada apenas nesta requisição e não será armazenada.
                </span>
              </p>             

              <label className="text-sm font-medium text-gray-700 block mb-2">API Key</label>
              <input
                id="ai-key-input"
                type="password"
                value={aiKey}
                onChange={(e) => {
                  if (error) setError(null);
                  setAiKey(e.target.value);
                }}
                placeholder="Cole aqui a API Key do OpenRouter (sk-...)"
                className="text-gray-700 w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={saving}
              />

              <label className="text-sm font-medium text-gray-700 block mb-2">Objetivo / Script</label>
              <textarea
                ref={aiScriptRef}
                rows={5}
                value={aiScript}
                onChange={(e) => {
                  if (error) setError(null);
                  setAiScript(e.target.value);
                }}
                placeholder="Ex.: 'Gere as tarefas necessárias para a entrega de uma sprint de 2 semanas'"
                className="text-gray-700 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={saving}
              />

              {/* bloco de erro para IA */}
              {error && (
                <div
                  role="alert"
                  className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded"
                >
                  <div className="font-medium">
                    Erro{error.statusCode ? ` (${error.statusCode})` : ''}
                  </div>

                  {error.message && <div className="mt-1">{error.message}</div>}

                  {error.errors && error.errors.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-red-600">
                      {error.errors.map((e, idx) => (
                        <li key={idx}>
                          {e.field ? `${e.field}: ` : ''}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setActiveTab('manual')}
                  className="px-3 py-2 rounded bg-gray-100 hover:bg-red-700 bg-red-600"
                  disabled={saving}
                >
                  Voltar
                </button>

                <button
                  onClick={handleGenerateWithAI}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Gerando tarefas...' : 'Gerar com IA'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
