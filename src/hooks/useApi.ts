'use client';

import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * Reusable API fetch hook with loading/error states.
 * Eliminates duplicate fetch+try/catch patterns across pages.
 */
export function useApi<T = unknown>(url: string | null) {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: false, error: '' });

  const fetchData = useCallback(async () => {
    if (!url) return;
    setState({ data: null, loading: true, error: '' });
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setState({ data: json.data, loading: false, error: '' });
      } else {
        setState({ data: null, loading: false, error: json.error || 'Gagal memuat data' });
      }
    } catch {
      setState({ data: null, loading: false, error: 'Gagal terhubung ke server' });
    }
  }, [url]);

  return { ...state, refetch: fetchData };
}

/**
 * Mutation hook for POST/PATCH/DELETE.
 */
export function useMutation<T = unknown>(method: 'POST' | 'PATCH' | 'DELETE' = 'POST') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (url: string, body?: unknown) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setError('');
        } else {
          setError(json.error || 'Gagal');
        }
        return json;
      } catch {
        setError('Gagal terhubung ke server');
        return { success: false, error: 'Network error' };
      } finally {
        setLoading(false);
      }
    },
    [method],
  );

  return { mutate, loading, error, data };
}
