/**
 * Brand Consistency Panel Component
 *
 * Analyzes content against brand voice guidelines and provides consistency scoring.
 * Shows issues, suggestions, and metrics for brand alignment.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  X,
  RefreshCw
} from 'lucide-react';
import { getBrandKit } from '../services/brandKit';
import {
  analyzeContent,
  getToneTips,
  VoiceAnalysisResult
} from '../services/brandVoiceAnalyzer';

interface BrandConsistencyPanelProps {
  content: string;
  onClose?: () => void;
}

export const BrandConsistencyPanel: React.FC<BrandConsistencyPanelProps> = ({
  content,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<VoiceAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const brandKit = getBrandKit();

  // Analyze content when it changes (debounced)
  useEffect(() => {
    if (!brandKit || !content.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const result = analyzeContent(content, brandKit.voice);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, brandKit]);

  const handleRefresh = () => {
    if (!brandKit || !content) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeContent(content, brandKit.voice);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 500);
  };

  const toneTips = brandKit ? getToneTips(brandKit.voice.tone) : [];

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp size={20} />;
    if (score >= 60) return <Minus size={20} />;
    return <TrendingDown size={20} />;
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'medium':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    }
  };

  if (!brandKit) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                Brand Consistency
              </h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Shield size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              No Brand Kit found
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Set up your brand kit to check content consistency
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!content.trim()) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                Brand Consistency
              </h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Shield size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Start writing to check brand consistency
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Brand Consistency
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isAnalyzing}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
              title="Refresh analysis"
            >
              <RefreshCw size={16} className={`${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Overall Score */}
        {analysis && (
          <div className={`${getScoreBg(analysis.score)} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${getScoreColor(analysis.score)}`}>
                  {getScoreIcon(analysis.score)}
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 dark:text-slate-400">Brand Tone</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                  {brandKit.voice.tone}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAnalyzing ? (
          <div className="text-center py-12">
            <RefreshCw size={32} className="mx-auto text-indigo-600 mb-3 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Analyzing content...</p>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Tone Match</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${analysis.metrics.toneMatch}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {analysis.metrics.toneMatch}%
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Style Match</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${analysis.metrics.styleMatch}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {analysis.metrics.styleMatch}%
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Terminology</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${analysis.metrics.terminologyMatch}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {analysis.metrics.terminologyMatch}%
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Violations</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className={`text-2xl font-bold ${
                      analysis.metrics.forbiddenPhrasesFound === 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {analysis.metrics.forbiddenPhrasesFound}
                    </span>
                  </div>
                  {analysis.metrics.forbiddenPhrasesFound === 0 ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Issues Found
                </h3>
                <div className="space-y-2">
                  {analysis.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium uppercase mb-1">
                            {issue.severity} - {issue.type}
                          </p>
                          <p className="text-sm">{issue.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Suggestions
                </h3>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-lg"
                    >
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tone Tips */}
            {toneTips.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  {brandKit.voice.tone.charAt(0).toUpperCase() + brandKit.voice.tone.slice(1)} Tone Tips
                </h3>
                <ul className="space-y-2">
                  {toneTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No Issues */}
            {analysis.issues.length === 0 && analysis.score >= 80 && (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
                <p className="text-green-600 dark:text-green-400 font-semibold mb-1">
                  Excellent Brand Consistency!
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your content aligns well with your brand voice
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BrandConsistencyPanel;
