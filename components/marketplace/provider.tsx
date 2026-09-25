'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { useTheme } from 'next-themes';
import type { Account } from '@/types/account';
type Store = {
  account: Account | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  act: (resource: string, data: Record<string, unknown>, message?: string) => Promise<unknown>;
  favorite: (id: string) => void;
};
const Context = createContext<Store | null>(null);
export async function api<T = unknown>(
  resource: string,
  data: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`/api/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || 'Something went wrong');
  return result;
}
export function Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [account, setAccount] = useState<Account | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/account');
      if (!r.ok) {
        if (r.status === 401) {
          setAccount(null);
          return;
        }
        throw Error('Could not load your account.');
      }
      setAccount(await r.json());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to connect');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  async function act(resource: string, data: Record<string, unknown>, message = 'Saved') {
    try {
      const result = await api(resource, data);
      await refresh();
      if (message) toast.success(message);
      return result;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to save');
      throw e;
    }
  }
  function favorite(id: string) {
    void act('favorites', { id }, 'Wishlist updated').catch(() => {});
  }
  return (
    <Context.Provider value={{ account, loading, error, refresh, act, favorite }}>
      {children}
      <Toaster theme={resolvedTheme === 'dark' ? 'dark' : 'light'} position="bottom-right" richColors closeButton />
    </Context.Provider>
  );
}
export function useMarket() {
  const context = useContext(Context);
  if (!context) throw Error('Provider missing');
  return context;
}
