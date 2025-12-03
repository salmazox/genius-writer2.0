import { ToolType } from "../../types";
import { getPromptConfig } from "../../config/aiPrompts";
import { ai, withRetry, checkOnline } from "./utils";
import { requestCache } from "./cache";
import { apiLimiter } from "./rateLimiter";
import { checkUsageAllowance, trackUsage } from "./usageTracking";

/**
 * Content Generation Functions
 * Handles text generation, streaming, refinement, and chat
 */

export const generateContent = async (
  tool: ToolType,
  inputs: Record<string, string>,
  brandVoiceInstruction?: string,
  signal?: AbortSignal
): Promise<string> => {
  checkOnline();

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  if (!apiLimiter.tryAcquire()) {
      throw new Error("Rate limit exceeded. Please wait a moment before generating again.");
  }

  // Handle Image Gen separately
  if (tool === ToolType.IMAGE_GEN) {
      // Check Plan Limits for Images
      checkUsageAllowance('image');

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: inputs.prompt }] },
          config: {
            imageConfig: { aspectRatio: (inputs.aspectRatio as any) || "1:1" }
          }
        });

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                trackUsage("image", true);
                return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
            }
        }
        return "Failed to generate image. Please try again.";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("Image Gen Error", e);
        return "Error generating image.";
      }
  }

  // Check Plan Limits for Words
  checkUsageAllowance('word');

  // Create a cache key based on inputs
  const cacheKey = `${tool}-${JSON.stringify(inputs)}-${brandVoiceInstruction || ''}`;
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }

  // Get configuration
  const promptConfig = getPromptConfig(tool, inputs);
  let systemInstruction = promptConfig.systemInstruction;

  if (brandVoiceInstruction) {
    systemInstruction += `\n\nCRITICAL BRAND VOICE INSTRUCTION: ${brandVoiceInstruction}. \nEnsure the output strictly adheres to this voice/persona.`;
  }

  try {
    // Wrap API call with retry logic
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: promptConfig.modelName,
        contents: promptConfig.generatePrompt(inputs),
        config: { systemInstruction: systemInstruction },
      });
    }, 3, 1000, signal);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const text = response.text || "No response generated.";

    // Cache the successful result
    requestCache.set(cacheKey, text);

    // Track usage
    trackUsage(text);

    return text;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Streaming Generator
 * Provides immediate feedback to the user by streaming chunks.
 */
export const generateContentStream = async (
  tool: ToolType,
  inputs: Record<string, string>,
  onChunk: (text: string) => void,
  brandVoiceInstruction?: string,
  signal?: AbortSignal
): Promise<string> => {
  checkOnline();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  if (!apiLimiter.tryAcquire()) throw new Error("Rate limit exceeded.");
  checkUsageAllowance('word');

  const promptConfig = getPromptConfig(tool, inputs);
  let systemInstruction = promptConfig.systemInstruction;

  if (brandVoiceInstruction) {
    systemInstruction += `\n\nCRITICAL BRAND VOICE INSTRUCTION: ${brandVoiceInstruction}. \nEnsure the output strictly adheres to this voice/persona.`;
  }

  let fullText = '';

  try {
    const result = await ai.models.generateContentStream({
      model: promptConfig.modelName,
      contents: promptConfig.generatePrompt(inputs),
      config: { systemInstruction: systemInstruction },
    });

    for await (const chunk of result) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const chunkText = chunk.text || '';
      fullText += chunkText;
      onChunk(fullText);
    }

    trackUsage(fullText);
    return fullText;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Gemini Streaming Error:", error);
    throw error;
  }
};

export const refineContent = async (
  currentContent: string,
  instruction: string,
  brandVoiceInstruction?: string,
  signal?: AbortSignal
): Promise<string> => {
  if (!currentContent) return "";
  checkOnline();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  if (!apiLimiter.tryAcquire()) {
    throw new Error("Rate limit exceeded. Please wait.");
  }

  checkUsageAllowance('word');

  let sysInstruct = "You are a professional editor. Improve the text based on the user's specific instruction.";
  if (brandVoiceInstruction) {
    sysInstruct += `\n\nApply the following Brand Voice/Style: ${brandVoiceInstruction}`;
  }

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Cost Optimization: Use 2.0 Flash for simple polishing
        contents: `Original Text:\n"${currentContent}"\n\nInstruction: ${instruction}\n\nRewrite the text to follow the instruction. Return ONLY the rewritten text, no conversational filler. Keep existing HTML or Markdown formatting unless asked to change it.`,
        config: { systemInstruction: sysInstruct },
      });
    }, 3, 1000, signal);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const text = response.text || currentContent;
    trackUsage(text);
    return text;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Gemini Refine Error:", error);
    throw error;
  }
};

export const chatWithAI = async (
  history: { role: 'user' | 'model', text: string }[],
  newMessage: string,
  context?: string,
  signal?: AbortSignal
): Promise<string> => {
  checkOnline();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  if (!apiLimiter.tryAcquire()) {
    throw new Error("Rate limit exceeded.");
  }

  checkUsageAllowance('word');

  try {
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-exp', // Cost Optimization: Smart Editor uses 2.0 Flash
      history: chatHistory,
      config: {
        systemInstruction: `You are a helpful writing assistant inside a document editor.
        Context of the user's document:\n${context?.substring(0, 5000) || "No content yet."}

        Your goal is to help them brainstorm, outline, or rewrite parts of this document. Be concise and helpful.`
      }
    });

    const response = await withRetry(async () => {
      return await chat.sendMessage({ message: newMessage });
    }, 3, 1000, signal);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const text = response.text || "";
    trackUsage(text);
    return text;

  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Chat Error:", error);
    throw error;
  }
};

export const createLiveSession = (config: any) => {
    return ai.live.connect({
        model: 'gemini-2.0-flash-exp', // Cost Optimization: Use 2.0 Flash for Live
        ...config
    });
};
