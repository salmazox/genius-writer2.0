
import { GoogleGenAI } from "@google/genai";
import { ToolType, CVData, ATSAnalysis } from "../types";
import { getPromptConfig } from "../config/aiPrompts";

// Initialize Gemini Client
// IMPORTANT: API_KEY must be set in environment variables (see vite.config.ts)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContent = async (
  tool: ToolType,
  inputs: Record<string, string>,
  brandVoiceInstruction?: string,
  signal?: AbortSignal
): Promise<string> => {
  
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  // Handle Image Gen separately
  if (tool === ToolType.IMAGE_GEN) {
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
                return `![Generated Image](data:${part.inlineData.mimeType};base64,${base64EncodeString})`;
            }
        }
        return "Failed to generate image. Please try again.";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        console.error("Image Gen Error", e);
        return "Error generating image.";
      }
  }

  // Get configuration
  const promptConfig = getPromptConfig(tool, inputs);
  let systemInstruction = promptConfig.systemInstruction;
  
  if (brandVoiceInstruction) {
    systemInstruction += `\n\nCRITICAL BRAND VOICE INSTRUCTION: ${brandVoiceInstruction}. \nEnsure the output strictly adheres to this voice/persona.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: promptConfig.modelName,
      contents: promptConfig.generatePrompt(inputs),
      config: { systemInstruction: systemInstruction },
    });

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    return response.text || "No response generated.";
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
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  
  let sysInstruct = "You are a professional editor. Improve the text based on the user's specific instruction.";
  if (brandVoiceInstruction) {
    sysInstruct += `\n\nApply the following Brand Voice/Style: ${brandVoiceInstruction}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Original Text:\n"${currentContent}"\n\nInstruction: ${instruction}\n\nRewrite the text to follow the instruction. Return ONLY the rewritten text, no conversational filler. Keep existing HTML or Markdown formatting unless asked to change it.`,
      config: { systemInstruction: sysInstruct },
    });

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    return response.text || currentContent;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Gemini Refine Error:", error);
    throw error;
  }
};

export const analyzeATS = async (
    cvData: CVData, 
    jobDescription: string,
    signal?: AbortSignal
): Promise<ATSAnalysis> => {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

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
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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

        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const text = response.text || "{}";
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
