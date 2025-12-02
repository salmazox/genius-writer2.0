/**
 * Template Selector Component
 *
 * Visual template chooser with live previews
 * Allows users to switch between CV design templates
 */

import React from 'react';
import { FileText, Check, Sparkles } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

export type CVTemplate = 'modern' | 'classic' | 'minimal' | 'professional' | 'creative';

interface TemplateOption {
  id: CVTemplate;
  name: string;
  description: string;
  preview: string; // SVG or illustration
  tags: string[];
  popular?: boolean;
  new?: boolean;
}

interface TemplateSelectorProps {
  currentTemplate: CVTemplate;
  onSelectTemplate: (template: CVTemplate) => void;
  className?: string;
}

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

const TEMPLATES: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Sidebar layout with accent colors. Perfect for tech and creative roles.',
    tags: ['Sidebar', 'Colorful', 'Photo'],
    popular: true,
    preview: `
      <svg viewBox="0 0 210 297" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <!-- Sidebar -->
        <rect width="67" height="297" fill="#4F46E5"/>
        <!-- Profile Photo -->
        <circle cx="33.5" cy="30" r="15" fill="#E0E7FF"/>
        <!-- Sidebar Lines -->
        <rect x="10" y="60" width="47" height="3" rx="1.5" fill="#E0E7FF" opacity="0.8"/>
        <rect x="10" y="68" width="35" height="2" rx="1" fill="#E0E7FF" opacity="0.6"/>
        <rect x="10" y="74" width="40" height="2" rx="1" fill="#E0E7FF" opacity="0.6"/>
        <!-- Skills -->
        <rect x="10" y="90" width="47" height="3" rx="1.5" fill="#E0E7FF" opacity="0.8"/>
        <rect x="10" y="98" width="20" height="6" rx="3" fill="#E0E7FF" opacity="0.5"/>
        <rect x="32" y="98" width="18" height="6" rx="3" fill="#E0E7FF" opacity="0.5"/>
        <!-- Main Content Header -->
        <rect x="80" y="20" width="110" height="8" rx="2" fill="#1E293B"/>
        <rect x="80" y="32" width="70" height="4" rx="2" fill="#94A3B8"/>
        <!-- Content Lines -->
        <rect x="80" y="50" width="50" height="3" rx="1.5" fill="#4F46E5" opacity="0.7"/>
        <rect x="80" y="60" width="110" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="80" y="66" width="105" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="80" y="72" width="100" height="2" rx="1" fill="#CBD5E1"/>
      </svg>
    `
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif design with centered header. Timeless and professional.',
    tags: ['Centered', 'Serif', 'Traditional'],
    preview: `
      <svg viewBox="0 0 210 297" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="#FDFBF7"/>
        <!-- Top Border -->
        <rect width="210" height="3" fill="#4F46E5"/>
        <!-- Centered Header -->
        <rect x="60" y="30" width="90" height="7" rx="2" fill="#1E293B"/>
        <rect x="75" y="42" width="60" height="4" rx="2" fill="#64748B"/>
        <!-- Contact Info -->
        <rect x="50" y="54" width="30" height="2" rx="1" fill="#94A3B8"/>
        <rect x="85" y="54" width="25" height="2" rx="1" fill="#94A3B8"/>
        <rect x="115" y="54" width="35" height="2" rx="1" fill="#94A3B8"/>
        <!-- Border -->
        <rect x="20" y="66" width="170" height="2" fill="#E2E8F0"/>
        <!-- Section Title -->
        <rect x="20" y="80" width="40" height="3" rx="1.5" fill="#1E293B"/>
        <rect x="20" y="88" width="2" height="2" fill="#94A3B8"/>
        <!-- Content -->
        <rect x="20" y="96" width="140" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="102" width="135" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="108" width="130" height="2" rx="1" fill="#CBD5E1"/>
      </svg>
    `
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean two-column layout with ample white space. Modern and elegant.',
    tags: ['Two-Column', 'Clean', 'Spacious'],
    popular: true,
    preview: `
      <svg viewBox="0 0 210 297" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <!-- Header -->
        <rect x="20" y="20" width="120" height="10" rx="2" fill="#1E293B"/>
        <rect x="20" y="36" width="70" height="4" rx="2" fill="#CBD5E1"/>
        <!-- Contact Right -->
        <rect x="155" y="24" width="35" height="2" rx="1" fill="#94A3B8"/>
        <rect x="155" y="30" width="30" height="2" rx="1" fill="#94A3B8"/>
        <rect x="155" y="36" width="32" height="2" rx="1" fill="#94A3B8"/>
        <!-- Left Column -->
        <rect x="20" y="60" width="115" height="3" rx="1.5" fill="#CBD5E1"/>
        <circle cx="21.5" cy="74" r="1.5" fill="#CBD5E1"/>
        <rect x="20" y="72" width="2" height="60" fill="#E2E8F0"/>
        <rect x="28" y="72" width="100" height="2" rx="1" fill="#64748B"/>
        <rect x="28" y="78" width="105" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="28" y="84" width="100" height="2" rx="1" fill="#CBD5E1"/>
        <!-- Right Column -->
        <rect x="155" y="60" width="40" height="3" rx="1.5" fill="#CBD5E1"/>
        <rect x="155" y="70" width="35" height="2" rx="1" fill="#94A3B8"/>
        <rect x="155" y="76" width="32" height="2" rx="1" fill="#94A3B8"/>
        <rect x="155" y="82" width="38" height="2" rx="1" fill="#94A3B8"/>
      </svg>
    `
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate style with strong visual hierarchy. Ideal for executive positions.',
    tags: ['Corporate', 'Executive', 'Bold'],
    new: true,
    preview: `
      <svg viewBox="0 0 210 297" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <!-- Header Bar -->
        <rect width="210" height="50" fill="#1E293B"/>
        <rect x="20" y="15" width="100" height="7" rx="2" fill="white"/>
        <rect x="20" y="26" width="60" height="4" rx="2" fill="#94A3B8"/>
        <rect x="160" y="18" width="30" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="160" y="24" width="28" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="160" y="30" width="32" height="2" rx="1" fill="#CBD5E1"/>
        <!-- Content -->
        <rect x="20" y="70" width="50" height="4" rx="2" fill="#4F46E5"/>
        <rect x="20" y="80" width="80" height="3" rx="1.5" fill="#1E293B"/>
        <rect x="150" y="80" width="40" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="90" width="170" height="2" rx="1" fill="#E2E8F0"/>
        <rect x="20" y="98" width="165" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="104" width="160" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="110" width="155" height="2" rx="1" fill="#CBD5E1"/>
      </svg>
    `
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and unique design with asymmetric layout. Stand out from the crowd.',
    tags: ['Unique', 'Asymmetric', 'Bold'],
    new: true,
    preview: `
      <svg viewBox="0 0 210 297" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <!-- Diagonal Accent -->
        <path d="M0 0L210 60V0H0Z" fill="#4F46E5" opacity="0.1"/>
        <path d="M0 0L210 50V0H0Z" fill="#4F46E5" opacity="0.15"/>
        <!-- Name (Angled) -->
        <rect x="15" y="25" width="90" height="8" rx="2" fill="#1E293B" transform="rotate(-3 15 25)"/>
        <rect x="18" y="38" width="55" height="4" rx="2" fill="#4F46E5" opacity="0.7" transform="rotate(-2 18 38)"/>
        <!-- Side Accent Bar -->
        <rect x="190" y="70" width="5" height="150" rx="2.5" fill="#4F46E5" opacity="0.3"/>
        <!-- Content Blocks -->
        <rect x="20" y="70" width="45" height="3" rx="1.5" fill="#4F46E5"/>
        <rect x="20" y="80" width="150" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="86" width="145" height="2" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="92" width="140" height="2" rx="1" fill="#CBD5E1"/>
        <!-- Photo Circle (Offset) -->
        <circle cx="175" cy="40" r="12" fill="#E0E7FF"/>
        <circle cx="175" cy="40" r="10" fill="#4F46E5" opacity="0.2"/>
      </svg>
    `
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onSelectTemplate,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
            Choose Template
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Select a design that matches your industry and style
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`group relative bg-white dark:bg-slate-900 rounded-xl border-2 transition-all duration-200 overflow-hidden hover:shadow-lg ${
              currentTemplate === template.id
                ? 'border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            {/* Preview */}
            <div className="aspect-[210/297] bg-slate-50 dark:bg-slate-800/50 p-4 relative overflow-hidden">
              <div
                className="w-full h-full transition-transform duration-200 group-hover:scale-105"
                dangerouslySetInnerHTML={{ __html: template.preview }}
              />

              {/* Selection Indicator */}
              {currentTemplate === template.id && (
                <div className="absolute top-2 right-2 p-1.5 bg-indigo-600 rounded-full shadow-lg">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1.5">
                {template.popular && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-[10px] font-bold rounded-full uppercase tracking-wide">
                    Popular
                  </span>
                )}
                {template.new && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold rounded-full uppercase tracking-wide flex items-center gap-0.5">
                    <Sparkles size={10} />
                    New
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {template.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Hover Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
              currentTemplate === template.id ? 'opacity-100' : ''
            }`} />
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> You can switch templates anytime. Your content will automatically adapt to the new design.
        </p>
      </div>
    </div>
  );
};

export default TemplateSelector;
