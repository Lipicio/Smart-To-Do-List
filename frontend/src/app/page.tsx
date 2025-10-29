'use client';
import ClientOnly from '@/components/ClientOnly';
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [msg, setMsg] = useState<string>('Carregando...');

  useEffect(() => {
    fetch('/api/health')
      .then(async res => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Erro');
        }
        return res.text();
      })
      .then(text => setMsg(text))
      .catch(err => setMsg('Erro: ' + (err.message || err)));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Smart To-Do — Frontend Básico</h1>
        <ClientOnly>
          <pre className="rounded text-left">Backend Status: {msg}</pre>
        </ClientOnly>        
      </div>
    </main>
  );
}
