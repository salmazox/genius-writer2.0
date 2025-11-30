/**
 * Hook to check if component is still mounted
 * Prevents memory leaks from state updates after unmount
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Returns a function that returns true if the component is still mounted
 *
 * @example
 * const isMounted = useIsMounted();
 *
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   if (isMounted()) {
 *     setData(data);
 *   }
 * };
 */
export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

/**
 * Hook for safely performing async operations that update state
 *
 * @example
 * const safeAsync = useSafeAsync();
 *
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   safeAsync(() => setData(data));
 * };
 */
export const useSafeAsync = () => {
  const isMounted = useIsMounted();

  return useCallback(
    <T>(callback: () => T): T | undefined => {
      if (isMounted()) {
        return callback();
      }
      return undefined;
    },
    [isMounted]
  );
};

/**
 * Hook that wraps an async function to make it safe from memory leaks
 *
 * @example
 * const safeFetch = useAsyncCallback(async (id: string) => {
 *   const data = await api.getData(id);
 *   setData(data); // This will only execute if component is still mounted
 * });
 */
export const useAsyncCallback = <T extends (...args: unknown[]) => Promise<unknown>>(
  asyncFunction: T
): T => {
  const isMounted = useIsMounted();

  return useCallback(
    (async (...args: Parameters<T>) => {
      const result = await asyncFunction(...args);
      return isMounted() ? result : undefined;
    }) as T,
    [asyncFunction, isMounted]
  );
};
