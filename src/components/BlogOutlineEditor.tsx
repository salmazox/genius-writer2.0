/**
 * Blog Outline Editor Component
 *
 * Interactive editor for blog outlines with drag-and-drop reordering,
 * inline editing, and validation feedback.
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Hash,
  List
} from 'lucide-react';
import {
  BlogOutline,
  BlogSection,
  validateOutline,
  getOutlineStats
} from '../services/blogOutlineGenerator';
import { Button } from './ui/Button';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface BlogOutlineEditorProps {
  outline: BlogOutline;
  onChange: (outline: BlogOutline) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const BlogOutlineEditor: React.FC<BlogOutlineEditorProps> = ({
  outline,
  onChange,
  onGenerate,
  isGenerating = false
}) => {
  const { t } = useThemeLanguage();
  const [validation, setValidation] = useState(validateOutline(outline));
  const stats = getOutlineStats(outline);

  useEffect(() => {
    setValidation(validateOutline(outline));
  }, [outline]);

  const updateTitle = (title: string) => {
    onChange({ ...outline, title });
  };

  const updateMetaDescription = (metaDescription: string) => {
    onChange({ ...outline, metaDescription });
  };

  const updateIntroduction = (introduction: string) => {
    onChange({ ...outline, introduction });
  };

  const updateConclusion = (conclusion: string) => {
    onChange({ ...outline, conclusion });
  };

  const addSection = () => {
    const newSection: BlogSection = {
      id: `section_${Date.now()}`,
      heading: '',
      subheadings: [],
      keyPoints: [],
      estimatedWords: 250
    };
    onChange({ ...outline, sections: [...outline.sections, newSection] });
  };

  const updateSection = (index: number, updates: Partial<BlogSection>) => {
    const newSections = [...outline.sections];
    newSections[index] = { ...newSections[index], ...updates };
    onChange({ ...outline, sections: newSections });
  };

  const deleteSection = (index: number) => {
    const newSections = outline.sections.filter((_, i) => i !== index);
    onChange({ ...outline, sections: newSections });
  };

  const addSubheading = (sectionIndex: number) => {
    const section = outline.sections[sectionIndex];
    updateSection(sectionIndex, {
      subheadings: [...section.subheadings, '']
    });
  };

  const updateSubheading = (sectionIndex: number, subIndex: number, value: string) => {
    const section = outline.sections[sectionIndex];
    const newSubheadings = [...section.subheadings];
    newSubheadings[subIndex] = value;
    updateSection(sectionIndex, { subheadings: newSubheadings });
  };

  const deleteSubheading = (sectionIndex: number, subIndex: number) => {
    const section = outline.sections[sectionIndex];
    const newSubheadings = section.subheadings.filter((_, i) => i !== subIndex);
    updateSection(sectionIndex, { subheadings: newSubheadings });
  };

  const addKeyPoint = (sectionIndex: number) => {
    const section = outline.sections[sectionIndex];
    updateSection(sectionIndex, {
      keyPoints: [...section.keyPoints, '']
    });
  };

  const updateKeyPoint = (sectionIndex: number, pointIndex: number, value: string) => {
    const section = outline.sections[sectionIndex];
    const newKeyPoints = [...section.keyPoints];
    newKeyPoints[pointIndex] = value;
    updateSection(sectionIndex, { keyPoints: newKeyPoints });
  };

  const deleteKeyPoint = (sectionIndex: number, pointIndex: number) => {
    const section = outline.sections[sectionIndex];
    const newKeyPoints = section.keyPoints.filter((_, i) => i !== pointIndex);
    updateSection(sectionIndex, { keyPoints: newKeyPoints });
  };

  return (
    <div className="space-y-6">
      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, idx) => (
            <div
              key={`error-${idx}`}
              className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-800"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, idx) => (
            <div
              key={`warning-${idx}`}
              className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <List size={12} className="text-slate-500 md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-xs font-semibold text-slate-600">Sections</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900">{stats.totalSections}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Hash size={12} className="text-slate-500 md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-xs font-semibold text-slate-600">Subheadings</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900">{stats.totalSubheadings}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText size={12} className="text-slate-500 md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-xs font-semibold text-slate-600">Words</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900">~{stats.estimatedWords}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-slate-500 md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-xs font-semibold text-slate-600">Read Time</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.estimatedReadTime}m</div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Blog Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={outline.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Enter SEO-optimized blog title..."
          className="w-full text-lg font-semibold border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          {outline.title.length}/60 characters {outline.title.length > 60 && '⚠️ Too long for SEO'}
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Meta Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={outline.metaDescription}
          onChange={(e) => updateMetaDescription(e.target.value)}
          placeholder="Write a compelling meta description..."
          className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={2}
        />
        <p className="text-xs text-slate-500 mt-1">
          {outline.metaDescription.length}/160 characters
          {outline.metaDescription.length < 120 && ' (recommend 120-160)'}
        </p>
      </div>

      {/* Introduction */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Introduction</label>
        <textarea
          value={outline.introduction}
          onChange={(e) => updateIntroduction(e.target.value)}
          placeholder="Brief introduction about what the blog will cover..."
          className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-700">Sections</label>
          <Button size="sm" onClick={addSection} variant="secondary">
            <Plus size={14} className="mr-1" /> Add Section
          </Button>
        </div>

        <div className="space-y-4">
          {outline.sections.map((section, sectionIdx) => (
            <div key={section.id} className="p-4 border border-slate-200 rounded-lg bg-white">
              {/* Section Header */}
              <div className="flex items-start gap-3 mb-3">
                <button className="p-1 text-slate-400 hover:text-slate-600 cursor-grab mt-1">
                  <GripVertical size={18} />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => updateSection(sectionIdx, { heading: e.target.value })}
                    placeholder="Section heading (H2)..."
                    className="w-full text-base font-bold border-b border-slate-300 px-2 py-1 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => deleteSection(sectionIdx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Delete section"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Subheadings */}
              <div className="ml-6 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Subheadings (H3)</label>
                  <button
                    onClick={() => addSubheading(sectionIdx)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    + Add Subheading
                  </button>
                </div>
                <div className="space-y-2">
                  {section.subheadings.map((subheading, subIdx) => (
                    <div key={subIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={subheading}
                        onChange={(e) => updateSubheading(sectionIdx, subIdx, e.target.value)}
                        placeholder="Subheading..."
                        className="flex-1 text-sm border border-slate-200 rounded px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => deleteSubheading(sectionIdx, subIdx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points */}
              <div className="ml-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Key Points</label>
                  <button
                    onClick={() => addKeyPoint(sectionIdx)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    + Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {section.keyPoints.map((point, pointIdx) => (
                    <div key={pointIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 text-sm mt-1.5">•</span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => updateKeyPoint(sectionIdx, pointIdx, e.target.value)}
                        placeholder="Key point to cover..."
                        className="flex-1 text-sm border border-slate-200 rounded px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => deleteKeyPoint(sectionIdx, pointIdx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Conclusion</label>
        <textarea
          value={outline.conclusion}
          onChange={(e) => updateConclusion(e.target.value)}
          placeholder="Summary and call-to-action..."
          className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {validation.isValid ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle size={16} />
              <span>Outline is valid</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{validation.errors.length} error(s) to fix</span>
            </div>
          )}
        </div>
        <Button
          onClick={onGenerate}
          disabled={!validation.isValid || isGenerating}
          isLoading={isGenerating}
          size="lg"
        >
          {isGenerating ? 'Generating Blog...' : 'Generate Full Blog'}
        </Button>
      </div>
    </div>
  );
};

export default BlogOutlineEditor;
