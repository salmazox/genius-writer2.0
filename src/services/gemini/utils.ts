/**
 * ⚠️ SECURITY NOTICE ⚠️
 *
 * CLIENT-SIDE GEMINI API CALLS ARE DISABLED FOR SECURITY
 *
 * This file previously contained client-side Gemini API calls with an exposed API key.
 * For production security, all AI generation must go through the backend API proxy.
 *
 * MIGRATION REQUIRED:
 * 1. Components should use `/src/services/aiService.ts` instead
 * 2. Backend proxy is available at `/backend/routes/ai.js`
 * 3. Set GEMINI_API_KEY in backend environment variables only
 *
 * Example migration:
 *
 * // OLD (insecure):
 * import { generateContent } from './services/gemini';
 * const result = await generateContent(tool, inputs);
 *
 * // NEW (secure):
 * import { aiService } from './services/aiService';
 * const result = await aiService.generate({ prompt: '...', model: 'gemini-2.5-flash' });
 *
 * For existing code that hasn't been migrated yet, this placeholder prevents
 * compilation errors but will throw runtime errors if called.
 */

// Placeholder to prevent compilation errors
export const ai = {
  models: {
    generateContent: () => {
      throw new Error(
        'Client-side Gemini API is disabled for security. Use aiService (backend proxy) instead. ' +
        'See /src/services/aiService.ts for migration guide.'
      );
    }
  }
};

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

