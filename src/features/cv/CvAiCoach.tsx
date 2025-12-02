/**
 * AI Co-Pilot Sidebar Component
 *
 * Provides real-time coaching tips and suggestions as the user edits their CV.
 * Categorizes feedback into Warnings, Suggestions, and Improvements with
 * actionable "Fix it" buttons.
 */

import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, X, Check } from 'lucide-react';
import type { CVData } from '../../types';
import type { ATSScoreBreakdown } from '../../services/atsScoring';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CoachingTip {
  id: string;
  type: 'warning' | 'suggestion' | 'improvement';
  section: 'Experience' | 'Skills' | 'Summary' | 'Keywords' | 'Formatting' | 'Length' | 'General';
  message: string;
  actionLabel?: string;
  action?: () => void;
  priority: number; // Higher = more important
}

interface CvAiCoachProps {
  cvData: CVData;
  atsScore: ATSScoreBreakdown | null;
  onUpdateCV: (updates: Partial<CVData>) => void;
  isCompact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const CvAiCoach: React.FC<CvAiCoachProps> = ({
  cvData,
  atsScore,
  onUpdateCV,
  isCompact = false
}) => {
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'warning' | 'suggestion' | 'improvement'>('all');

  // Generate tips whenever CV or ATS score changes
  useEffect(() => {
    if (!atsScore) {
      setTips([]);
      return;
    }

    const generatedTips = generateCoachingTips(cvData, atsScore, {
      onAddKeywords: handleAddKeywords,
      onFixSummary: handleFixSummary,
      onAddQuantifications: handleAddQuantifications,
      onFixActionVerbs: handleFixActionVerbs
    });

    setTips(generatedTips);
  }, [cvData, atsScore]);

  // Action handlers
  const handleAddKeywords = (keywords: string[]) => {
    const newSkills = [...cvData.skills];
    keywords.forEach(keyword => {
      if (!newSkills.includes(keyword)) {
        newSkills.push(keyword);
      }
    });
    onUpdateCV({ skills: newSkills });
  };

  const handleFixSummary = () => {
    // Expand summary with template
    const currentSummary = cvData.personal.summary;
    if (currentSummary.split(' ').length < 30) {
      const expandedSummary = currentSummary + ' ' +
        'Proven track record of delivering high-impact projects and exceeding expectations. ' +
        'Strong communicator with excellent problem-solving skills.';
      onUpdateCV({
        personal: { ...cvData.personal, summary: expandedSummary }
      });
    }
  };

  const handleAddQuantifications = () => {
    // This is a placeholder - in real app, would guide user to specific experience entries
    alert('💡 Tip: Add numbers to your achievements!\n\nExample:\n"Managed projects" → "Managed 5+ projects with budgets exceeding $500k"\n"Improved performance" → "Improved performance by 40%, reducing load time from 3s to 1.8s"');
  };

  const handleFixActionVerbs = () => {
    alert('💡 Tip: Replace weak phrases with strong action verbs!\n\nReplace:\n"Responsible for..." → "Led..."\n"Helped with..." → "Contributed to..."\n"Worked on..." → "Developed..."');
  };

  const handleDismissTip = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]));
  };

  const handleApplyAction = (tip: CoachingTip) => {
    if (tip.action) {
      tip.action();
      handleDismissTip(tip.id);
    }
  };

  // Filter and sort tips
  const visibleTips = tips
    .filter(tip => !dismissedTips.has(tip.id))
    .filter(tip => activeFilter === 'all' || tip.type === activeFilter)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, isCompact ? 3 : 10);

  const tipCounts = {
    warnings: tips.filter(t => t.type === 'warning' && !dismissedTips.has(t.id)).length,
    suggestions: tips.filter(t => t.type === 'suggestion' && !dismissedTips.has(t.id)).length,
    improvements: tips.filter(t => t.type === 'improvement' && !dismissedTips.has(t.id)).length
  };

  if (!atsScore) {
    return (
      <div className="p-4 text-center">
        <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Start editing to get AI coaching tips
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            AI Co-Pilot
          </h3>
        </div>

        {/* Filter Tabs */}
        {!isCompact && (
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-2 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({visibleTips.length})
            </button>
            <button
              onClick={() => setActiveFilter('warning')}
              className={`flex-1 px-2 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'warning'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle size={12} className="inline mr-1" />
              {tipCounts.warnings}
            </button>
            <button
              onClick={() => setActiveFilter('suggestion')}
              className={`flex-1 px-2 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'suggestion'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lightbulb size={12} className="inline mr-1" />
              {tipCounts.suggestions}
            </button>
            <button
              onClick={() => setActiveFilter('improvement')}
              className={`flex-1 px-2 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'improvement'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp size={12} className="inline mr-1" />
              {tipCounts.improvements}
            </button>
          </div>
        )}
      </div>

      {/* Tips List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {visibleTips.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Great work!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No issues detected. Your CV is optimized.
            </p>
          </div>
        ) : (
          visibleTips.map(tip => (
            <TipCard
              key={tip.id}
              tip={tip}
              onDismiss={() => handleDismissTip(tip.id)}
              onApply={() => handleApplyAction(tip)}
              isCompact={isCompact}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TIP CARD COMPONENT
// ============================================================================

interface TipCardProps {
  tip: CoachingTip;
  onDismiss: () => void;
  onApply: () => void;
  isCompact?: boolean;
}

const TipCard: React.FC<TipCardProps> = ({ tip, onDismiss, onApply, isCompact }) => {
  const styles = {
    warning: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-900/50',
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      sectionColor: 'text-red-700 dark:text-red-300'
    },
    suggestion: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-900/50',
      icon: Lightbulb,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      sectionColor: 'text-yellow-700 dark:text-yellow-300'
    },
    improvement: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-900/50',
      icon: TrendingUp,
      iconColor: 'text-green-600 dark:text-green-400',
      sectionColor: 'text-green-700 dark:text-green-300'
    }
  };

  const style = styles[tip.type];
  const Icon = style.icon;

  return (
    <div className={`p-3 rounded-lg border ${style.bg} ${style.border} relative group`}>
      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/50 dark:hover:bg-slate-800/50"
        title="Dismiss"
      >
        <X size={12} className="text-slate-400" />
      </button>

      <div className="flex items-start gap-2">
        <Icon size={14} className={`${style.iconColor} mt-0.5 flex-shrink-0`} />

        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-semibold ${style.sectionColor} uppercase tracking-wide mb-1`}>
            {tip.section}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {tip.message}
          </p>

          {tip.action && tip.actionLabel && (
            <button
              onClick={onApply}
              className={`mt-2 text-xs font-semibold ${style.iconColor} hover:underline flex items-center gap-1`}
            >
              {tip.actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TIP GENERATION LOGIC
// ============================================================================

interface TipActions {
  onAddKeywords: (keywords: string[]) => void;
  onFixSummary: () => void;
  onAddQuantifications: () => void;
  onFixActionVerbs: () => void;
}

function generateCoachingTips(
  cvData: CVData,
  atsScore: ATSScoreBreakdown,
  actions: TipActions
): CoachingTip[] {
  const tips: CoachingTip[] = [];
  let tipIdCounter = 0;

  // Helper to create tip
  const createTip = (
    type: CoachingTip['type'],
    section: CoachingTip['section'],
    message: string,
    priority: number,
    actionLabel?: string,
    action?: () => void
  ): CoachingTip => ({
    id: `tip-${tipIdCounter++}`,
    type,
    section,
    message,
    priority,
    actionLabel,
    action
  });

  // RULE 1: Keywords - Critical if score < 60
  if (atsScore.criteria.keywords.score < 60) {
    tips.push(createTip(
      'warning',
      'Keywords',
      'Your CV is missing important industry keywords. Add relevant technical skills and buzzwords to improve ATS matching.',
      10,
      'Add Skills',
      () => actions.onAddKeywords(['React', 'Node.js', 'TypeScript', 'AWS'])
    ));
  } else if (atsScore.criteria.keywords.score < 75) {
    tips.push(createTip(
      'suggestion',
      'Keywords',
      'Good keyword usage! Add a few more specific technologies or methodologies to reach excellent score.',
      5
    ));
  }

  // RULE 2: Quantification - Critical if score < 50
  if (atsScore.criteria.quantification.score < 30) {
    tips.push(createTip(
      'warning',
      'Experience',
      'None of your achievements are quantified. Numbers make your impact tangible. Add percentages, dollar amounts, or metrics.',
      9,
      'See Examples',
      actions.onAddQuantifications
    ));
  } else if (atsScore.criteria.quantification.score < 50) {
    tips.push(createTip(
      'warning',
      'Experience',
      'Less than half of your achievements include numbers. Quantify more results with percentages, metrics, or dollar amounts.',
      8,
      'See Examples',
      actions.onAddQuantifications
    ));
  } else if (atsScore.criteria.quantification.score < 70) {
    tips.push(createTip(
      'suggestion',
      'Experience',
      'Good progress on quantification! Try to add metrics to a few more bullet points.',
      4
    ));
  }

  // RULE 3: Action Verbs - Warning if score < 60
  if (atsScore.criteria.actionVerbs.score < 50) {
    tips.push(createTip(
      'warning',
      'Experience',
      'Your CV uses weak phrases like "responsible for" or "worked on". Replace them with strong action verbs like "Led", "Achieved", "Optimized".',
      7,
      'See Examples',
      actions.onFixActionVerbs
    ));
  } else if (atsScore.criteria.actionVerbs.score < 70) {
    tips.push(createTip(
      'suggestion',
      'Experience',
      'Consider strengthening a few more bullet points with powerful action verbs.',
      4
    ));
  }

  // RULE 4: Summary - Must have decent length
  const summaryLength = cvData.personal.summary.split(' ').length;
  if (summaryLength < 20) {
    tips.push(createTip(
      'warning',
      'Summary',
      'Your professional summary is too short. Aim for 50-80 words to make a strong first impression.',
      8,
      'Expand Summary',
      actions.onFixSummary
    ));
  } else if (summaryLength < 40) {
    tips.push(createTip(
      'suggestion',
      'Summary',
      'Your summary could be more detailed. Add your key strengths and career highlights.',
      5,
      'Expand Summary',
      actions.onFixSummary
    ));
  }

  // RULE 5: Skills - Need enough
  if (cvData.skills.length < 5) {
    tips.push(createTip(
      'warning',
      'Skills',
      'Add more skills! Most competitive CVs list 10-15 relevant skills. Include both technical and soft skills.',
      7
    ));
  } else if (cvData.skills.length < 8) {
    tips.push(createTip(
      'suggestion',
      'Skills',
      'Consider adding a few more skills. Aim for 10-15 to showcase your full skillset.',
      4
    ));
  }

  // RULE 6: Formatting issues
  if (atsScore.criteria.formatting.score < 80) {
    const details = atsScore.criteria.formatting.details;
    details.forEach(detail => {
      if (detail.includes('email') || detail.includes('phone')) {
        tips.push(createTip(
          'warning',
          'Formatting',
          detail,
          6
        ));
      }
    });
  }

  // RULE 7: Length issues
  if (atsScore.criteria.length.score < 50) {
    tips.push(createTip(
      'suggestion',
      'Length',
      atsScore.criteria.length.details[0] || 'Adjust your CV length to the optimal range (400-800 words).',
      5
    ));
  }

  // RULE 8: Structure issues
  if (atsScore.criteria.structure.score < 70) {
    tips.push(createTip(
      'warning',
      'General',
      'Your CV is missing key sections. Ensure you have: Summary, Experience, Education, and Skills.',
      7
    ));
  }

  // RULE 9: Overall excellence - Encourage if doing well
  if (atsScore.overall >= 85) {
    tips.push(createTip(
      'improvement',
      'General',
      '🎉 Excellent work! Your CV is highly optimized for ATS systems. Consider tailoring it further for specific job applications.',
      1
    ));
  } else if (atsScore.overall >= 70) {
    tips.push(createTip(
      'improvement',
      'General',
      '👍 Good job! A few more improvements will push your score to excellent. Focus on the areas marked in red.',
      2
    ));
  }

  // RULE 10: Job Description reminder
  const hasJobDescription = atsScore.criteria.keywords.details.some(d =>
    d.toLowerCase().includes('job description')
  );
  if (!hasJobDescription && tips.filter(t => t.type === 'warning').length === 0) {
    tips.push(createTip(
      'suggestion',
      'Keywords',
      '💡 Upload a job description to get targeted keyword recommendations and improve your match rate.',
      3
    ));
  }

  return tips;
}

export default CvAiCoach;
