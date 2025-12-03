/**
 * Abort Controller Hook
 *
 * Manages AbortController for cancellable async operations.
 * Automatically cleans up on unmount and provides utilities for aborting requests.
 *
 * @example
 * const { signal, abort, reset } = useAbortController();
 *
 * // Start async operation
 * const controller = reset();
 * await fetchData(controller.signal);
 *
 * // Abort current operation
 * abort();
 */

import { useRef, useEffect } from 'react';

interface UseAbortControllerReturn {
  /**
   * Get the signal from the current controller.
   * Returns undefined if no controller is active.
   */
  signal: AbortSignal | undefined;

  /**
   * Abort the current operation if one exists.
   */
  abort: () => void;

  /**
   * Reset by aborting any existing controller and creating a new one.
   * Returns the new controller for use with async operations.
   */
  reset: () => AbortController;

  /**
   * Check if the provided controller is still the active one.
   * Useful in finally blocks to avoid race conditions.
   */
  isCurrent: (controller: AbortController) => boolean;

  /**
   * Clear the current controller without aborting.
   * Used after successful completion or in finally blocks.
   */
  clear: () => void;
}

export function useAbortController(): UseAbortControllerReturn {
  const controllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const abort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  };

  const reset = (): AbortController => {
    // Abort existing controller if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // Create and store new controller
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  const isCurrent = (controller: AbortController): boolean => {
    return controllerRef.current === controller;
  };

  const clear = () => {
    controllerRef.current = null;
  };

  return {
    signal: controllerRef.current?.signal,
    abort,
    reset,
    isCurrent,
    clear
  };
}
