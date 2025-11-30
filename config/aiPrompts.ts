
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
    generatePrompt: () => inputs.content || "Hello, how can I help you today?"
  };

  switch (tool) {
    // --- UTILITY TOOLS ---
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

    case ToolType.TEXT_POLISHER:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are an expert editor. Rewrite the text to match the requested goal/tone while fixing all grammar and clarity issues. Maintain the original meaning.`,
        generatePrompt: () => `Original Text:\n"${inputs.textToPolish}"\n\nGoal/Tone: ${inputs.polishGoal}`
      };
      break;

    case ToolType.SUMMARIZER:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a precision summarizer. Condense the text according to the requested format.`,
        generatePrompt: () => `Text to Summarize:\n"${inputs.textToSummarize}"\n\nFormat: ${inputs.summaryFormat}`
      };
      break;

    case ToolType.DATA_ANALYSIS:
      config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are a Senior Data Analyst. Analyze the provided data or text report.
        1. Identify key trends, anomalies, and insights.
        2. If raw data is provided, summarize it.
        3. Provide actionable recommendations based on the user's goal.`,
        generatePrompt: () => `Data/Report:\n"${inputs.data}"\n\nAnalysis Goal: ${inputs.goal}`
      };
      break;

    // --- CV & HR TOOLS ---
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

    case ToolType.HR_JOB_DESC:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a generic HR Specialist committed to writing inclusive, clear, and attractive job descriptions.`,
        generatePrompt: () => `Write a job description for a ${inputs.role} at ${inputs.company}.\n\nKey Responsibilities:\n${inputs.responsibilities}\n\nRequirements:\n${inputs.requirements}\n\nTone: ${inputs.tone}`
      };
      break;

    case ToolType.HR_INTERVIEW_PREP:
      config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are a Hiring Manager. Generate a list of likely interview questions and suggested answers (STAR method) for the candidate.`,
        generatePrompt: () => `Role: ${inputs.role}\nIndustry: ${inputs.industry}\n\nProvide 5 behavioral and 5 technical questions with tips.`
      };
      break;

    // --- SOCIAL MEDIA ---
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

    // --- BLOG & EMAIL ---
    case ToolType.BLOG_INTRO:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a professional blog writer. Write a captivating introduction that hooks the reader immediately.`,
        generatePrompt: () => `Topic: ${inputs.topic}\nTone: ${inputs.tone}\nHook Type: ${inputs.hookType}`
      };
      break;

    case ToolType.BLOG_FULL:
      config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are an expert content writer. Write a comprehensive, SEO-optimized blog post. 
        Use H2 and H3 headers. Output in Markdown.`,
        generatePrompt: () => `Topic: ${inputs.topic}\nAudience: ${inputs.audience}\nTone: ${inputs.tone}\nLength: ${inputs.length}`
      };
      break;

    case ToolType.EMAIL_NEWSLETTER:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are an email marketing specialist. Write an engaging newsletter.`,
        generatePrompt: () => `Topic: ${inputs.topic}\nHighlights: ${inputs.highlights}\nCall to Action: ${inputs.cta}`
      };
      break;

    case ToolType.EMAIL_PROMO:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are an expert copywriter. Write a high-converting promotional email.`,
        generatePrompt: () => `Product: ${inputs.product}\nOffer: ${inputs.offer}\nUrgency: ${inputs.urgency}`
      };
      break;

    // --- SEO ---
    case ToolType.SEO_KEYWORDS:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are an SEO specialist. Generate a list of high-volume, relevant keywords.`,
        generatePrompt: () => `Topic: ${inputs.topic}\nRegion: ${inputs.region}`
      };
      break;

    case ToolType.SEO_META_TAGS:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are an SEO specialist. Write optimized Title Tags and Meta Descriptions.`,
        generatePrompt: () => `Topic: ${inputs.topic}\nKeyword: ${inputs.keyword}\nTone: ${inputs.tone}`
      };
      break;

    // --- STRATEGY ---
    case ToolType.STARTUP_VALIDATOR:
      config = {
        modelName: 'gemini-3-pro-preview',
        systemInstruction: `You are a Startup Advisor. Analyze the idea using SWOT analysis and provide critical feedback.`,
        generatePrompt: () => `Startup Idea: ${inputs.idea}\nTarget Market: ${inputs.market}`
      };
      break;

    case ToolType.PRODUCT_DESC:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a Product Marketer. Write compelling product descriptions that sell.`,
        generatePrompt: () => `Product Name: ${inputs.productName}\nFeatures: ${inputs.features}\nAudience: ${inputs.audience}`
      };
      break;
  }

  return config;
};
