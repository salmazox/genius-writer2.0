/**
 * Version History Panel Component
 *
 * Displays CV version history, comparisons, and improvement tracking
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  Trash2,
  Download,
  Upload,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  RotateCcw,
  X
} from 'lucide-react';
import {
  getAllVersions,
  getVersionStats,
  deleteVersion,
  updateVersionMetadata,
  compareVersions,
  exportVersionHistory,
  importVersionHistory,
  type CVVersion,
  type VersionStats
} from '../../services/versionHistory';
import { CVData } from '../../types';
import SuccessMetricsTracker from './SuccessMetricsTracker';

// ============================================================================
// INTERFACES
// ============================================================================

interface VersionHistoryPanelProps {
  onRestoreVersion?: (cvData: CVData) => void;
  onClose?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  onRestoreVersion,
  onClose,
  className = ''
}) => {
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [stats, setStats] = useState<VersionStats | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<CVVersion | null>(null);
  const [compareWithVersion, setCompareWithVersion] = useState<CVVersion | null>(null);

  // Load versions on mount and when changes occur
  const loadVersions = () => {
    const loaded = getAllVersions();
    setVersions(loaded);
    setStats(getVersionStats());
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleDeleteVersion = (versionId: string) => {
    if (confirm('Are you sure you want to delete this version?')) {
      deleteVersion(versionId);
      loadVersions();
    }
  };

  const handleRestoreVersion = (version: CVVersion) => {
    if (confirm(`Restore CV to "${version.metadata.name}"?`)) {
      onRestoreVersion?.(version.cvData);
      onClose?.();
    }
  };

  const handleExport = () => {
    const json = exportVersionHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-version-history-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target?.result as string;
      if (importVersionHistory(jsonString)) {
        loadVersions();
        alert('Version history imported successfully!');
      } else {
        alert('Failed to import version history. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-slate-950 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <History size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Version History
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Track improvements and compare versions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export/Import */}
          <button
            onClick={handleExport}
            disabled={versions.length === 0}
            className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Export history"
          >
            <Download size={16} className="text-slate-600 dark:text-slate-400" />
          </button>

          <label className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Upload size={16} className="text-slate-600 dark:text-slate-400" />
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X size={16} className="text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {versions.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <History size={40} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No Version History Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Versions will be saved automatically as you work.<br />
                You can also manually save important versions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Total Versions</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVersions}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Avg Score</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageScore}%</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    {stats.scoreImprovement >= 0 ? (
                      <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Improvement</span>
                  </div>
                  <p className={`text-2xl font-bold ${stats.scoreImprovement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.scoreImprovement > 0 ? '+' : ''}{stats.scoreImprovement}%
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Best Score</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.bestVersion?.atsScore?.overall || 0}%
                  </p>
                </div>
              </div>
            )}

            {/* Version List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                All Versions ({versions.length})
              </h4>

              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow ${
                    selectedVersion?.id === version.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-bold text-slate-900 dark:text-white">
                          {version.metadata.name}
                        </h5>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-bold">
                            Latest
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(version.timestamp)}
                        </span>

                        {version.atsScore && (
                          <span className={`flex items-center gap-1 font-bold ${getScoreColor(version.atsScore.overall)}`}>
                            <BarChart3 size={12} />
                            {version.atsScore.overall}% ATS
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {version.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {version.metadata.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded text-xs flex items-center gap-1"
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score Indicator */}
                    {version.atsScore && (
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(version.atsScore.overall)}`}>
                          {version.atsScore.overall}
                        </div>
                        <div className="text-xs text-slate-500">{version.atsScore.grade}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleRestoreVersion(version)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>

                    <button
                      onClick={() => setSelectedVersion(selectedVersion?.id === version.id ? null : version)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} />
                      {selectedVersion?.id === version.id ? 'Hide' : 'View'} Details
                    </button>

                    {versions.length > 1 && (
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        className="ml-auto p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                        title="Delete version"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedVersion?.id === version.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
                      {/* Score Breakdown */}
                      {version.atsScore && (
                        <div className="space-y-2">
                          <h6 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Score Breakdown</h6>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(version.atsScore.criteria).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <span className="capitalize">{key}</span>
                                <span className={`font-bold ${value.passed ? 'text-green-600' : 'text-red-600'}`}>
                                  {value.score}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Success Metrics Tracker */}
                      <SuccessMetricsTracker
                        version={version}
                        onUpdate={loadVersions}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryPanel;
