import React from 'react';
import { ChevronRight } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', containerClassName = '', ...props }) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide">{label}</label>}
    <input
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 text-sm transition-all text-slate-900 dark:text-white placeholder-slate-400 ${className}`}
      {...props}
    />
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', containerClassName = '', ...props }) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide">{label}</label>}
    <textarea
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 text-sm transition-all resize-y text-slate-900 dark:text-white placeholder-slate-400 ${className}`}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', containerClassName = '', ...props }) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide">{label}</label>}
    <div className="relative">
      <select
        className={`w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 pr-8 text-sm transition-all text-slate-900 dark:text-white ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronRight className="absolute right-3 top-3.5 text-slate-400 rotate-90 pointer-events-none" size={16} />
    </div>
  </div>
);