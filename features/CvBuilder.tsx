
import React, { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, Palette, Trophy, Download, Target, Eye, Edit3, Save, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { generateContent, analyzeATS } from '../services/gemini';
import { ToolType, CVData, CVTheme, ATSAnalysis, CVExperience } from '../types';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useSwipe } from '../hooks/useSwipe';

// Sub-components
import CvEditor from './cv/CvEditor';
import CvPreview from './cv/CvPreview';
import CvAtsSidebar from './cv/CvAtsSidebar';

// Professional Color Themes
const CV_THEMES: CVTheme[] = [
    { name: 'Midnight Blue', primary: '#1e3a8a', secondary: '#eff6ff', text: '#1e293b' },
    { name: 'Emerald Executive', primary: '#047857', secondary: '#ecfdf5', text: '#064e3b' },
    { name: 'Royal Purple', primary: '#6d28d9', secondary: '#f5f3ff', text: '#4c1d95' },
    { name: 'Slate Professional', primary: '#334155', secondary: '#f8fafc', text: '#0f172a' },
    { name: 'Ruby Bold', primary: '#be123c', secondary: '#fff1f2', text: '#881337' },
    { name: 'Ocean Calm', primary: '#0891b2', secondary: '#ecfeff', text: '#155e75' },
];

const INITIAL_CV: CVData = {
  template: 'modern',
  theme: CV_THEMES[0], 
  personal: {
    fullName: '', email: '', phone: '', address: '', website: '', linkedin: '', jobTitle: '', summary: '', photoBase64: '', photoShape: 'circle', photoFilter: 'none'
  },
  experience: [], education: [], skills: [], certifications: [], languages: []
};

