import { ai, withRetry, checkOnline } from "./utils";
import { checkUsageAllowance, trackUsage } from "./usageTracking";

/**
 * Analysis Functions
 * Handles fact-checking, brand voice extraction, and content analysis
 */

export const factCheck = async (
    content: string,
    signal?: AbortSignal
): Promise<string> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    if (!apiLimiter.tryAcquire()) throw new Error("Rate limit exceeded.");

    checkUsageAllowance('word');

    try {
        const response = await withRetry(async () => {
             return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `
                Fact check the following text. Identify any claims that seem dubious or incorrect, and provide corrections or notes.

                TEXT:
                "${content}"

                Return a bulleted list of potential issues. If none found, say "No major factual issues detected."
                `
            });
        }, 3, 1000, signal);

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        const text = response.text || "No response.";
        trackUsage(text);
        return text;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        throw e;
    }
};

export const extractBrandVoice = async (
    textSample: string,
    signal?: AbortSignal
): Promise<{ name: string; description: string }> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    checkUsageAllowance('word');

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `
                Analyze the following text sample. Identify the Tone, Style, and Personality.

                TEXT SAMPLE:
                "${textSample}"

                Task:
                1. Give it a catchy Name (max 3 words).
                2. Write a concise Description (max 1 sentence) that describes instructions for an AI to write in this style.

                Return response in JSON format:
                { "name": "...", "description": "..." }
                `
            });
        }, 3, 1000, signal);

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const text = response.text || "{}";
        trackUsage(text);
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("Brand Voice Extraction Error", e);
        return {
            name: "Analysis Failed",
            description: "Could not analyze the text sample."
        };
    }
};

// Import apiLimiter for factCheck function
import { apiLimiter } from "./rateLimiter";
