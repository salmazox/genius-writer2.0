
import { GoogleGenAI, Modality } from "@google/genai";
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
        model: 'gemini-2.5-flash', // Keep Flash 2.5 per instruction
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
            model: 'gemini-2.5-pro-preview', // Cost Optimization: Use 2.5 Pro for Reasoning
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
        // Better error message for user
        throw new Error("We couldn't analyze your CV. Please check that all required fields (Experience, Skills) are filled and try again.");
    }
};

export const parseResume = async (
    base64Image: string, 
    signal?: AbortSignal
): Promise<Partial<CVData>> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    checkUsageAllowance('word');

    // Dynamically detect MIME type and extract clean base64 data to avoid API errors
    // Default to 'image/png' if detection fails, but try to extract from string first
    let mimeType = 'image/png';
    let cleanedBase64 = base64Image;

    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
        mimeType = matches[1];
        cleanedBase64 = matches[2];
    } else {
        // Fallback: If no "data:" prefix, assume it is raw base64. 
        // If it has a comma but no "data:", try to split.
        const commaIndex = base64Image.indexOf(',');
        if (commaIndex !== -1) {
             cleanedBase64 = base64Image.substring(commaIndex + 1);
        }
    }

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: cleanedBase64 } },
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
        throw new Error("Failed to parse resume. Ensure image is clear.");
    }
};

/**
 * Parse LinkedIn profile screenshot with optimized prompting
 * Specifically designed for LinkedIn's profile layout
 */
export const parseLinkedInProfile = async (
    base64Image: string,
    signal?: AbortSignal
): Promise<Partial<CVData>> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    checkUsageAllowance('word');

    // Dynamically detect MIME type and extract clean base64 data
    let mimeType = 'image/png';
    let cleanedBase64 = base64Image;

    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
        mimeType = matches[1];
        cleanedBase64 = matches[2];
    } else {
        const commaIndex = base64Image.indexOf(',');
        if (commaIndex !== -1) {
            cleanedBase64 = base64Image.substring(commaIndex + 1);
        }
    }

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: cleanedBase64 } },
                        {
                            text: `You are viewing a screenshot of a LinkedIn profile. Extract ALL visible information thoroughly.

IMPORTANT: LinkedIn profiles have a specific layout:
- Top section: Name, headline, location, profile photo
- About section: Professional summary
- Experience section: Job titles, companies, dates, descriptions
- Education section: Degrees, schools, years
- Skills section: Listed skills (often many)
- Sometimes: Certifications, languages, volunteer work

Extract everything into this JSON structure:
{
  "personal": {
    "fullName": "Full name from profile",
    "email": "Email if visible (often not shown)",
    "phone": "Phone if visible (rarely shown)",
    "address": "City, State/Country from location",
    "website": "",
    "linkedin": "linkedin.com/in/username (construct if you see the profile)",
    "jobTitle": "Current headline/title from top of profile",
    "summary": "Content from About section - extract in full"
  },
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "City, State",
      "startDate": "MM/YYYY or Month YYYY",
      "endDate": "MM/YYYY or Present",
      "current": true if currently working here,
      "description": "Job description if visible - bullet points or paragraphs"
    }
  ],
  "education": [
    {
      "degree": "Degree name and field",
      "school": "University/School name",
      "location": "City, State",
      "year": "Graduation year or date range"
    }
  ],
  "skills": ["skill1", "skill2", "skill3", ...],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Issue date",
      "url": "",
      "description": ""
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Native/Fluent/Professional/Basic"
    }
  ]
}

Rules:
1. Extract EVERYTHING visible - be thorough
2. For dates: Use LinkedIn's format if visible (e.g., "Jan 2020" or "2020")
3. If a field is not visible, use empty string ""
4. For skills: Extract all visible skills, LinkedIn often shows many
5. For summary: Extract the entire "About" section verbatim
6. For experience descriptions: Extract full descriptions if visible
7. Construct LinkedIn URL as "linkedin.com/in/[visible-username]" if you can see it
8. Return ONLY valid JSON, no extra text or markdown

Begin extraction:`
                        }
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
        console.error("LinkedIn Profile Parsing Error", e);
        throw new Error("Failed to parse LinkedIn profile. Please ensure the screenshot clearly shows your profile information.");
    }
};

/**
 * Parse PDF resume document
 * Uses Gemini's native PDF parsing capability
 */
