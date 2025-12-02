/**
 * SEO Panel Component
 *
 * Comprehensive SEO analysis panel with:
 * - Overall SEO score with visual indicator
 * - Component breakdown (keywords, readability, structure, meta, technical)
 * - Keyword analysis with density and placement
 * - Readability metrics with Flesch score
 * - Content structure analysis
 * - Actionable recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Target,
  FileText,
  Layout,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Hash,
  BarChart3
} from 'lucide-react';
import {
  calculateSEOScore,
  getScoreColor,
  getScoreLabel,
  getRecommendationIcon,
  SEOScore,
  SEOKeywordAnalysis,
  SEORecommendation
} from '../services/seoScorer';

interface SEOPanelProps {
  content: string;
  keywords?: string[];
  title?: string;
  metaDescription?: string;
  onKeywordsChange?: (keywords: string[]) => void;
}

export const SEOPanel: React.FC<SEOPanelProps> = ({
  content,
  keywords = [],
  title,
  metaDescription,
  onKeywordsChange
}) => {
  const [keywordInput, setKeywordInput] = useState(keywords.join(', '));
  const [seoScore, setSeoScore] = useState<SEOScore | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    keywords: true,
    readability: false,
    structure: false,
    recommendations: true
  });

  useEffect(() => {
    if (!content || content.trim().length === 0) {
      setSeoScore(null);
      return;
    }

    const keywordList = keywordInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const score = calculateSEOScore(content, keywordList, {
      title,
      metaDescription
    });

    setSeoScore(score);
  }, [content, keywordInput, title, metaDescription]);

  const handleKeywordChange = (value: string) => {
    setKeywordInput(value);
    const keywordList = value.split(',').map(k => k.trim()).filter(Boolean);
    onKeywordsChange?.(keywordList);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRecommendationColor = (category: SEORecommendation['category']) => {
    switch (category) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getKeywordDensityColor = (distribution: SEOKeywordAnalysis['distribution']) => {
    switch (distribution) {
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'low':
        return 'text-orange-600 bg-orange-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  if (!seoScore) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <Search size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-400">
            Start writing to see SEO analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall SEO Score */}
      <div className={`p-4 rounded-lg border ${getScoreColor(seoScore.overall)}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold flex items-center gap-2">
            <TrendingUp size={18} />
            SEO Score
          </h4>
          <span className="text-xs font-semibold uppercase">
            {getScoreLabel(seoScore.overall)}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <div className="text-4xl font-black">
            {seoScore.overall}
          </div>
          <div className="text-sm mb-1">/ 100</div>
        </div>
        <div className="w-full bg-white/50 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full transition-all ${
              seoScore.overall >= 80 ? 'bg-green-600' :
              seoScore.overall >= 60 ? 'bg-yellow-600' :
              seoScore.overall >= 40 ? 'bg-orange-600' :
              'bg-red-600'
            }`}
            style={{ width: `${seoScore.overall}%` }}
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <ScoreCard
          icon={<Target size={14} />}
          label="Keywords"
          score={seoScore.breakdown.keywords}
        />
        <ScoreCard
          icon={<FileText size={14} />}
          label="Readability"
          score={seoScore.breakdown.readability}
        />
        <ScoreCard
          icon={<Layout size={14} />}
          label="Structure"
          score={seoScore.breakdown.structure}
        />
        <ScoreCard
          icon={<Hash size={14} />}
          label="Meta Tags"
          score={seoScore.breakdown.meta}
        />
      </div>

      {/* Keyword Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Target Keywords
        </label>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="e.g., content marketing, SEO tips"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Comma-separated keywords to track
        </p>
      </div>

      {/* Keyword Analysis */}
      {seoScore.keywordAnalysis.length > 0 && (
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('keywords')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Target size={14} />
              Keyword Analysis ({seoScore.keywordAnalysis.length})
            </span>
            {expandedSections.keywords ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expandedSections.keywords && (
            <div className="p-3 space-y-2 border-t border-slate-200">
              {seoScore.keywordAnalysis.map((kw, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border ${getKeywordDensityColor(kw.distribution)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">"{kw.keyword}"</span>
                    <span className="text-[10px] font-semibold uppercase">
                      {kw.distribution === 'good' ? '✓ Good' : kw.distribution === 'low' ? '⚠ Low' : '⚠ High'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span>Count: {kw.count}</span>
                    <span>Density: {kw.density.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    {kw.inTitle && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Title ✓</span>}
                    {kw.inFirstParagraph && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Intro ✓</span>}
                    {kw.inHeadings > 0 && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">H2/H3 ({kw.inHeadings})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Readability Metrics */}
      <div className="border border-slate-200 rounded-lg">
        <button
          onClick={() => toggleSection('readability')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <FileText size={14} />
            Readability Metrics
          </span>
          {expandedSections.readability ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.readability && (
          <div className="p-3 space-y-2 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                label="Flesch Score"
                value={Math.round(seoScore.readability.fleschScore)}
                subtext={seoScore.readability.fleschLevel}
              />
              <MetricCard
                label="Word Count"
                value={seoScore.readability.wordCount}
                subtext={`${seoScore.readability.sentenceCount} sentences`}
              />
              <MetricCard
                label="Avg Words/Sentence"
                value={Math.round(seoScore.readability.averageWordsPerSentence)}
                subtext="Aim for 15-20"
              />
              <MetricCard
                label="Avg Syllables/Word"
                value={seoScore.readability.averageSyllablesPerWord.toFixed(1)}
                subtext="Simpler is better"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Structure */}
      <div className="border border-slate-200 rounded-lg">
        <button
          onClick={() => toggleSection('structure')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Layout size={14} />
            Content Structure
          </span>
          {expandedSections.structure ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expandedSections.structure && (
          <div className="p-3 space-y-2 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                label="H1 Tags"
                value={seoScore.structure.h1Count}
                subtext={seoScore.structure.h1Count === 1 ? '✓ Perfect' : 'Use exactly 1'}
              />
              <MetricCard
                label="H2 Tags"
                value={seoScore.structure.h2Count}
                subtext="Section breaks"
              />
              <MetricCard
                label="Paragraphs"
                value={seoScore.structure.paragraphCount}
                subtext={`~${Math.round(seoScore.structure.averageParagraphLength)} words avg`}
              />
              <MetricCard
                label="Lists"
                value={seoScore.structure.listCount}
                subtext="For scannability"
              />
              <MetricCard
                label="Images"
                value={seoScore.structure.imageCount}
                subtext={`${seoScore.structure.imagesWithAlt} with alt text`}
              />
              <MetricCard
                label="Links"
                value={seoScore.structure.linkCount}
                subtext={`${seoScore.structure.internalLinks} internal`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {seoScore.recommendations.length > 0 && (
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Lightbulb size={14} />
              Recommendations ({seoScore.recommendations.length})
            </span>
            {expandedSections.recommendations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expandedSections.recommendations && (
            <div className="p-3 space-y-2 border-t border-slate-200 max-h-96 overflow-y-auto">
              {seoScore.recommendations
                .sort((a, b) => {
                  const categoryOrder = { critical: 0, warning: 1, suggestion: 2, success: 3 };
                  return categoryOrder[a.category] - categoryOrder[b.category];
                })
                .map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border ${getRecommendationColor(rec.category)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">
                        {getRecommendationIcon(rec.category)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs mb-0.5">{rec.title}</div>
                        <div className="text-[10px] leading-relaxed">{rec.message}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            rec.impact === 'high' ? 'bg-red-100 text-red-700' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {rec.impact} impact
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Quick Stats</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600">
          <div>
            <span className="font-semibold">{seoScore.readability.wordCount}</span> words
          </div>
          <div>
            <span className="font-semibold">{Math.ceil(seoScore.readability.wordCount / 200)}</span> min read
          </div>
          <div>
            <span className="font-semibold">{seoScore.structure.h2Count + seoScore.structure.h3Count}</span> headings
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for score cards
const ScoreCard: React.FC<{ icon: React.ReactNode; label: string; score: number }> = ({
  icon,
  label,
  score
}) => {
  const color =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-yellow-600' :
    score >= 40 ? 'text-orange-600' :
    'text-red-600';

  return (
    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-1.5 mb-1 text-slate-600">
        {icon}
        <span className="text-[10px] font-semibold">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{score}</div>
    </div>
  );
};

// Helper component for metric cards
const MetricCard: React.FC<{ label: string; value: number | string; subtext?: string }> = ({
  label,
  value,
  subtext
}) => {
  return (
    <div className="p-2 bg-slate-50 rounded border border-slate-200">
      <div className="text-[10px] text-slate-600 mb-0.5">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
      {subtext && <div className="text-[9px] text-slate-500 mt-0.5">{subtext}</div>}
    </div>
  );
};

export default SEOPanel;
