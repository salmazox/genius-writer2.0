
import React from 'react';
import { Target, X, AlertTriangle, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ATSAnalysis } from '../../types';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';
import { Skeleton } from '../../components/ui/Skeleton';

interface CvAtsSidebarProps {
    show: boolean;
    onClose: () => void;
    atsAnalysis: ATSAnalysis | null;
    jobDescription: string;
    setJobDescription: (val: string) => void;
    runAtsAnalysis: () => void;
    isLoading: boolean;
    handleApplyKeywords: () => void;
    handleApplySummary: () => void;
    clearAnalysis: () => void;
}

const CvAtsSidebar: React.FC<CvAtsSidebarProps> = ({ 
    show, onClose, atsAnalysis, jobDescription, setJobDescription, 
    runAtsAnalysis, isLoading, handleApplyKeywords, handleApplySummary, clearAnalysis 
}) => {
    const { t } = useThemeLanguage();
    
    if (!show) return null;

    return (
        <div className="absolute inset-0 lg:relative lg:w-[350px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right z-40 shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Target className="text-indigo-600" size={16}/> {t('dashboard.atsOptimizer')}</h2>
                <button onClick={onClose}><X size={16} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton height={100} className="rounded-full mx-auto w-24 h-24" variant="circular" />
                        <Skeleton height={20} width="80%" className="mx-auto" />
                        <Skeleton height={60} />
                        <Skeleton height={60} />
                    </div>
                ) : !atsAnalysis ? (
                    <div className="flex flex-col h-full">
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">Paste the Job Description below.</p>
                        <textarea className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 resize-none mb-4 focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Paste Job Description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                        <Button onClick={runAtsAnalysis} isLoading={isLoading} disabled={!jobDescription}>Analyze Match</Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-center mb-2"><div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${atsAnalysis.score >= 80 ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}><span className="text-3xl font-bold">{atsAnalysis.score}%</span></div></div>
                            <div className="flex justify-center gap-4 mt-3">
                                <Button size="sm" variant="secondary" onClick={runAtsAnalysis} icon={RotateCcw}>Rescan</Button>
                                <button onClick={clearAnalysis} className="text-xs text-slate-500 underline">Clear</button>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2 text-sm"><AlertTriangle size={14}/> Missing Keywords</h4>
                            <div className="flex flex-wrap gap-2 mb-3">{atsAnalysis.missingKeywords.map(kw => <span key={kw} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-xs border border-red-100">{kw}</span>)}</div>
                            {atsAnalysis.missingKeywords.length > 0 && <Button size="sm" variant="secondary" onClick={handleApplyKeywords} className="w-full">Add Missing Keywords</Button>}
                        </div>
                        {atsAnalysis.improvedSummary && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100">
                                <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2 text-sm"><Sparkles size={14}/> AI Suggestion</h4>
                                <p className="text-xs text-slate-600 italic mb-3">"{atsAnalysis.improvedSummary}"</p>
                                <Button size="sm" onClick={handleApplySummary} className="w-full" icon={Wand2}>Apply Summary</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CvAtsSidebar;
