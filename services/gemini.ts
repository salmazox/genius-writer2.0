import { GoogleGenAI } from "@google/genai";
import { ToolType, CVData, ATSAnalysis } from "../types";
import { getPromptConfig } from "../config/aiPrompts";

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
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * LRU Cache Implementation to prevent unbounded memory growth
 */
class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    // Refresh item
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest (first item in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

// Limit cache to 50 items
const requestCache = new LRUCache<string, string>(50);

/**
 * Client-Side Rate Limiter
 * Token Bucket implementation to prevent abuse in the demo environment.
 */
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private lastRefill: number;

  constructor(maxTokens: number, refillRatePerSecond: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRatePerSecond / 1000;
    this.lastRefill = Date.now();
  }

  tryAcquire(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }
}

// Allow 5 requests per 10 seconds, refilling slowly
const apiLimiter = new RateLimiter(5, 0.5);

/**
 * Usage Tracking (Simulated Backend)
 */
const USAGE_KEY = 'gw_usage_tracker';

export interface UsageData {
  wordsUsed: number;
  imagesUsed: number;
  lastReset: number;
}

const getUsageData = (): UsageData => {
  try {
    const data = localStorage.getItem(USAGE_KEY);
    if (!data) return { wordsUsed: 0, imagesUsed: 0, lastReset: Date.now() };
    
    const parsed = JSON.parse(data);
    // Reset monthly (mock logic: if last reset was > 30 days ago)
    if (Date.now() - parsed.lastReset > 30 * 24 * 60 * 60 * 1000) {
        return { wordsUsed: 0, imagesUsed: 0, lastReset: Date.now() };
    }
    // Backward compatibility for old format without imagesUsed
    if (parsed.imagesUsed === undefined) {
        parsed.imagesUsed = 0;
    }
    return parsed;
  } catch {
    return { wordsUsed: 0, imagesUsed: 0, lastReset: Date.now() };
  }
};

export const LIMITS: Record<string, { words: number, images: number }> = {
  free: { words: 2000, images: 0 },
  pro: { words: 50000, images: 50 },
  agency: { words: 200000, images: 200 },
  enterprise: { words: Infinity, images: Infinity }
};

const checkUsageAllowance = (type: 'word' | 'image' = 'word') => {
  let plan = 'free';
  try {
    const userStr = localStorage.getItem('ai_writer_user');
    if (userStr) {
        plan = JSON.parse(userStr).plan || 'free';
    }
  } catch (e) {
    console.warn("Could not read user plan", e);
  }

  const usage = getUsageData();
  const limit = LIMITS[plan] || LIMITS.free;
  
  if (type === 'word' && usage.wordsUsed >= limit.words) {
    throw new Error(`Word limit reached (${limit.words.toLocaleString()} words). Please upgrade to continue.`);
  }

  if (type === 'image' && usage.imagesUsed >= limit.images) {
    throw new Error(`Image limit reached (${limit.images} images). Please upgrade to continue.`);
  }
};

const trackUsage = (text: string, isImage: boolean = false) => {
  const usage = getUsageData();
  let newWords = usage.wordsUsed;
  let newImages = usage.imagesUsed;

  if (isImage) {
      newImages += 1;
  } else if (text) {
      const wordCount = text.trim().split(/\s+/).length;
      newWords += wordCount;
  }

  localStorage.setItem(USAGE_KEY, JSON.stringify({
    ...usage,
    wordsUsed: newWords,
    imagesUsed: newImages
  }));
  
  // Dispatch event for UI updates
  window.dispatchEvent(new Event('usage_updated'));
};

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(
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

const checkOnline = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error("No internet connection. Please check your network.");
    }
};

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
        model: 'gemini-2.5-flash',
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
      model: 'gemini-3-pro-preview', // Keep Pro for reasoning
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