export const parsePDFResume = async (
    base64PDF: string,
    signal?: AbortSignal
): Promise<Partial<CVData>> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    checkUsageAllowance('word');

    // Extract clean base64 data
    let cleanedBase64 = base64PDF;
    const matches = base64PDF.match(/^data:.+;base64,(.+)$/);
    if (matches) {
        cleanedBase64 = matches[1];
    } else {
        const commaIndex = base64PDF.indexOf(',');
        if (commaIndex !== -1) {
            cleanedBase64 = base64PDF.substring(commaIndex + 1);
        }
    }

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'application/pdf', data: cleanedBase64 } },
                        {
                            text: `You are viewing a PDF resume/CV. Extract ALL information from the document.

Extract the complete content into this JSON structure:
{
  "personal": {
    "fullName": "Full name from resume",
    "email": "Email address",
    "phone": "Phone number",
    "address": "Full address or city/state",
    "website": "Personal website if present",
    "linkedin": "LinkedIn URL if present",
    "jobTitle": "Professional title/headline",
    "summary": "Professional summary or objective statement"
  },
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "City, State",
      "startDate": "Start date in any format present",
      "endDate": "End date or Present/Current",
      "current": true if currently employed,
      "description": "Full job description - preserve ALL bullet points and details"
    }
  ],
  "education": [
    {
      "degree": "Degree name and field of study",
      "school": "University/Institution name",
      "location": "City, State if available",
      "year": "Graduation year or date range"
    }
  ],
  "skills": ["skill1", "skill2", "skill3", ...],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Issue date",
      "url": "Certificate URL if present",
      "description": "Any additional details"
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Proficiency level if stated"
    }
  ]
}

IMPORTANT RULES:
1. Extract EVERYTHING from the PDF - be extremely thorough
2. Preserve all bullet points and descriptions in full
3. Extract contact information from header/footer if present
4. Look for certifications, publications, projects sections
5. Extract skills from dedicated skills section or embedded in descriptions
6. If a field is not present in the resume, use empty string ""
7. For dates: Preserve the format used in the resume
8. Return ONLY valid JSON, no extra text or markdown
9. Do not summarize or shorten any content - extract verbatim

Begin extraction:`
                        }
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
        console.error("PDF Resume Parsing Error", e);
        throw new Error("Failed to parse PDF resume. Please ensure the file is not password-protected and is readable.");
    }
};

/**
 * Generate a complete CV from a job description
 * Uses AI to create realistic, ATS-optimized CV content tailored to the job
 */
export const generateCVFromJobDescription = async (
    jobDescription: string,
    userGuidance?: { industry?: string; experience?: string; name?: string },
    signal?: AbortSignal
): Promise<Partial<CVData>> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    if (!apiLimiter.tryAcquire()) throw new Error("Rate limit exceeded.");

    checkUsageAllowance('word');

    try {
        const guidanceText = userGuidance
            ? `\n\nUser Guidance:
- Name: ${userGuidance.name || 'Alex Morgan'}
- Industry: ${userGuidance.industry || 'From job description'}
- Experience Level: ${userGuidance.experience || 'Mid-Senior (5-8 years)'}`
            : '';

        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `You are an expert CV/resume writer and career coach. Generate a complete, ATS-optimized CV tailored to the following job description.

JOB DESCRIPTION:
${jobDescription}${guidanceText}

IMPORTANT RULES:
1. Create realistic, quantifiable achievements (use percentages, dollar amounts, metrics)
2. Use strong action verbs (Led, Spearheaded, Architected, Optimized, etc.)
3. Tailor ALL content to match the job description's requirements
4. Include keywords from the job description naturally
5. Make the candidate seem qualified but not overqualified
6. Use HTML bullet points (<ul><li>) for descriptions
7. Include 2-3 relevant experience entries
8. Include 2 education entries (Bachelor's + relevant certification or Master's)
9. Include 12-15 skills that match the job requirements
10. Write a compelling 60-80 word professional summary
11. Generate realistic dates (current year backwards)
12. Include contact information

OUTPUT FORMAT (strict JSON):
{
  "personal": {
    "fullName": "string",
    "email": "string (professional)",
    "phone": "string (format: +1 555 0192)",
    "address": "string (City, State/Country)",
    "linkedin": "string (format: in/username)",
    "jobTitle": "string (matches the job or similar)",
    "summary": "string (60-80 words, compelling, tailored to job)"
  },
  "experience": [
    {
      "title": "string",
      "company": "string (realistic company name)",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "Present or YYYY-MM",
      "current": boolean,
      "description": "<ul><li>Achievement with quantifiable result (e.g., increased X by 40%)</li><li>Another achievement with metrics</li><li>Technical accomplishment relevant to job</li></ul>"
    }
  ],
  "education": [
    {
      "degree": "string (Bachelor's/Master's)",
      "field": "string (relevant to job)",
      "institution": "string (realistic university)",
      "location": "string",
      "graduationDate": "YYYY",
      "gpa": "3.7" (optional, only if impressive),
      "description": "string (honors, relevant coursework, activities)"
    }
  ],
  "skills": ["skill1", "skill2", ...] (12-15 skills matching job requirements),
  "certifications": [
    {
      "name": "string (relevant certification)",
      "issuer": "string (certifying body)",
      "date": "YYYY-MM",
      "expiryDate": "YYYY-MM" (optional),
      "credentialId": "string" (optional)
    }
  ] (include 1-2 relevant certs, or empty array if none apply),
  "languages": [
    {
      "name": "English",
      "proficiency": "Native"
    }
  ] (include if relevant to job)
}

Generate the CV now. Return ONLY the JSON, no markdown formatting.`
            });
        }, 3, 1000, signal);

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const text = response.text || "{}";
        trackUsage(text);

        // Clean up response and parse JSON
        let jsonStr = text.trim();
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

        const cvData = JSON.parse(jsonStr);

        // Ensure IDs are generated for array items
        if (cvData.experience) {
            cvData.experience = cvData.experience.map((exp: any) => ({
                ...exp,
                id: Date.now().toString() + Math.random()
            }));
        }
        if (cvData.education) {
            cvData.education = cvData.education.map((edu: any) => ({
                ...edu,
                id: Date.now().toString() + Math.random()
            }));
        }
        if (cvData.certifications) {
            cvData.certifications = cvData.certifications.map((cert: any) => ({
                ...cert,
                id: Date.now().toString() + Math.random()
            }));
        }
        if (cvData.languages) {
            cvData.languages = cvData.languages.map((lang: any) => ({
                ...lang,
                id: Date.now().toString() + Math.random()
            }));
        }

        return cvData;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("CV Generation Error", e);
        throw new Error("Failed to generate CV from job description. Please try again or provide more details.");
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

