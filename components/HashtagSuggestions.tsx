/**
 * Hashtag Suggestions Component
 *
 * Displays AI-generated hashtag suggestions for social media posts
 * with relevance scores, popularity indicators, and platform-specific guidance.
 */

import React, { useState } from 'react';
import { Hash, Sparkles, Loader, Info, Copy, Check, TrendingUp } from 'lucide-react';
import {
  generateHashtags,
  HashtagResult,
  SocialPlatform,
  getRelevanceColor,
  getPopularityBadge,
  getCategoryIcon,
  formatHashtagsForPost,
  getPlatformGuidelines
} from '../services/hashtagGenerator';
import Button from './ui/Button';

interface HashtagSuggestionsProps {
  content: string;
  platform: SocialPlatform;
  onHashtagClick?: (hashtag: string) => void;
  onCopyAll?: (hashtags: string) => void;
}

export const HashtagSuggestions: React.FC<HashtagSuggestionsProps> = ({
  content,
  platform,
  onHashtagClick,
  onCopyAll
}) => {
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndividual, setCopiedIndividual] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content || content.trim().length === 0) {
      setError('Please write some content first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const hashtagResult = await generateHashtags(content, platform);
      setResult(hashtagResult);
    } catch (err) {
      setError('Failed to generate hashtags. Please try again.');
      console.error('Hashtag generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (!result) return;

    const formatted = formatHashtagsForPost(result.hashtags);
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    onCopyAll?.(formatted);

    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleHashtagClick = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopiedIndividual(hashtag);
    onHashtagClick?.(hashtag);

    setTimeout(() => setCopiedIndividual(null), 2000);
  };

  const guidelines = getPlatformGuidelines(platform);

  return (
    <div className="space-y-4">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold flex items-center gap-2 text-slate-800">
          <Hash size={18} className="text-indigo-600" />
          Hashtag Suggestions
        </h4>
        {!result && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !content || content.trim().length === 0}
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader size={14} className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} className="mr-2" />
                Generate
              </>
            )}
          </Button>
        )}
      </div>

      {/* Platform Guidelines Info */}
      {!result && !isGenerating && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <div className="flex items-start gap-2 mb-2">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">
                {platform.charAt(0).toUpperCase() + platform.slice(1)} Best Practices:
              </p>
              <ul className="space-y-1">
                <li>• Recommended: {guidelines.recommended} hashtags</li>
                <li>• Maximum: {guidelines.max} hashtags</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Analyzing your content...</p>
          </div>
        </div>
      )}

      {/* Hashtag Results */}
      {result && result.hashtags.length > 0 && (
        <div className="space-y-3">
          {/* Summary Bar */}
          <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-indigo-600" />
              <span className="font-semibold text-indigo-900">
                {result.hashtags.length} hashtags generated
              </span>
            </div>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-semibold"
            >
              {copiedAll ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy All
                </>
              )}
            </button>
          </div>

          {/* Hashtag Grid */}
          <div className="space-y-2">
            {result.hashtags.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => handleHashtagClick(suggestion.hashtag)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getRelevanceColor(suggestion.relevance)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold">
                        {suggestion.hashtag}
                      </span>
                      <span className="text-sm">
                        {getPopularityBadge(suggestion.popularity)}
                      </span>
                      {copiedIndividual === suggestion.hashtag && (
                        <span className="text-xs text-green-600 font-semibold">
                          Copied!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(suggestion.category)}
                        <span className="capitalize">{suggestion.category}</span>
                      </span>
                      <span className="capitalize">{suggestion.popularity}</span>
                      <span className="capitalize">{suggestion.relevance} relevance</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHashtagClick(suggestion.hashtag);
                    }}
                    className="p-1.5 hover:bg-white/50 rounded transition-colors"
                  >
                    {copiedIndividual === suggestion.hashtag ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Tips */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-700 mb-2">
              💡 Tips for {platform.charAt(0).toUpperCase() + platform.slice(1)}:
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              {guidelines.tips.map((tip, idx) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          </div>

          {/* Regenerate Button */}
          <Button
            onClick={handleGenerate}
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader size={14} className="animate-spin mr-2" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles size={14} className="mr-2" />
                Generate New Hashtags
              </>
            )}
          </Button>
        </div>
      )}

      {/* No Results */}
      {result && result.hashtags.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          No hashtags could be generated. Try providing more context in your post.
        </div>
      )}
    </div>
  );
};

export default HashtagSuggestions;
