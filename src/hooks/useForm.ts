'use client';

import { useState, useCallback } from 'react';

/**
 * Generic form hook — eliminates duplicated form state + change handler patterns.
 */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleChange = useCallback(
    (key: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      setField(key, value as T[keyof T]);
    },
    [setField],
  );

  const reset = useCallback(() => setValues(initial), [initial]);

  return { values, setField, handleChange, reset, setValues };
}