const CvBuilder: React.FC = () => {
    const { t } = useThemeLanguage();
    const { showToast } = useToast();
    
    // State
    const [cvData, setCvData] = useState<CVData>(INITIAL_CV);
    const [showAtsSidebar, setShowAtsSidebar] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const debouncedCvData = useDebounce(cvData, 1500);

    // Swipe handlers for mobile
    const swipeHandlers = useSwipe({
        onSwipeLeft: () => setMobileTab('preview'),
        onSwipeRight: () => setMobileTab('editor'),
        threshold: 75
    });

    // Load Draft
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cv_draft');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure default theme/template if missing in old saves
                if (!parsed.theme) parsed.theme = CV_THEMES[0];
                if (!parsed.template) parsed.template = 'modern';
                setCvData(parsed);
            }
        } catch (e) {
            console.error("Failed to load CV draft", e);
        }

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    // Auto-Save
    useEffect(() => {
        if (JSON.stringify(debouncedCvData) === JSON.stringify(INITIAL_CV)) return;
        
        const saveDraft = () => {
            setIsAutoSaving(true);
            localStorage.setItem('cv_draft', JSON.stringify(debouncedCvData));
            setTimeout(() => setIsAutoSaving(false), 500);
        };
        saveDraft();
    }, [debouncedCvData]);

    // --- Actions ---

    const handleDownloadPDF = () => {
        const element = cvPreviewRef.current;
        if (!element) return;

        // Force preview tab on mobile to ensure it's rendered for capture
        if (mobileTab !== 'preview' && window.innerWidth < 1024) {
            setMobileTab('preview');
            setTimeout(handleDownloadPDF, 500); // retry after render
            return;
        }

        const opt = {
            margin: 0, 
            filename: `${cvData.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        if (window.html2pdf) {
            showToast("Generating PDF...", "info");
            window.html2pdf().set(opt).from(element).save();
        } else {
            showToast("PDF Library not loaded.", "error");
        }
    };

    const generateCvDescription = async (id: string, item: CVExperience) => {
        if(!item || !item.title) { showToast("Please enter a Job Title first", "error"); return; }
        
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const prompt = `Write a professional, bulleted job description for a ${item.title} at ${item.company || 'a company'}.`;
            const result = await generateContent(ToolType.CV_BUILDER, { content: prompt }, undefined, controller.signal); 
            
            setCvData(prev => ({ 
                ...prev, 
                experience: prev.experience.map(e => e.id === id ? { ...e, description: result } : e) 
            }));
            
            showToast("Description generated!", "success");
        } catch (e: any) { 
            if (e.name !== 'AbortError') showToast("Failed to generate", "error"); 
        } finally { 
            if (abortControllerRef.current === controller) {
                setIsLoading(false); 
                abortControllerRef.current = null;
            }
        }
    };

    const runAtsAnalysis = async () => {
        if(!jobDescription) { showToast("Please paste a Job Description first", "error"); return; }
        
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const result = await analyzeATS(cvData, jobDescription, controller.signal);
            setAtsAnalysis(result);
            showToast("Analysis Complete", "success");
        } catch(e: any) { 
            if (e.name !== 'AbortError') showToast("Analysis Failed", "error"); 
        } finally { 
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleApplyKeywords = () => {
        if (atsAnalysis?.missingKeywords) {
            const newSkills = [...cvData.skills];
            let count = 0;
            atsAnalysis.missingKeywords.forEach(kw => {
                if (!newSkills.includes(kw)) { newSkills.push(kw); count++; }
            });
            setCvData(prev => ({ ...prev, skills: newSkills }));
            showToast(`${count} keywords added`, 'success');
        }
    };

    const handleApplySummary = () => {
        if (atsAnalysis?.improvedSummary) {
            setCvData(prev => ({ ...prev, personal: { ...prev.personal, summary: atsAnalysis.improvedSummary! } }));
            showToast('Summary updated', 'success');
        }
    };

    const completionScore = (() => {
        let score = 0;
        if (cvData.personal.fullName) score += 10;
        if (cvData.personal.email) score += 10;
        if (cvData.personal.jobTitle) score += 10;
        if (cvData.personal.summary) score += 10;
        if (cvData.experience.length > 0) score += 20;
        if (cvData.education.length > 0) score += 10;
        if (cvData.skills.length > 0) score += 10;
        return Math.min(score, 100);
    })();

    return (
        <div 
            className="flex h-full flex-col lg:flex-row relative touch-pan-y" 
            {...swipeHandlers}
        >
             {/* Mobile/Tablet Tab Switcher */}
             <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20">
                <button 
                    onClick={() => setMobileTab('editor')} 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileTab === 'editor' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Edit3 size={16}/> Editor
                </button>
                <button 
                    onClick={() => setMobileTab('preview')} 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Eye size={16}/> Preview
                </button>
            </div>

             {/* Action Bar (Download/ATS) - Desktop only */}
             <div className="absolute top-4 right-4 z-30 flex gap-2 hidden lg:flex items-center">
                 <div className="mr-4">
                     {isAutoSaving ? (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-full shadow-sm"><Save size={10} className="animate-pulse"/> Saving...</span>
                     ) : (
                        <span className="text-[10px] text-green-500 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-full shadow-sm"><Check size={10}/> Saved</span>
                     )}
                 </div>
                 <Button size="sm" variant="outline" onClick={() => setShowAtsSidebar(!showAtsSidebar)}>
                     <Target size={16} className="mr-2"/> {showAtsSidebar ? 'Hide ATS' : 'ATS Optimizer'}
                 </Button>
                 <Button size="sm" variant="primary" onClick={handleDownloadPDF}>
                     <Download size={16} className="mr-2"/> Export PDF
                 </Button>
             </div>

             {/* Column 1: Interactive Form */}
            <div className={`w-full lg:w-[380px] xl:w-[450px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 custom-scrollbar z-10 flex-shrink-0 ${mobileTab === 'preview' ? 'hidden lg:block' : 'flex-1 lg:block'}`}>
                 <div className="mb-6 space-y-4">
                     {/* Score */}
                     <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden" role="region" aria-label="Profile Strength">
                        <div className="flex justify-between items-end mb-2 relative z-10">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <Trophy size={14} className={completionScore === 100 ? "text-yellow-500" : "text-slate-400"} />
                                Profile Strength
                            </h3>
                            <span className={`text-lg font-bold ${completionScore === 100 ? 'text-green-500' : 'text-indigo-600'}`}>{completionScore}%</span>
                            <span className="sr-only">Completion score: {completionScore} percent</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 relative z-10">
                            <div className={`h-2 rounded-full transition-all duration-500 ease-out ${completionScore === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${completionScore}%` }}></div>
                        </div>
                    </div>

                    {/* Template & Theme Selectors */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <LayoutTemplate size={14} /> {t('dashboard.cv.template')}
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['modern', 'classic', 'minimal'].map(tmpl => (
                                <button key={tmpl} onClick={() => setCvData(prev => ({...prev, template: tmpl as any}))} className={`px-3 py-2 text-xs font-medium rounded-lg capitalize border transition-all ${cvData.template === tmpl ? 'bg-white shadow-sm border-indigo-500 text-indigo-600' : 'border-transparent hover:bg-white/50 text-slate-500'}`}>{tmpl}</button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Palette size={14} /> {t('dashboard.cv.theme')}
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {CV_THEMES.map(theme => (
                                <button key={theme.name} onClick={() => setCvData(prev => ({...prev, theme: theme}))} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${cvData.theme.name === theme.name ? 'border-slate-400 bg-white dark:bg-slate-700 shadow-sm' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>

                 {/* Editor Form Component */}
                 <CvEditor 
                    cvData={cvData} 
                    setCvData={setCvData} 
                    generateCvDescription={generateCvDescription}
                    isLoading={isLoading}
                 />
            </div>

            {/* Column 2: Live Preview Component */}
            <div className={`flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-8 overflow-hidden ${mobileTab === 'editor' ? 'hidden lg:block' : 'flex flex-col'}`}>
                 <div className="flex lg:hidden justify-between items-center mb-4 shrink-0">
                     <span className="text-xs font-bold uppercase text-slate-500">Preview Mode</span>
                     <Button size="sm" onClick={handleDownloadPDF} variant="primary" icon={Download}>Download PDF</Button>
                 </div>
                 
                 <div className="flex-1 overflow-auto flex justify-center items-start bg-slate-200/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <CvPreview cvData={cvData} previewRef={cvPreviewRef} />
                 </div>
            </div>

            {/* Column 3: ATS Sidebar Component */}
            <CvAtsSidebar 
                show={showAtsSidebar}
                onClose={() => setShowAtsSidebar(false)}
                atsAnalysis={atsAnalysis}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                runAtsAnalysis={runAtsAnalysis}
                isLoading={isLoading}
                handleApplyKeywords={handleApplyKeywords}
                handleApplySummary={handleApplySummary}
                clearAnalysis={() => setAtsAnalysis(null)}
            />
        </div>
    );
};

export default CvBuilder;