/**
 * Generate LinkedIn post suggestions for job seekers
 * Creates multiple post variations with different styles and tones
 */
export interface LinkedInPost {
    style: 'professional' | 'storytelling' | 'achievement' | 'casual';
    content: string;
    hashtags: string[];
}

export const generateLinkedInPosts = async (
    cvData: CVData,
    jobTarget?: string,
    signal?: AbortSignal
): Promise<LinkedInPost[]> => {
    checkOnline();
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    if (!apiLimiter.tryAcquire()) throw new Error("Rate limit exceeded.");

    checkUsageAllowance('word');

    const cvSummary = {
        name: cvData.personal.fullName,
        title: cvData.personal.jobTitle,
        summary: cvData.personal.summary,
        topSkills: cvData.skills.slice(0, 8).join(', '),
        recentExperience: cvData.experience[0] ? `${cvData.experience[0].title} at ${cvData.experience[0].company}` : 'Experienced professional',
        education: cvData.education[0] ? `${cvData.education[0].degree} from ${cvData.education[0].school}` : null
    };

    const targetRole = jobTarget || cvData.personal.jobTitle || 'new opportunities';

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a LinkedIn content expert helping a job seeker create engaging posts.

CANDIDATE INFO:
- Name: ${cvSummary.name}
- Current/Target Title: ${cvSummary.title}
- Target Role: ${targetRole}
- Top Skills: ${cvSummary.topSkills}
- Recent Experience: ${cvSummary.recentExperience}
- Summary: ${cvSummary.summary}

Create 4 LinkedIn post variations for this person who is looking for ${targetRole} opportunities. Each post should be:
- 150-250 words
- Include line breaks for readability
- Be authentic and engaging
- Subtly signal they are open to opportunities without being desperate
- End with a call-to-action

REQUIRED STYLES:
1. Professional - Formal, straightforward announcement
2. Storytelling - Personal narrative with journey/lessons learned
3. Achievement - Highlight recent accomplishments and skills
4. Casual - Conversational, relatable, warm tone

OUTPUT FORMAT (strict JSON, no markdown):
[
  {
    "style": "professional",
    "content": "The post content with \\n for line breaks",
    "hashtags": ["OpenToWork", "Hiring", "JobSearch", "RelevantSkill1", "RelevantSkill2"]
  },
  {
    "style": "storytelling",
    "content": "...",
    "hashtags": ["..."]
  },
  {
    "style": "achievement",
    "content": "...",
    "hashtags": ["..."]
  },
  {
    "style": "casual",
    "content": "...",
    "hashtags": ["..."]
  }
]

IMPORTANT:
- Each post must have 5-7 relevant hashtags
- Use \\n for line breaks in content
- No emojis unless in casual style (max 2-3)
- Make posts specific to their background
- Return ONLY the JSON array`
            });
        }, 3, 1000, signal);

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const text = response.text || "[]";
        trackUsage(text);

        // Clean up response and parse JSON
        let jsonStr = text.trim();
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

        const posts: LinkedInPost[] = JSON.parse(jsonStr);
        return posts;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("LinkedIn Post Generation Error", e);
        throw new Error("Failed to generate LinkedIn posts. Please try again.");
    }
};

export const createLiveSession = (config: any) => {
    return ai.live.connect({
        model: 'gemini-2.0-flash-exp', // Cost Optimization: Use 2.0 Flash for Live
        ...config
    });
};
