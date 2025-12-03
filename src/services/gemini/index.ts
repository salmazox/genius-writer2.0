/**
 * Gemini Service - Main Entry Point
 *
 * This file re-exports all functions from the split modules.
 * Components should import from this file to maintain backwards compatibility.
 */

// Export types and utilities
export { UsageData, LIMITS, getUsageData } from './usageTracking';
export type { LinkedInPost } from './cv';

// Export content generation functions
export {
  generateContent,
  generateContentStream,
  refineContent,
  chatWithAI,
  createLiveSession
} from './content';

// Export CV-related functions
export {
  generateCoverLetter,
  analyzeATS,
  parseResume,
  parseLinkedInProfile,
  parsePDFResume,
  generateCVFromJobDescription,
  generateLinkedInPosts
} from './cv';

// Export audio functions
export { generateSpeech } from './audio';

// Export analysis functions
export { factCheck, extractBrandVoice } from './analysis';
