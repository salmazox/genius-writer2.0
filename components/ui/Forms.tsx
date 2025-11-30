
import React, { useId, useState, useEffect } from 'react';
import { ChevronRight, Plus, Trash2, Calculator } from 'lucide-react';
import { ToolInput } from '../../types';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', containerClassName = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide">{label}</label>}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 text-sm transition-all text-slate-900 dark:text-white placeholder-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', containerClassName = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide">{label}</label>}
      <textarea
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 text-sm transition-all resize-y text-slate-900 dark:text-white placeholder-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', containerClassName = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide">{label}</label>}
      <div className="relative">
        <select
          id={inputId}
          className={`w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 pr-8 text-sm transition-all text-slate-900 dark:text-white ${className}`}
          {...props}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronRight className="absolute right-3 top-3.5 text-slate-400 rotate-90 pointer-events-none" size={16} />
      </div>
    </div>
  );
};

// --- Repeater Component for Dynamic Lists (Calculator style) ---

interface RepeaterProps {
  label: string;
  fields: ToolInput[];
  value: any[];
  onChange: (value: any[]) => void;
}

export const Repeater: React.FC<RepeaterProps> = ({ label, fields, value = [], onChange }) => {
  const [total, setTotal] = useState(0);

  // Calculate total whenever value changes
  useEffect(() => {
    const newTotal = value.reduce((acc, item) => {
      // Assuming fields might include 'price', 'amount', 'unitPrice', 'quantity'
      const price = parseFloat(item.price || item.unitPrice || item.amount || '0');
      const qty = parseFloat(item.quantity || '1');
      return acc + (isNaN(price) ? 0 : price * (isNaN(qty) ? 1 : qty));
    }, 0);
    setTotal(newTotal);
  }, [value]);

  const handleAdd = () => {
    const newItem: any = { id: Date.now() };
    fields.forEach(f => newItem[f.name] = '');
    onChange([...value, newItem]);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleChange = (index: number, fieldName: string, val: string) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [fieldName]: val };
    onChange(newValue);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{label}</label>
        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
           <Calculator size={12} /> Total: {total.toFixed(2)}
        </div>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={item.id || index} className="flex gap-2 items-start group">
            <div className="grid grid-cols-12 gap-2 flex-1">
              {fields.map((field) => {
                // Determine width based on field type/name heuristic
                let colSpan = "col-span-12";
                if (field.name.toLowerCase().includes('desc')) colSpan = "col-span-6";
                else if (field.name.toLowerCase().includes('quantity') || field.name === 'qty') colSpan = "col-span-2";
                else if (field.name.toLowerCase().includes('price') || field.name.toLowerCase().includes('amount')) colSpan = "col-span-4";
                
                return (
                  <div key={field.name} className={colSpan}>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      placeholder={field.label}
                      value={item[field.name] || ''}
                      onChange={(e) => handleChange(index, field.name, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => handleRemove(index)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-0.5"
              title="Remove item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleAdd}
        className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
};
