
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', action?: ToastAction) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type, action }]);
    
    // Auto remove after 4 seconds if no action, or 8 seconds if action exists (to give time to click)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, action ? 8000 : 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 ${
              toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-green-500 text-slate-900 dark:text-white' :
              toast.type === 'error' ? 'bg-white dark:bg-slate-900 border-red-500 text-slate-900 dark:text-white' :
              'bg-white dark:bg-slate-900 border-indigo-500 text-slate-900 dark:text-white'
            }`}
            style={{ 
                animation: `slideIn 0.3s ease-out forwards`,
                transform: `scale(${1 - index * 0.05}) translateY(-${index * 10}px)`,
                zIndex: 100 - index,
                opacity: 1 - index * 0.2
            }}
          >
            {toast.type === 'success' && <CheckCircle size={20} className="text-green-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="text-indigo-500 shrink-0" />}
            
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>

            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
                className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                {toast.action.label}
              </button>
            )}

            <button 
                onClick={() => removeToast(toast.id)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded p-1"
                aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
