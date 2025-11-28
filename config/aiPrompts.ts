
import { ToolType } from "../types";

export interface AIPromptConfig {
  modelName: string;
  systemInstruction: string;
  generatePrompt: (inputs: Record<string, string>) => string;
}

export const getPromptConfig = (tool: ToolType, inputs: Record<string, string>): AIPromptConfig => {
  // Default fallback
  let config: AIPromptConfig = {
    modelName: 'gemini-2.5-flash',
    systemInstruction: 'You are a helpful AI assistant.',
    generatePrompt: () => inputs.content || "Hello"
  };

  switch (tool) {
    case ToolType.TRANSLATE:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a professional UN-level interpreter and translator. 
        Your task is to provide a translation that is not just literally correct, but culturally nuanced and native-sounding.
        Rules:
        1. Preserve the original tone (formal, casual, technical).
        2. Do NOT add preamble like "Here is the translation". Just output the target text.
        3. If the input is empty, return empty string.`,
        generatePrompt: () => `Source Text:\n"${inputs.content}"\n\nTarget Language: ${inputs.targetLang || 'English'}`
      };
      break;

    case ToolType.CV_BUILDER:
      config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are an expert Executive Career Coach and Resume Writer with 20 years of experience.
        Your goal is to write high-impact, result-oriented bullet points using the "Action Verb + Task + Result" formula.
        Rules:
        1. Start every bullet with a strong power verb (e.g., Spearheaded, Orchestrated, Optimized).
        2. Quantify results with numbers/percentages whenever possible.
        3. Output strictly as an HTML Unordered List (<ul><li>...</li></ul>). No other text.`,
        generatePrompt: () => `Write 4-6 professional resume bullet points for the following role/description: "${inputs.content}".`
      };
      break;

    case ToolType.SOCIAL_TWITTER:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a viral Social Media Manager for Twitter/X.
        Your goal is to maximize engagement (likes, retweets).
        Rules:
        1. Be concise, punchy, and provocative.
        2. Use appropriate emojis but don't overdo it.
        3. Include 2-3 relevant hashtags at the end.
        4. If "Thread" is implied, separate tweets with "---".`,
        generatePrompt: () => `Write a ${inputs.tone} Twitter post/thread about: ${inputs.topic}.`
      };
      break;
    
    // ... Implement other cases similarly (Social LinkedIn, Blog, Email, etc.)
    // For brevity in this refactor, we map a few key ones, others use default logic in gemini.ts or can be moved here.
    
    case ToolType.SOCIAL_LINKEDIN:
      config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are a LinkedIn Top Voice and Thought Leader.
        Goal: Build professional authority and network engagement.
        Structure: Hook, Meat, Takeaway, Ask.
        Format: Short paragraphs, bold key phrases.`,
        generatePrompt: () => `Topic: ${inputs.topic}\nTarget Audience: ${inputs.audience}\nTone: ${inputs.tone}`
      };
      break;

    case ToolType.BLOG_FULL:
       config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are an SEO Expert and Senior Copywriter.
        Write a full-length, high-ranking blog post.
        Structure: H1, Intro, H2/H3 body, bullets, Conclusion. Optimize for readability.`,
        generatePrompt: () => `Topic: "${inputs.topic}"\nAudience: ${inputs.audience}\nTone: ${inputs.tone}\nTarget Length: ${inputs.length}`
       };
       break;

    // Add other specific tools here...
  }

  return config;
};
