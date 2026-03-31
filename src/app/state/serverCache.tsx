import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";

interface CacheEntry<T> {
  value: T;
  updatedAt: number;
}

type CacheStore = Map<string, CacheEntry<unknown>>;

interface ServerCacheContextValue {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  invalidate(key: string): void;
  clear(): void;
}

const ServerCacheContext = createContext<ServerCacheContextValue | null>(null);

export function ServerCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<CacheStore>(new Map());

  const get = useCallback(<T,>(key: string): T | null => {
    const hit = cacheRef.current.get(key);
    return hit ? (hit.value as T) : null;
  }, []);

  const set = useCallback(<T,>(key: string, value: T) => {
    cacheRef.current.set(key, {
      value,
      updatedAt: Date.now(),
    });
  }, []);

  const invalidate = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const value = useMemo(
    () => ({
      get,
      set,
      invalidate,
      clear,
    }),
    [get, set, invalidate, clear],
  );

  return <ServerCacheContext.Provider value={value}>{children}</ServerCacheContext.Provider>;
}

export function useServerCache(): ServerCacheContextValue {
  const context = useContext(ServerCacheContext);
  if (!context) {
    throw new Error("useServerCache must be used within ServerCacheProvider");
  }
  return context;
}
