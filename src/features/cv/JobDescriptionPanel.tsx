/**
 * Job Description Panel Component
 *
 * Intelligent job description analysis panel that extracts key information
 * using AI to help optimize CV for specific job applications.
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, Building, Sparkles, X, RefreshCw, AlertCircle, CheckCircle, Loader2, Wand2 } from 'lucide-react';
import { generateContent, generateCVFromJobDescription } from '../../services/gemini';
import { ToolType, CVData } from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface JobDescriptionData {
  rawText: string;
  extractedSkills: string[];
  keyResponsibilities: string[];
  culturalKeywords: string[];
  companyName?: string;
  jobTitle?: string;
}

interface JobDescriptionPanelProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyzed?: (data: JobDescriptionData) => void;
  onGenerateCV?: (cvData: Partial<CVData>) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const JobDescriptionPanel: React.FC<JobDescriptionPanelProps> = ({
  value,
  onChange,
  onAnalyzed,
  onGenerateCV,
  className = ''
}) => {
  const [jobDescData, setJobDescData] = useState<JobDescriptionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAnalyzeTriggered, setAutoAnalyzeTriggered] = useState(false);

  // Auto-analyze when user pastes substantial text
  useEffect(() => {
    if (value.length > 100 && !autoAnalyzeTriggered && !jobDescData) {
      const timer = setTimeout(() => {
        analyzeJobDescription(value);
        setAutoAnalyzeTriggered(true);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    }
  }, [value, autoAnalyzeTriggered, jobDescData]);

  const analyzeJobDescription = async (text: string) => {
    if (!text || text.length < 50) {
      setError('Job description is too short. Please paste a complete job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call Gemini to extract structured data
      const prompt = `Analyze this job description and extract key information as JSON.

Job Description:
"""
${text}
"""

Extract the following and return ONLY valid JSON (no markdown, no code blocks):
{
  "companyName": "company name or 'Unknown' if not found",
  "jobTitle": "exact job title from the description",
  "skills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "cultural": ["keyword1", "keyword2", ...]
}

Rules:
- skills: Technical skills, tools, technologies, programming languages (8-15 items)
- responsibilities: Key job duties and what the role involves (3-5 items)
- cultural: Company culture keywords like "fast-paced", "collaborative", "innovative" (3-5 items)
- Return valid JSON only, no extra text
- If something is not found, use empty array or "Unknown"`;

      const result = await generateContent(ToolType.CV_BUILDER, { content: prompt });

      // Parse the response
      let parsed;
      try {
        // Remove markdown code blocks if present
        const cleanedResult = result
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        parsed = JSON.parse(cleanedResult);
      } catch (parseError) {
        console.error('Failed to parse AI response:', result);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      const analyzedData: JobDescriptionData = {
        rawText: text,
        extractedSkills: parsed.skills || [],
        keyResponsibilities: parsed.responsibilities || [],
        culturalKeywords: parsed.cultural || [],
        companyName: parsed.companyName || undefined,
        jobTitle: parsed.jobTitle || undefined
      };

      setJobDescData(analyzedData);
      if (onAnalyzed) {
        onAnalyzed(analyzedData);
      }
    } catch (err) {
      console.error('Job description analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setJobDescData(null);
    setAutoAnalyzeTriggered(false);
    setError(null);
  };

  const handleReanalyze = () => {
    setJobDescData(null);
    setAutoAnalyzeTriggered(false);
    analyzeJobDescription(value);
  };

  const handleGenerateCV = async () => {
    if (!value || !onGenerateCV) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedCV = await generateCVFromJobDescription(value);
      onGenerateCV(generatedCV);
    } catch (err) {
      console.error('CV generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${className}`}>
      {!jobDescData ? (
        // Input State
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-indigo-200 dark:border-slate-700">
          <div className="p-4 border-b border-indigo-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Target Job Description
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Paste the job description to get AI-powered keyword matching and optimization tips
            </p>
          </div>

          <div className="p-4">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste job description here... (minimum 50 characters)

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and AWS. You'll be responsible for building scalable web applications..."
              className="w-full h-48 rounded-lg border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={isAnalyzing}
            />

            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg flex items-center gap-2">
                <Loader2 size={14} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Analyzing job description with AI...
                </p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => analyzeJobDescription(value)}
                disabled={isAnalyzing || value.length < 50}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Analyze with AI
                  </>
                )}
              </button>

              {value.length > 0 && (
                <button
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Results State
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border-green-200 dark:border-slate-700">
          <div className="p-4 border-b border-green-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Analysis Complete
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    CV scoring now includes job-specific keywords
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-1 rounded hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                title="Clear analysis"
              >
                <X size={14} className="text-slate-500" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Job Title & Company */}
            {(jobDescData.jobTitle || jobDescData.companyName) && (
              <div>
                {jobDescData.jobTitle && (
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {jobDescData.jobTitle}
                  </p>
                )}
                {jobDescData.companyName && jobDescData.companyName !== 'Unknown' && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building size={12} className="text-slate-500" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {jobDescData.companyName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Required Skills */}
            {jobDescData.extractedSkills.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  Required Skills ({jobDescData.extractedSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jobDescData.extractedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            {jobDescData.keyResponsibilities.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  Key Responsibilities
                </p>
                <ul className="space-y-1.5">
                  {jobDescData.keyResponsibilities.map((resp, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cultural Keywords */}
            {jobDescData.culturalKeywords.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  Culture Keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jobDescData.culturalKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-green-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                <RefreshCw size={12} />
                Re-analyze
              </button>

              {onGenerateCV && (
                <button
                  onClick={handleGenerateCV}
                  disabled={isGenerating || isAnalyzing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg text-xs font-bold transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating CV...
                    </>
                  ) : (
                    <>
                      <Wand2 size={14} />
                      Generate CV from This Job
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionPanel;
