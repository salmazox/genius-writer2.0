import React from 'react';

interface WatermarkProps {
  className?: string;
}

export const Watermark: React.FC<WatermarkProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-[0.06] select-none ${className}`}>
      <div className="transform -rotate-45 space-y-24">
         {Array.from({ length: 10 }).map((_, i) => (
             <div key={i} className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                 GENIUS WRITER FREE • PREVIEW ONLY • UPGRADE TO EXPORT
             </div>
         ))}
      </div>
    </div>
  );
};