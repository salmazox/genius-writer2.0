/**
 * LinkedIn Posts Panel Component
 *
 * AI-powered LinkedIn post generator for job seekers
 * Creates multiple post variations with different styles
 */

import React, { useState } from 'react';
import { Linkedin, Wand2, Loader2, Copy, Check, X, Hash, Sparkles } from 'lucide-react';
import { generateLinkedInPosts, type LinkedInPost } from '../../services/gemini';
import { CVData } from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface LinkedInPostsPanelProps {
  cvData: CVData;
  jobTarget?: string;
  onClose?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const LinkedInPostsPanel: React.FC<LinkedInPostsPanelProps> = ({
  cvData,
  jobTarget,
  onClose,
  className = ''
}) => {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [customTarget, setCustomTarget] = useState(jobTarget || '');

  const handleGenerate = async () => {
    if (!cvData.personal.fullName || !cvData.personal.jobTitle) {
      setError('Please complete your CV with at least name and job title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedPosts = await generateLinkedInPosts(cvData, customTarget || undefined);
      setPosts(generatedPosts);
    } catch (err) {
      console.error('LinkedIn posts generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate LinkedIn posts');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (content: string, hashtags: string[], index: number) => {
    try {
      const fullPost = `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
      await navigator.clipboard.writeText(fullPost);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'professional':
        return 'from-blue-500 to-indigo-600';
      case 'storytelling':
        return 'from-purple-500 to-pink-600';
      case 'achievement':
        return 'from-green-500 to-emerald-600';
      case 'casual':
        return 'from-orange-500 to-amber-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'professional':
        return '💼';
      case 'storytelling':
        return '📖';
      case 'achievement':
        return '🏆';
      case 'casual':
        return '☕';
      default:
        return '✨';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-slate-950 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
            <Linkedin size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              LinkedIn Post Generator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Create engaging posts to announce your job search
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X size={16} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!posts.length ? (
          // Generation State
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
              <Linkedin size={48} className="text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generate LinkedIn Posts for Your Job Search
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI will create 4 different post styles based on your CV:
                Professional, Storytelling, Achievement-focused, and Casual
              </p>
            </div>

            {/* Target Role Input */}
            <div className="w-full max-w-md space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Target Role (Optional)
              </label>
              <input
                type="text"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                placeholder={cvData.personal.jobTitle || 'e.g., Senior Software Engineer'}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500">
                Leave blank to use your current job title
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-bold transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating 4 Post Variations...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate LinkedIn Posts
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <span className="text-lg">💼</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Professional</p>
                  <p>Formal, straightforward</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">📖</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Storytelling</p>
                  <p>Personal narrative</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Achievement</p>
                  <p>Highlight wins</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">☕</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Casual</p>
                  <p>Warm, relatable</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Display State
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your LinkedIn Posts
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose a style and customize as needed
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Regenerate All
                  </>
                )}
              </button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Style Header */}
                  <div className={`p-4 bg-gradient-to-r ${getStyleColor(post.style)} text-white`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getStyleIcon(post.style)}</span>
                      <div>
                        <h4 className="font-bold capitalize">{post.style}</h4>
                        <p className="text-xs opacity-90">
                          {post.style === 'professional' && 'Formal and straightforward'}
                          {post.style === 'storytelling' && 'Personal narrative approach'}
                          {post.style === 'achievement' && 'Highlight accomplishments'}
                          {post.style === 'casual' && 'Warm and conversational'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium flex items-center gap-1"
                        >
                          <Hash size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(post.content, post.hashtags, index)}
                      className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {copied === index ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Post with Hashtags
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInPostsPanel;
