/**
 * Plagiarism Panel Component
 *
 * Displays originality check results with score, flagged phrases,
 * and improvement suggestions.
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader, Info } from 'lucide-react';
import {
  PlagiarismResult,
  checkPlagiarism,
  getScoreColor,
  getScoreBgColor,
  getSeverityColor
} from '../services/plagiarismChecker';
import { ToolType } from '../types';
import { Button } from './ui/Button';

interface PlagiarismPanelProps {
  content: string;
  toolType?: ToolType;
  onResultChange?: (result: PlagiarismResult | null) => void;
}

export const PlagiarismPanel: React.FC<PlagiarismPanelProps> = ({
  content,
  toolType = ToolType.SMART_EDITOR,
  onResultChange
}) => {
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!content || content.trim().length === 0) {
      setError('Please write some content first');
      return;
    }

    if (content.trim().length < 50) {
      setError('Content is too short to check (minimum 50 characters)');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const plagiarismResult = await checkPlagiarism(content, { toolType });
      setResult(plagiarismResult);
      onResultChange?.(plagiarismResult);
    } catch (err) {
      setError('Failed to check originality. Please try again.');
      console.error('Plagiarism check error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Very Poor';
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 90) return 'Your content is highly original';
    if (score >= 70) return 'Mostly original with minor issues';
    if (score >= 50) return 'Contains some generic phrases';
    if (score >= 30) return 'Significant originality concerns';
    return 'Content may be copied or highly generic';
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold flex items-center gap-2 text-slate-800">
          <Shield size={18} className="text-indigo-600" />
          Originality Check
        </h4>
        {result && (
          <button
            onClick={() => {
              setResult(null);
              onResultChange?.(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Info Box */}
      {!result && !isChecking && (
        <>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-2">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Check your content for originality. Our AI will identify common phrases,
              clichés, and generic expressions that reduce uniqueness.
            </span>
          </div>
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Important Limitation:</p>
              <p>
                This is NOT a true plagiarism detector. It uses AI pattern analysis and cannot
                access external sources to verify if content is copied. For professional plagiarism
                detection, use dedicated services like Copyscape or Turnitin.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Check Button */}
      {!result && (
        <Button
          onClick={handleCheck}
          disabled={isChecking || !content || content.trim().length < 50}
          className="w-full"
          size="sm"
        >
          {isChecking ? (
            <>
              <Loader size={14} className="animate-spin mr-2" />
              Checking Originality...
            </>
          ) : (
            <>
              <Shield size={14} className="mr-2" />
              Check Originality
            </>
          )}
        </Button>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Score Circle */}
          <div className={`p-4 rounded-lg border ${getScoreBgColor(result.score)}`}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className={`w-20 h-20 rounded-full border-4 ${
                  result.score >= 90 ? 'border-green-500' :
                  result.score >= 70 ? 'border-lime-500' :
                  result.score >= 50 ? 'border-yellow-500' :
                  result.score >= 30 ? 'border-orange-500' :
                  'border-red-500'
                } bg-white flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.score >= 70 ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-orange-600" />
                  )}
                  <span className="font-bold text-slate-800">
                    {getScoreLabel(result.score)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  {getScoreDescription(result.score)}
                </p>
                <div className="text-xs text-slate-500">
                  Status: <span className="font-semibold">{result.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-slate-600">Unique Content</div>
              <div className="font-bold text-slate-800">
                {result.analysis.uniqueContentPercentage}%
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-slate-600">Common Phrases</div>
              <div className="font-bold text-slate-800">
                {result.analysis.commonPhrasesCount}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-slate-600">Overused Expressions</div>
              <div className="font-bold text-slate-800">
                {result.analysis.overusedExpressionsCount}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-slate-600">Clichés</div>
              <div className="font-bold text-slate-800">
                {result.analysis.clicheCount}
              </div>
            </div>
          </div>

          {/* Flagged Phrases */}
          {result.flaggedPhrases.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} />
                Flagged Phrases ({result.flaggedPhrases.length})
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.flaggedPhrases.map((fp, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-xs ${getSeverityColor(fp.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold">"{fp.phrase}"</span>
                      <span className="text-[10px] uppercase font-bold">
                        {fp.severity}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90">{fp.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-800 mb-2">
                💡 Suggestions for Improvement
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Check Again Button */}
          <Button
            onClick={handleCheck}
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader size={14} className="animate-spin mr-2" />
                Re-checking...
              </>
            ) : (
              'Check Again'
            )}
          </Button>
        </div>
      )}

      {/* Last Checked Timestamp */}
      {result && (
        <div className="mt-3 pt-3 border-t text-[10px] text-slate-400 text-center">
          Last checked: {new Date(result.checkedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PlagiarismPanel;
