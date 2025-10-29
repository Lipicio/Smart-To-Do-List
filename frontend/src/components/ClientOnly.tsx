'use client';
import { useEffect, useState, PropsWithChildren } from 'react';

export default function ClientOnly({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}