export const generateCoverLetter = async (
  cvData: CVData, 
  jobDescription: string,
  signal?: AbortSignal
): Promise<string> => {
  checkOnline();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  if (!apiLimiter.tryAcquire()) throw new Error("Rate limit exceeded.");

  checkUsageAllowance('word');

  const cvSummary = `
    Name: ${cvData.personal.fullName}
    Title: ${cvData.personal.jobTitle}
    Experience: ${cvData.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
    Skills: ${cvData.skills.join(', ')}
  `;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Switched to Flash for cost efficiency
        contents: `
          Write a compelling cover letter for the following applicant matching the job description.
          
          APPLICANT:
          ${cvSummary}
          
          JOB DESCRIPTION:
          ${jobDescription}
          
          Format: HTML (using <p>, <br>, <strong>).
          Tone: Professional, enthusiastic, and confident.
        `
      });
    }, 3, 1000, signal);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const text = response.text || "";
    trackUsage(text);
    return text;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    console.error("Cover Letter Gen Error", e);
    throw new Error("Failed to generate cover letter");
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
                model: 'gemini-2.5-flash', // Switched to Flash for cost efficiency
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

export const analyzeATS = async (
    cvData: CVData, 
    jobDescription: string,
    signal?: AbortSignal
): Promise<ATSAnalysis> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    checkUsageAllowance('word');

    const cvText = `
    Name: ${cvData.personal.fullName}
    Title: ${cvData.personal.jobTitle}
    Summary: ${cvData.personal.summary}
    Skills: ${cvData.skills.join(', ')}
    Experience: ${cvData.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join('\n')}
    Education: ${cvData.education.map(e => `${e.degree} at ${e.school}`).join('\n')}
    Certifications: ${cvData.certifications.map(c => c.name).join(', ')}
    languages: ${cvData.languages.map(l => l.language).join(', ')}
    `;

    try {
        const response = await withRetry(async () => {
           return await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Keep Pro for deep reasoning
            contents: `
            You are an expert ATS (Applicant Tracking System) algorithm analyzer. 
            Analyze the following CV against the provided Job Description.
            
            CV DATA:
            ${cvText}

            JOB DESCRIPTION:
            ${jobDescription}

            Task:
            1. Calculate a match score (0-100).
            2. Identify strictly missing technical keywords.
            3. Provide specific suggestions.
            4. Write a brief summary.
            5. Rewrite the "Summary" section to align with the JD.

            Return the response in this exact JSON format:
            {
                "score": number,
                "missingKeywords": ["keyword1", "keyword2"],
                "suggestions": ["tip1", "tip2"],
                "summary": "analysis summary",
                "improvedSummary": "The rewritten profile summary..."
            }
            `
          });
        }, 3, 1000, signal);

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const text = response.text || "{}";
        trackUsage(text);
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr) as ATSAnalysis;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("ATS Analysis Error", e);
        return {
            score: 0,
            missingKeywords: [],
            suggestions: ["Error analyzing data. Please try again."],
            summary: "Failed to analyze.",
            improvedSummary: ""
        };
    }
};

export const parseResume = async (
    base64Image: string, 
    signal?: AbortSignal
): Promise<Partial<CVData>> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    checkUsageAllowance('word');

    // Clean base64 string
    const cleanedBase64 = base64Image.split(',')[1] || base64Image;

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: cleanedBase64 } },
                        { text: `
                            Extract resume data from this image into JSON format matching this structure:
                            {
                                "personal": { "fullName": "", "email": "", "phone": "", "address": "", "website": "", "linkedin": "", "jobTitle": "", "summary": "" },
                                "experience": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "", "current": false }],
                                "education": [{ "degree": "", "school": "", "location": "", "year": "" }],
                                "skills": ["skill1", "skill2"]
                            }
                            Return ONLY raw JSON.
                        ` }
                    ]
                }
            });
        }, 3, 1000, signal);

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        
        const text = response.text || "{}";
        trackUsage(text);
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("Resume Parsing Error", e);
        throw new Error("Failed to parse resume");
    }
};

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