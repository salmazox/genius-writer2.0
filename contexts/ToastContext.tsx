
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
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
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
