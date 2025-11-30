
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

  const accentColor = inputs.accentColor || '#4f46e5';
  const template = inputs.template || 'modern';

  switch (tool) {
    // --- GERMAN MARKET SPECIALS ---
    case ToolType.INVOICE_GEN:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a German accounting expert and frontend developer.
        Your goal is to generate a legally compliant invoice (Rechnung) for the German market as a beautiful HTML document.
        
        Mandatory Fields (§14 UStG) to check/include:
        1. Full name & address of supplier (Leistender Unternehmer).
        2. Full name & address of recipient (Leistungsempfänger).
        3. Tax number (Steuernummer) or VAT ID (USt-IdNr).
        4. Date of issue (Ausstellungsdatum).
        5. Sequential invoice number (Rechnungsnummer).
        6. Description of goods/services (Menge und Art).
        7. Date of supply/service (Leistungszeitpunkt).
        8. Net amount, VAT rate (19% or 7% or 0%), VAT amount, and Gross amount.
        
        Output Rules:
        - Return ONLY HTML code. No markdown code blocks (no \`\`\`html).
        - Use Tailwind CSS classes for structure (grid, flex, padding, margin).
        - **COLOR:** Do NOT use hex codes or Tailwind color classes (like text-blue-600). Instead, use inline styles with the CSS variable: \`style="color: var(--accent-color)"\` or \`style="background-color: var(--accent-color)"\` for accents, headers, and borders.
        - **FONTS:** Do NOT set font families. Inherit the font from the parent container.
        
        Specific Rules based on Type:
        - "Standard Commercial": Calculate 19% VAT. Show Net, VAT, Gross.
        - "Reduced Rate": Calculate 7% VAT. Show Net, VAT, Gross.
        - "Small Business (Kleinunternehmer)": Do NOT charge VAT. MUST include clause: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
        
        Layout Requirements:
        - Use a full width div container.
        - Use a real HTML <table> for items with border-b for rows.
        - Align numbers to the right.
        - Make it look professional and ready to print.`,
        generatePrompt: () => `
        Generate HTML Invoice.
        
        Type: ${inputs.invoiceType}
        Sender: ${inputs.invoiceSender}
        Recipient: ${inputs.invoiceRecipient}
        Meta Data: ${inputs.invoiceDetails}
        Items: ${inputs.invoiceItems}
        Payment Terms: ${inputs.paymentTerms}
        
        IMPORTANT: Return only the inner HTML structure (divs, tables) to be placed inside an A4 container. Do not include <html> or <body> tags.`
      };
      break;

    case ToolType.CONTRACT_GEN:
      config = {
        modelName: 'gemini-3-pro-preview', // Pro for legal accuracy
        systemInstruction: `You are a German legal assistant (Rechtsassistent) and frontend developer.
        Your task is to draft a contract based on German Civil Code (BGB) standards as clean HTML.
        
        IMPORTANT DISCLAIMER:
        Start with a div containing the disclaimer: "**HINWEIS: Dies ist ein KI-generierter Entwurf und stellt keine Rechtsberatung dar.**"
        
        Output Rules:
        - Return ONLY HTML code. No markdown code blocks.
        - Use Tailwind CSS classes.
        - **COLOR:** Use \`style="color: var(--accent-color)"\` for headers (h1, h2, h3) and key accents.
        - **FONTS:** Do not specify font families.
        - Structure:
          - Header: Title centered.
          - Preamble: Introduction of parties.
          - Sections: Use <h3> for §1, §2 etc.
          - Signatures: Use a flexbox grid for two signature lines at the bottom.`,
        generatePrompt: () => `
        Generate HTML Contract.
        Type: ${inputs.contractType}
        Party A: ${inputs.partyA}
        Party B: ${inputs.partyB}
        Subject: ${inputs.subjectMatter}
        Financials: ${inputs.financials}
        Conditions: ${inputs.conditions}
        
        IMPORTANT: Return only the inner HTML structure.`
      };
      break;

    case ToolType.EMAIL_TEMPLATE:
      config = {
        modelName: 'gemini-2.5-flash',
        systemInstruction: `You are a Professional Business Communication Expert.
        Create a high-quality, effective email template based on the user's scenario.
        
        Output format: HTML with Tailwind CSS.
        Style: Clean, readable, email-client friendly simulation.
        
        Structure:
        - Box for Subject Line options (bg-gray-50 p-4 mb-6 rounded).
        - Main Email Body.
        - Placeholders: [Name], [Date] highlighted in yellow (bg-yellow-100).
        - Use \`style="color: var(--accent-color)"\` for the signature name or key highlights.`,
        generatePrompt: () => `Template Type: ${inputs.emailType}
        Recipient Info: ${inputs.recipientInfo}
        Key Points: ${inputs.keyPoints}
        Tone: ${inputs.tone}
        
        Generate the email template HTML.`
      };
      break;

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
        modelName: 'gemini-3-pro-preview', // Keep Pro for complex reasoning
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
        modelName: 'gemini-3-pro-preview', // Keep Pro for high quality bullets
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
        modelName: 'gemini-2.5-flash', 
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
        modelName: 'gemini-2.5-flash', // Optimized: Flash is sufficient for LinkedIn
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
        modelName: 'gemini-2.5-flash', // Optimized: Flash is excellent for long form text generation at low cost
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
        modelName: 'gemini-2.5-flash', // Optimized
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
