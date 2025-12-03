/**
 * Content Analysis Panel Component
 *
 * Displays comprehensive content quality analysis including:
 * - Readability metrics
 * - Tone analysis
 * - Sentiment analysis
 * - Overall quality score
 */

import React, { useMemo } from 'react';
import {
  BookOpen,
  MessageCircle,
  Smile,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { analyzeContent, ContentQualityReport } from '../services/contentAnalysis';

interface ContentAnalysisPanelProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export const ContentAnalysisPanel: React.FC<ContentAnalysisPanelProps> = ({
  content,
  className = '',
  compact = false
}) => {
  const analysis = useMemo(() => {
    return analyzeContent(content);
  }, [content]);

  if (!content || content.trim().length === 0) {
    return (
      <div className={`p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
        <div className="text-center">
          <Info className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Start writing to see content analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
            Content Quality
          </h3>
          <TrendingUp size={20} />
        </div>
        <div className="flex items-end gap-2">
          <div className="text-5xl font-bold">{analysis.overallScore}</div>
          <div className="text-2xl opacity-75 mb-1">/100</div>
        </div>
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${analysis.overallScore}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Words" value={analysis.wordCount} />
          <StatCard label="Sentences" value={analysis.sentenceCount} />
          <StatCard label="Paragraphs" value={analysis.paragraphCount} />
          <StatCard label="Unique Words" value={analysis.uniqueWords} />
        </div>
      )}

      {/* Readability Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-slate-900 dark:text-white">Readability</h4>
        </div>

        <div className="space-y-3">
          <MetricRow
            label="Reading Ease"
            value={analysis.readability.fleschReadingEase}
            max={100}
            color="blue"
            badge={analysis.readability.readingLevel}
          />
          <MetricRow
            label="Grade Level"
            value={analysis.readability.fleschKincaidGrade}
            max={18}
            color="cyan"
            badge={`Grade ${Math.round(analysis.readability.fleschKincaidGrade)}`}
          />

          {!compact && (
            <>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <MiniStat
                  label="Avg Sentence Length"
                  value={`${analysis.readability.averageSentenceLength} words`}
                />
                <MiniStat
                  label="Avg Word Length"
                  value={`${analysis.readability.averageWordLength} chars`}
                />
              </div>

              {analysis.readability.complexWordPercentage > 15 && (
                <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    {analysis.readability.complexWordPercentage.toFixed(1)}% complex words. Consider simpler alternatives.
                  </p>
                </div>
              )}
            </>
          )}

          {analysis.readability.recommendations.map((rec, idx) => (
            <RecommendationItem key={idx} text={rec} />
          ))}
        </div>
      </div>

      {/* Tone Analysis */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={18} className="text-purple-600 dark:text-purple-400" />
          <h4 className="font-bold text-slate-900 dark:text-white">Tone Analysis</h4>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {analysis.tone.primaryTone}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {analysis.tone.confidence}% confidence
            </div>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - analysis.tone.confidence / 100)}`}
                className="text-purple-600 dark:text-purple-400 transition-all duration-500"
              />
            </svg>
          </div>
        </div>

        {!compact && analysis.tone.characteristics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {analysis.tone.characteristics.map((char, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full"
              >
                {char}
              </span>
            ))}
          </div>
        )}

        {analysis.tone.suggestions.map((sug, idx) => (
          <RecommendationItem key={idx} text={sug} />
        ))}
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Smile size={18} className="text-green-600 dark:text-green-400" />
          <h4 className="font-bold text-slate-900 dark:text-white">Sentiment</h4>
        </div>

        <div className="flex items-center gap-4">
          <div className={`
            flex-1 p-4 rounded-lg text-center font-bold
            ${analysis.sentiment.sentiment === 'Positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : ''}
            ${analysis.sentiment.sentiment === 'Neutral' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : ''}
            ${analysis.sentiment.sentiment === 'Negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''}
          `}>
            {analysis.sentiment.sentiment}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {analysis.sentiment.score > 0 ? '+' : ''}{(analysis.sentiment.score * 100).toFixed(0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Score</div>
          </div>
        </div>

        {!compact && analysis.sentiment.emotionalWords.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Emotional Keywords:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.sentiment.emotionalWords.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    item.sentiment === 'positive'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {item.word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white">
      {value.toLocaleString()}
    </div>
  </div>
);

const MetricRow: React.FC<{
  label: string;
  value: number;
  max: number;
  color: 'blue' | 'cyan' | 'purple' | 'green';
  badge?: string;
}> = ({ label, value, max, color, badge }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const colorClasses: Record<'blue' | 'cyan' | 'purple' | 'green', string> = {
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</div>
    <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
  </div>
);

const RecommendationItem: React.FC<{ text: string }> = ({ text }) => {
  const isPositive = text.toLowerCase().includes('good') || text.toLowerCase().includes('excellent');

  return (
    <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
      {isPositive ? (
        <CheckCircle size={14} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      )}
      <p className="text-xs text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  );
};

export default ContentAnalysisPanel;
