/**
 * Memoized list item components for CV Builder
 * These components prevent unnecessary re-renders when parent state changes
 */

import React, { memo } from 'react';
import { ChevronUp, ChevronDown, XCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { CVExperience, CVEducation } from '../../types';
import { Input } from '../../components/ui/Forms';
import RichTextEditor from '../../components/RichTextEditor';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

// ============================================================================
// Experience Item
// ============================================================================

interface ExperienceItemProps {
  experience: CVExperience;
  index: number;
  totalItems: number;
  isLoading: boolean;
  onUpdate: (id: string, field: keyof CVExperience, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onGenerateDescription: (id: string, item: CVExperience) => void;
}

export const ExperienceItem = memo<ExperienceItemProps>(({
  experience,
  index,
  totalItems,
  isLoading,
  onUpdate,
  onRemove,
  onMove,
  onGenerateDescription,
}) => {
  const { t } = useThemeLanguage();

  return (
    <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative group">
      <div className="absolute right-0 top-0 flex gap-1 z-10">
        <button
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30"
          aria-label="Move position up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => onMove(index, 'down')}
          disabled={index === totalItems - 1}
          className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30"
          aria-label="Move position down"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={() => onRemove(experience.id)}
          className="p-1 text-slate-300 hover:text-red-500 ml-2"
          aria-label="Remove position"
        >
          <XCircle size={16} />
        </button>
      </div>
      <div className="space-y-3 pt-6">
        <Input
          placeholder={t('dashboard.cv.jobTitle')}
          value={experience.title}
          onChange={(e) => onUpdate(experience.id, 'title', e.target.value)}
          className="font-semibold"
          aria-label="Job Title"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder={t('dashboard.cv.company')}
            value={experience.company}
            onChange={(e) => onUpdate(experience.id, 'company', e.target.value)}
            aria-label="Company"
          />
          <Input
            placeholder={t('dashboard.cv.location')}
            value={experience.location}
            onChange={(e) => onUpdate(experience.id, 'location', e.target.value)}
            aria-label="Location"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder={t('dashboard.cv.startDate')}
            value={experience.startDate}
            onChange={(e) => onUpdate(experience.id, 'startDate', e.target.value)}
            aria-label="Start Date"
          />
          <Input
            placeholder={t('dashboard.cv.endDate')}
            value={experience.endDate}
            onChange={(e) => onUpdate(experience.id, 'endDate', e.target.value)}
            aria-label="End Date"
          />
        </div>
        <div className="relative">
          <RichTextEditor
            value={experience.description}
            onChange={(val) => onUpdate(experience.id, 'description', val)}
          />
          <button
            onClick={() => onGenerateDescription(experience.id, experience)}
            className="absolute bottom-2 right-2 p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors z-10"
            aria-label="Generate description with AI"
          >
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.experience.id === nextProps.experience.id &&
    prevProps.experience.title === nextProps.experience.title &&
    prevProps.experience.company === nextProps.experience.company &&
    prevProps.experience.location === nextProps.experience.location &&
    prevProps.experience.startDate === nextProps.experience.startDate &&
    prevProps.experience.endDate === nextProps.experience.endDate &&
    prevProps.experience.description === nextProps.experience.description &&
    prevProps.index === nextProps.index &&
    prevProps.totalItems === nextProps.totalItems &&
    prevProps.isLoading === nextProps.isLoading
  );
});

ExperienceItem.displayName = 'ExperienceItem';

// ============================================================================
// Education Item
// ============================================================================

interface EducationItemProps {
  education: CVEducation;
  index: number;
  totalItems: number;
  onUpdate: (id: string, field: keyof CVEducation, value: string) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

export const EducationItem = memo<EducationItemProps>(({
  education,
  index,
  totalItems,
  onUpdate,
  onRemove,
  onMove,
}) => {
  const { t } = useThemeLanguage();

  return (
    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative">
      <div className="absolute right-0 top-0 flex gap-1 z-10">
        <button
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30"
          aria-label="Move education up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => onMove(index, 'down')}
          disabled={index === totalItems - 1}
          className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30"
          aria-label="Move education down"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={() => onRemove(education.id)}
          className="p-1 text-slate-300 hover:text-red-500 ml-2"
          aria-label="Remove education"
        >
          <XCircle size={16} />
        </button>
      </div>
      <div className="pt-6">
        <Input
          placeholder={t('dashboard.cv.degree')}
          value={education.degree}
          onChange={(e) => onUpdate(education.id, 'degree', e.target.value)}
          className="mb-2"
          aria-label="Degree"
        />
        <Input
          placeholder={t('dashboard.cv.school')}
          value={education.school}
          onChange={(e) => onUpdate(education.id, 'school', e.target.value)}
          className="mb-2"
          aria-label="School"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder={t('dashboard.cv.location')}
            value={education.location}
            onChange={(e) => onUpdate(education.id, 'location', e.target.value)}
            aria-label="Location"
          />
          <Input
            placeholder={t('dashboard.cv.year')}
            value={education.year}
            onChange={(e) => onUpdate(education.id, 'year', e.target.value)}
            aria-label="Year"
          />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.education.id === nextProps.education.id &&
    prevProps.education.degree === nextProps.education.degree &&
    prevProps.education.school === nextProps.education.school &&
    prevProps.education.location === nextProps.education.location &&
    prevProps.education.year === nextProps.education.year &&
    prevProps.index === nextProps.index &&
    prevProps.totalItems === nextProps.totalItems
  );
});

EducationItem.displayName = 'EducationItem';

// ============================================================================
// Skill Tag
// ============================================================================

interface SkillTagProps {
  skill: string;
  onRemove: (skill: string) => void;
}

export const SkillTag = memo<SkillTagProps>(({ skill, onRemove }) => {
  return (
    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 group cursor-default">
      {skill}
      <button
        onClick={() => onRemove(skill)}
        className="text-slate-400 group-hover:text-red-500"
        aria-label={`Remove ${skill}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}, (prevProps, nextProps) => {
  return prevProps.skill === nextProps.skill;
});

SkillTag.displayName = 'SkillTag';
