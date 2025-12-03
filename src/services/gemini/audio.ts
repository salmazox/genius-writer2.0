import { Modality } from "@google/genai";
import { ai, checkOnline } from "./utils";
import { checkUsageAllowance } from "./usageTracking";

/**
 * Audio/TTS Functions
 * Handles text-to-speech generation
 */

export const generateSpeech = async (
    text: string,
    signal?: AbortSignal
): Promise<ArrayBuffer> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    checkUsageAllowance('word');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text.substring(0, 4000) }] }], // Limit length for TTS
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");

        // Decode Base64 to ArrayBuffer
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("TTS Generation Error", e);
        throw new Error("Failed to generate speech.");
    }
};
