/**
 * ⚠️ SECURITY WARNING ⚠️
 *
 * TEMPORARY: This file still uses client-side Gemini API calls.
 * This is INSECURE and should be migrated to backend proxy ASAP.
 *
 * MIGRATION IN PROGRESS:
 * - Some components have been migrated to use /src/services/aiService.ts
 * - Remaining components still use this insecure approach
 * - Once all components are migrated, this file will be removed
 *
 * DO NOT ADD NEW CODE USING THIS API - Use aiService instead!
 */

import { GoogleGenAI } from "@google/genai";

// TEMPORARY: Keep API functional for unmigrated components
// This exposes the API key in the browser - SECURITY RISK!
export const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Log warning when this module is imported
if (import.meta.env.PROD) {
  console.warn(
    '⚠️ SECURITY WARNING: Using insecure client-side Gemini API. ' +
    'This should be migrated to backend proxy. See /src/services/aiService.ts'
  );
}

/**
 * Retry helper with exponential backoff
 * This is still useful for backend API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  signal?: AbortSignal
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (signal?.aborted) throw error;

    // Retry on server errors (503) or rate limits (429)
    if (retries > 0 && (error.status === 503 || error.status === 429)) {
      console.warn(`API Error ${error.status}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2, signal);
    }
    throw error;
  }
}

export const checkOnline = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("No internet connection. Please check your network.");
    }
};


