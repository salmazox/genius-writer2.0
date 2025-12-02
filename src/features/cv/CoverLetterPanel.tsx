/**
 * Cover Letter Panel Component
 *
 * AI-powered cover letter generator that creates personalized
 * cover letters based on CV data and job descriptions.
 */

import React, { useState } from 'react';
import { FileText, Wand2, Loader2, Copy, Check, Download, Edit3, X } from 'lucide-react';
import { generateCoverLetter } from '../../services/gemini';
import { CVData } from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface CoverLetterPanelProps {
  cvData: CVData;
  jobDescription: string;
  onClose?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const CoverLetterPanel: React.FC<CoverLetterPanelProps> = ({
  cvData,
  jobDescription,
  onClose,
  className = ''
}) => {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription || jobDescription.length < 50) {
      setError('Please provide a job description first (minimum 50 characters)');
      return;
    }

    if (!cvData.personal.fullName || !cvData.personal.jobTitle) {
      setError('Please complete your CV with at least name and job title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const letter = await generateCoverLetter(cvData, jobDescription);
      setCoverLetter(letter);
      setEditedContent(letter);
    } catch (err) {
      console.error('Cover letter generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const content = isEditing ? editedContent : coverLetter;
    try {
      // Create a temporary div to convert HTML to plain text
      const temp = document.createElement('div');
      temp.innerHTML = content;
      const plainText = temp.innerText || temp.textContent || '';

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    const content = isEditing ? editedContent : coverLetter;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${cvData.personal.fullName?.replace(/\s+/g, '-').toLowerCase() || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    setCoverLetter(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(coverLetter);
    setIsEditing(false);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cover Letter Generator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              AI-powered personalized cover letters
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
            title="Close"
          >
            <X size={16} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!coverLetter ? (
          // Generation State
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
              <FileText size={40} className="text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generate Your Cover Letter
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                Create a personalized cover letter based on your CV and the job description.
                AI will match your experience with the job requirements.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg max-w-md">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-bold transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate Cover Letter
                </>
              )}
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
              <p>✓ Personalized to your experience</p>
              <p>✓ Matched to job requirements</p>
              <p>✓ Professional tone & structure</p>
            </div>
          </div>
        ) : (
          // Display State
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Edit3 size={14} />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download size={14} />
                Download HTML
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    Regenerate
                  </>
                )}
              </button>
            </div>

            {/* Cover Letter Content */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {isEditing ? (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-96 p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Edit your cover letter here..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-8 bg-white dark:bg-slate-900 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: coverLetter }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterPanel;
