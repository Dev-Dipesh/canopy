import { useState, useCallback } from "react";

const PREFIX = "canopy-web:";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const prefixedKey = PREFIX + key;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(prefixedKey);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(prefixedKey, JSON.stringify(next));
        } catch {
          // Storage full or unavailable — ignore
        }
        return next;
      });
    },
    [prefixedKey]
  );

  return [storedValue, setValue];
}
