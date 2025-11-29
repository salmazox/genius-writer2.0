
import React, { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, Palette, Trophy, Download, Target, Eye, Edit3, Save, Check, Upload, FileText, Mail, Sparkles, Loader2, Lock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { generateContent, analyzeATS, parseResume, generateCoverLetter } from '../services/gemini';
import { documentService } from '../services/documentService';
import { ToolType, CVData, CVTheme, ATSAnalysis, CVExperience } from '../types';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useSwipe } from '../hooks/useSwipe';
import { validateImageFile } from '../utils/security';
import RichTextEditor from '../components/RichTextEditor';
import { useUser } from '../contexts/UserContext';
import { Watermark } from '../components/Watermark';

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
    const { user } = useUser();
    
    // State
    const [viewMode, setViewMode] = useState<'cv' | 'cover_letter'>('cv');
    const [cvData, setCvData] = useState<CVData>(INITIAL_CV);
    const [showAtsSidebar, setShowAtsSidebar] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [coverLetterContent, setCoverLetterContent] = useState('');
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
    
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const coverLetterRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const debouncedCvData = useDebounce(cvData, 1500);
    const isPro = user.plan !== 'free';

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

    const handleSaveDocument = () => {
        const content = viewMode === 'cv' ? JSON.stringify(cvData) : coverLetterContent;
        const type = viewMode === 'cv' ? ToolType.CV_BUILDER : ToolType.SMART_EDITOR; // Save letter as smart doc
        const title = viewMode === 'cv' 
            ? (cvData.personal.fullName ? `${cvData.personal.fullName}'s CV` : 'Untitled CV') 
            : `Cover Letter - ${cvData.personal.fullName}`;

        documentService.create(title, content, type);
        showToast(`${viewMode === 'cv' ? 'CV' : 'Cover Letter'} saved to My Documents`, "success");
    };

    const handleImportCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation - In real app, backend would handle PDF parsing better.
        // Here we rely on Gemini Multimodal to "see" the CV image.
        if (!file.type.startsWith('image/')) {
            showToast("For this demo, please upload an image (PNG/JPG) of your resume.", "info");
            // Allow proceed if it is image
        }

        const reader = new FileReader();
        reader.onload = async () => {
            setIsImporting(true);
            try {
                const base64 = reader.result as string;
                const parsedData = await parseResume(base64);
                
                // Merge parsed data with defaults to ensure structure
                setCvData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, ...parsedData.personal },
                    experience: parsedData.experience?.map((e: any) => ({...e, id: Date.now().toString() + Math.random()})) || [],
                    education: parsedData.education?.map((e: any) => ({...e, id: Date.now().toString() + Math.random()})) || [],
                    skills: parsedData.skills || []
                }));
                
                showToast("Resume parsed successfully!", "success");
            } catch (err) {
                console.error(err);
                showToast("Failed to parse resume. Try a clearer image.", "error");
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Actions ---

    const handleDownloadPDF = () => {
        if (!isPro) {
            showToast("Upgrade to Pro to export PDF files without watermarks.", "error");
            return;
        }

        const element = viewMode === 'cv' ? cvPreviewRef.current : coverLetterRef.current;
        if (!element) return;

        if (mobileTab !== 'preview' && window.innerWidth < 1024) {
            setMobileTab('preview');
            setTimeout(handleDownloadPDF, 500); 
            return;
        }

        const opt = {
            margin: 0, 
            filename: `${cvData.personal.fullName.replace(/\s+/g, '_')}_${viewMode === 'cv' ? 'CV' : 'CL'}.pdf`,
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

    const handleGenerateCoverLetter = async () => {
        if (!jobDescription) { showToast("Please provide a Job Description first", "error"); return; }
        if (!cvData.personal.fullName) { showToast("Please fill out your CV details first", "error"); return; }

        setIsGeneratingLetter(true);
        try {
            const letter = await generateCoverLetter(cvData, jobDescription);
            setCoverLetterContent(letter);
            showToast("Cover Letter Generated!", "success");
        } catch (e) {
            showToast("Failed to generate cover letter", "error");
        } finally {
            setIsGeneratingLetter(false);
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
        <div className="flex h-full flex-col relative">
            {/* Top Toolbar */}
            <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 shadow-sm">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('cv')}
                        className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'cv' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={16} /> CV Builder
                    </button>
                    <button 
                         onClick={() => setViewMode('cover_letter')}
                         className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'cover_letter' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Mail size={16} /> Cover Letter
                    </button>
                </div>

                <div className="flex items-center gap-2">
                     <div className="mr-4 hidden md:block">
                         {isAutoSaving ? <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full"><Save size={10} className="animate-pulse"/> Saving...</span> : <span className="text-[10px] text-green-500 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full"><Check size={10}/> Saved</span>}
                     </div>
                     
                     {viewMode === 'cv' && (
                         <>
                            <input type="file" ref={importInputRef} className="hidden" accept="image/*" onChange={handleImportCV} />
                            <Button size="sm" variant="secondary" onClick={() => importInputRef.current?.click()} icon={Upload} isLoading={isImporting} className="hidden md:flex">
                                Import
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAtsSidebar(!showAtsSidebar)} className="hidden md:flex">
                                <Target size={16} className="mr-2"/> {showAtsSidebar ? 'Hide ATS' : 'ATS Tool'}
                            </Button>
                         </>
                     )}
                     
                     <Button size="sm" variant="secondary" onClick={handleSaveDocument} icon={Save}>
                         Save
                     </Button>
                     <Button size="sm" variant={isPro ? "primary" : "ghost"} onClick={handleDownloadPDF} disabled={!isPro && false}>
                         {isPro ? <Download size={16} className="mr-2"/> : <Lock size={16} className="mr-2"/>}
                         Export
                     </Button>
                </div>
            </div>

            {viewMode === 'cv' ? (
                /* CV Builder View */
                <div className="flex-1 flex flex-col lg:flex-row relative touch-pan-y overflow-hidden" {...swipeHandlers}>
                     {/* Mobile/Tablet Tab Switcher */}
                     <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20">
                        <button onClick={() => setMobileTab('editor')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileTab === 'editor' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}><Edit3 size={16}/> Editor</button>
                        <button onClick={() => setMobileTab('preview')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}><Eye size={16}/> Preview</button>
                    </div>

                    {/* Column 1: Interactive Form */}
                    <div className={`w-full lg:w-[380px] xl:w-[450px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 custom-scrollbar z-10 flex-shrink-0 ${mobileTab === 'preview' ? 'hidden lg:block' : 'flex-1 lg:block'}`}>
                        <div className="mb-6 space-y-4">
                            {/* Score */}
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden" role="region" aria-label="Profile Strength">
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Trophy size={14} className={completionScore === 100 ? "text-yellow-500" : "text-slate-400"} /> Profile Strength</h3>
                                    <span className={`text-lg font-bold ${completionScore === 100 ? 'text-green-500' : 'text-indigo-600'}`}>{completionScore}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 relative z-10">
                                    <div className={`h-2 rounded-full transition-all duration-500 ease-out ${completionScore === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${completionScore}%` }}></div>
                                </div>
                            </div>

                            {/* Template & Theme Selectors */}
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide mb-3 flex items-center gap-2"><LayoutTemplate size={14} /> {t('dashboard.cv.template')}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {['modern', 'classic', 'minimal'].map(tmpl => (
                                        <button key={tmpl} onClick={() => setCvData(prev => ({...prev, template: tmpl as any}))} className={`px-3 py-2 text-xs font-medium rounded-lg capitalize border transition-all ${cvData.template === tmpl ? 'bg-white shadow-sm border-indigo-500 text-indigo-600' : 'border-transparent hover:bg-white/50 text-slate-500'}`}>{tmpl}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Palette size={14} /> {t('dashboard.cv.theme')}</h3>
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

                        <CvEditor cvData={cvData} setCvData={setCvData} generateCvDescription={generateCvDescription} isLoading={isLoading} />
                    </div>

                    {/* Column 2: Live Preview */}
                    <div className={`flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-8 overflow-hidden min-h-0 flex flex-col ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="flex-1 overflow-auto flex justify-center items-start bg-slate-200/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar relative">
                            {/* Watermark Container */}
                            <div className="relative">
                                {!isPro && <Watermark />}
                                <CvPreview cvData={cvData} previewRef={cvPreviewRef} />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: ATS Sidebar */}
                    <CvAtsSidebar show={showAtsSidebar} onClose={() => setShowAtsSidebar(false)} atsAnalysis={atsAnalysis} jobDescription={jobDescription} setJobDescription={setJobDescription} runAtsAnalysis={runAtsAnalysis} isLoading={isLoading} handleApplyKeywords={handleApplyKeywords} handleApplySummary={handleApplySummary} clearAnalysis={() => setAtsAnalysis(null)} />
                </div>
            ) : (
                /* Cover Letter View */
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                         <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Job Details</h2>
                         <p className="text-sm text-slate-500 mb-4">Paste the job description here. We'll use your CV details to write a tailored cover letter.</p>
                         
                         <textarea 
                             className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 resize-none mb-4 focus:ring-2 focus:ring-indigo-500 text-sm" 
                             placeholder="Paste Job Description here..." 
                             value={jobDescription} 
                             onChange={(e) => setJobDescription(e.target.value)} 
                         />
                         
                         <Button onClick={handleGenerateCoverLetter} isLoading={isGeneratingLetter} icon={Sparkles} className="w-full">
                             Generate Letter
                         </Button>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-8 overflow-y-auto flex justify-center custom-scrollbar">
                        <div className="w-full max-w-[210mm] bg-white dark:bg-slate-900 shadow-2xl min-h-[297mm] p-12 relative" ref={coverLetterRef}>
                             {!isPro && <Watermark />}
                             {coverLetterContent ? (
                                 <RichTextEditor value={coverLetterContent} onChange={setCoverLetterContent} className="min-h-full border-none" />
                             ) : (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                     <Mail size={48} className="mb-4 opacity-50" />
                                     <p>Cover letter preview will appear here</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CvBuilder;
