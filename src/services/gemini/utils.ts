import { GoogleGenAI } from "@google/genai";

/**
 * ⚠️ SECURITY WARNING ⚠️
 *
 * This application is currently configured for a client-side only demonstration.
 * The API key is exposed in the browser bundle via process.env.API_KEY.
 *
 * IN PRODUCTION:
 * 1. Do not expose your Gemini API key in client-side code.
 * 2. Implement a backend proxy (Node.js, Python, Go) to handle API calls.
 * 3. Store the API key securely in your backend server variables.
 * 4. Implement rate limiting and user authentication on your backend.
 */
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Retry helper with exponential backoff
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
