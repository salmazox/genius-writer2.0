import React, { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, Palette, Trophy, Download, Target, Eye, Edit3, Save, Check, Upload, FileText, Mail, Sparkles, Loader2, Lock, ArrowLeft, Lightbulb, Linkedin, History, Paintbrush } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { generateContent, analyzeATS, parseResume, generateCoverLetter, parseLinkedInProfile, parsePDFResume } from '../services/gemini';
import { documentService } from '../services/documentService';
import { ToolType, CVData, CVTheme, ATSAnalysis, CVExperience } from '../types';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useSwipe } from '../hooks/useSwipe';
import { validateImageFile } from '../utils/security';
import RichTextEditor from '../components/RichTextEditor';
import { useUser } from '../contexts/UserContext';
import { Watermark } from '../components/Watermark';
import { usePdfExport } from '../hooks/usePdfExport';
import { useMobileTabs } from '../hooks/useMobileTabs';
import { calculateRealTimeATSScore, type ATSScoreBreakdown } from '../services/atsScoring';
import { saveVersion, autoSaveCheckpoint } from '../services/versionHistory';

// Sub-components
import CvEditor from './cv/CvEditor';
import CvPreview from './cv/CvPreview';
import CvAtsSidebar from './cv/CvAtsSidebar';
import CvAiCoach from './cv/CvAiCoach';
import JobDescriptionPanel, { type JobDescriptionData } from './cv/JobDescriptionPanel';
import CoverLetterPanel from './cv/CoverLetterPanel';
import LinkedInPostsPanel from './cv/LinkedInPostsPanel';
import VersionHistoryPanel from './cv/VersionHistoryPanel';
import TemplateSelector, { type CVTemplate } from './cv/TemplateSelector';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const exportToPdf = usePdfExport();
    const { activeTab: mobileTab, setActiveTab: setMobileTab } = useMobileTabs<'editor' | 'preview'>('editor');
    
    // State
    const [viewMode, setViewMode] = useState<'cv' | 'cover_letter' | 'linkedin_posts'>('cv');
    const [cvData, setCvData] = useState<CVData>(INITIAL_CV);
    const [showAtsSidebar, setShowAtsSidebar] = useState(false);
    const [showAiCoach, setShowAiCoach] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [jobDescriptionData, setJobDescriptionData] = useState<JobDescriptionData | null>(null);
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
    const [atsScore, setAtsScore] = useState<ATSScoreBreakdown | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [coverLetterContent, setCoverLetterContent] = useState('');
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
    
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const coverLetterRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const linkedinImportInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce for Auto-Save (Longer delay)
    const debouncedCvDataForSave = useDebounce(cvData, 1500);

    // Debounce for Preview Rendering (Shorter delay for responsiveness)
    const previewCvData = useDebounce(cvData, 200);

    // Debounce for ATS Scoring (Medium delay for real-time feedback)
    const debouncedCvForScoring = useDebounce(cvData, 500);

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
        if (JSON.stringify(debouncedCvDataForSave) === JSON.stringify(INITIAL_CV)) return;

        const saveDraft = () => {
            setIsAutoSaving(true);
            localStorage.setItem('cv_draft', JSON.stringify(debouncedCvDataForSave));
            setTimeout(() => setIsAutoSaving(false), 500);
        };
        saveDraft();
    }, [debouncedCvDataForSave]);

    // Real-time ATS Score Calculation
    useEffect(() => {
        try {
            const score = calculateRealTimeATSScore(debouncedCvForScoring, jobDescription);
            setAtsScore(score);
        } catch (error) {
            console.error('Failed to calculate ATS score:', error);
        }
    }, [debouncedCvForScoring, jobDescription]);

    // Auto-save version checkpoints
    useEffect(() => {
        if (cvData.personal.fullName && atsScore) {
            autoSaveCheckpoint(cvData, atsScore);
        }
    }, [debouncedCvDataForSave, atsScore]);

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

        // Detect file type and choose appropriate parser
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isImage = file.type.startsWith('image/');

        if (!isPDF && !isImage) {
            showToast("Please upload an image (PNG/JPG) or PDF of your resume.", "info");
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            setIsImporting(true);
            try {
                const base64 = reader.result as string;

                // Choose parser based on file type
                const parsedData = isPDF
                    ? await parsePDFResume(base64)
                    : await parseResume(base64);

                // Merge parsed data with defaults, including certifications and languages
                setCvData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, ...parsedData.personal },
                    experience: parsedData.experience?.map((e: any) => ({...e, id: Date.now().toString() + Math.random()})) || prev.experience,
                    education: parsedData.education?.map((e: any) => ({...e, id: Date.now().toString() + Math.random()})) || prev.education,
                    skills: parsedData.skills || prev.skills,
                    certifications: parsedData.certifications?.map((c: any) => ({...c, id: Date.now().toString() + Math.random()})) || prev.certifications,
                    languages: parsedData.languages?.map((l: any) => ({...l, id: Date.now().toString() + Math.random()})) || prev.languages
                }));

                const fileType = isPDF ? 'PDF' : 'image';
                showToast(`Resume imported from ${fileType} successfully! 🎉`, "success");
            } catch (err: any) {
                console.error(err);
                showToast(err.message || t('dashboard.toasts.importFail'), "error");
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImportLinkedIn = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast("Please upload a screenshot (PNG/JPG) of your LinkedIn profile.", "info");
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            setIsImporting(true);
            try {
                const base64 = reader.result as string;
                const parsedData = await parseLinkedInProfile(base64);

                // Merge parsed data with defaults, including certifications and languages
                setCvData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, ...parsedData.personal },
                    experience: parsedData.experience?.map((e: any) => ({ ...e, id: Date.now().toString() + Math.random() })) || prev.experience,
                    education: parsedData.education?.map((e: any) => ({ ...e, id: Date.now().toString() + Math.random() })) || prev.education,
                    skills: parsedData.skills || prev.skills,
                    certifications: parsedData.certifications?.map((c: any) => ({ ...c, id: Date.now().toString() + Math.random() })) || prev.certifications,
                    languages: parsedData.languages?.map((l: any) => ({ ...l, id: Date.now().toString() + Math.random() })) || prev.languages
                }));

                showToast('LinkedIn profile imported successfully! 🎉', "success");
            } catch (err: any) {
                console.error(err);
                showToast(err.message || 'Failed to import LinkedIn profile', "error");
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBack = () => {
        setSearchParams({ tab: 'library' });
    };

    // --- Actions ---

    const handleDownloadPDF = () => {
        if (!isPro) {
            showToast(t('dashboard.toasts.upgradePro'), "error");
            return;
        }

        const element = viewMode === 'cv' ? cvPreviewRef.current : coverLetterRef.current;
        if (!element) return;

        if (mobileTab !== 'preview' && window.innerWidth < 1024) {
            setMobileTab('preview');
            setTimeout(handleDownloadPDF, 500); 
            return;
        }

        exportToPdf(element, {
            filename: `${cvData.personal.fullName.replace(/\s+/g, '_')}_${viewMode === 'cv' ? 'CV' : 'CL'}.pdf`,
            margin: 0
        });
    };

    const generateCvDescription = async (id: string, item: CVExperience) => {
        if(!item || !item.title) { showToast(t('dashboard.toasts.titleMissing'), "error"); return; }
        
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
            
            showToast(t('dashboard.toasts.descGenerated'), "success");
        } catch (e: any) { 
            if (e.name !== 'AbortError') showToast(e.message || "Failed to generate", "error"); 
        } finally { 
            if (abortControllerRef.current === controller) {
                setIsLoading(false); 
                abortControllerRef.current = null;
            }
        }
    };

    const runAtsAnalysis = async () => {
        if(!jobDescription) { showToast(t('dashboard.toasts.jobDescMissing'), "error"); return; }
        
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const result = await analyzeATS(cvData, jobDescription, controller.signal);
            setAtsAnalysis(result);
            showToast(t('dashboard.toasts.analysisComplete'), "success");
        } catch(e: any) { 
            if (e.name !== 'AbortError') showToast(e.message || t('dashboard.toasts.analysisFail'), "error"); 
        } finally { 
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!jobDescription) { showToast(t('dashboard.toasts.jobDescMissing'), "error"); return; }
        if (!cvData.personal.fullName) { showToast(t('dashboard.toasts.cvDetailsMissing'), "error"); return; }

        setIsGeneratingLetter(true);
        try {
            const letter = await generateCoverLetter(cvData, jobDescription);
            setCoverLetterContent(letter);
            showToast(t('dashboard.toasts.coverLetterGenerated'), "success");
        } catch (e: any) {
            showToast(e.message || t('dashboard.toasts.coverLetterFail'), "error");
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

    const handleUpdateCV = (updates: Partial<CVData>) => {
        setCvData(prev => ({
            ...prev,
            ...updates,
            // Merge nested objects properly
            personal: updates.personal ? { ...prev.personal, ...updates.personal } : prev.personal
        }));
    };

    const handleJobDescriptionAnalyzed = (data: JobDescriptionData) => {
        setJobDescriptionData(data);
        showToast('Job description analyzed successfully', 'success');
    };

    const handleGenerateCV = (generatedCV: Partial<CVData>) => {
        setCvData(prev => ({
            ...prev,
            personal: generatedCV.personal ? { ...prev.personal, ...generatedCV.personal } : prev.personal,
            experience: generatedCV.experience || prev.experience,
            education: generatedCV.education || prev.education,
            skills: generatedCV.skills || prev.skills,
            certifications: generatedCV.certifications || prev.certifications,
            languages: generatedCV.languages || prev.languages
        }));
        showToast('CV generated successfully! Review and customize as needed.', 'success');
    };

    const handleSaveVersion = () => {
        const name = prompt('Enter a name for this version:', `Version - ${new Date().toLocaleDateString()}`);
        if (name) {
            const tags = prompt('Enter tags (comma-separated, optional):')?.split(',').map(t => t.trim()).filter(Boolean) || [];
            saveVersion(cvData, atsScore, name, tags);
            showToast(`Version "${name}" saved successfully!`, 'success');
        }
    };

    const handleRestoreVersion = (restoredCvData: CVData) => {
        setCvData(restoredCvData);
        showToast('CV restored from version history', 'success');
    };

    const handleSelectTemplate = (template: CVTemplate) => {
        setCvData(prev => ({ ...prev, template }));
        setShowTemplateSelector(false);
        showToast(`Template changed to "${template}"`, 'success');
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
            <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 lg:px-6 shrink-0 z-30 shadow-sm gap-2">
                <div className="flex items-center gap-2">
                    {/* Back Button for Mobile */}
                    <button onClick={handleBack} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 -ml-1">
                        <ArrowLeft size={20} />
                    </button>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('cv')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'cv' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileText size={16} /> 
                            <span className="hidden md:inline">CV Builder</span>
                            <span className="md:hidden">CV</span>
                        </button>
                        <button
                             onClick={() => setViewMode('cover_letter')}
                             className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'cover_letter' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Mail size={16} />
                            <span className="hidden md:inline">Cover Letter</span>
                            <span className="md:hidden">Cover</span>
                        </button>
                        <button
                             onClick={() => setViewMode('linkedin_posts')}
                             className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'linkedin_posts' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Linkedin size={16} />
                            <span className="hidden md:inline">LinkedIn Posts</span>
                            <span className="md:hidden">LinkedIn</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                     <div className="mr-4 hidden md:block">
                         {isAutoSaving ? <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full"><Save size={10} className="animate-pulse"/> Saving...</span> : <span className="text-[10px] text-green-500 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full"><Check size={10}/> Saved</span>}
                     </div>
                     
                     {viewMode === 'cv' && (
                         <>
                            <input type="file" ref={importInputRef} className="hidden" accept="image/*,application/pdf,.pdf" onChange={handleImportCV} />
                            <input type="file" ref={linkedinImportInputRef} className="hidden" accept="image/*" onChange={handleImportLinkedIn} />

                            <Button size="sm" variant="secondary" onClick={() => importInputRef.current?.click()} icon={Upload} isLoading={isImporting} className="hidden md:flex">
                                Import
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => linkedinImportInputRef.current?.click()}
                                isLoading={isImporting}
                                className="hidden lg:flex"
                            >
                                <Linkedin size={16} className="mr-2"/>
                                LinkedIn
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowTemplateSelector(true)}
                                className="hidden md:flex"
                            >
                                <Paintbrush size={16} className="mr-2"/> Template
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAtsSidebar(!showAtsSidebar)} className="hidden md:flex">
                                <Target size={16} className="mr-2"/> {showAtsSidebar ? 'Hide ATS' : 'ATS Tool'}
                            </Button>
                            <Button
                                size="sm"
                                variant={showAiCoach ? "primary" : "outline"}
                                onClick={() => setShowAiCoach(!showAiCoach)}
                                className="hidden md:flex"
                            >
                                <Lightbulb size={16} className="mr-2"/> AI Coach
                            </Button>
                            <Button
                                size="sm"
                                variant={showVersionHistory ? "primary" : "outline"}
                                onClick={() => setShowVersionHistory(!showVersionHistory)}
                                className="hidden md:flex"
                            >
                                <History size={16} className="mr-2"/> Versions
                            </Button>
                         </>
                     )}
                     
                     <Button size="sm" variant="secondary" onClick={handleSaveDocument} icon={Save}>
                         <span className="hidden md:inline">Save</span>
                     </Button>
                     <Button size="sm" variant={isPro ? "primary" : "ghost"} onClick={handleDownloadPDF} disabled={!isPro && false}>
                         {isPro ? <Download size={16} className="mr-2"/> : <Lock size={16} className="mr-2"/>}
                         <span className="hidden md:inline">Export</span>
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
                    <div className={`w-full lg:w-[380px] xl:w-[450px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 pb-24 lg:pb-4 custom-scrollbar z-10 flex-shrink-0 ${mobileTab === 'preview' ? 'hidden lg:block' : 'flex-1 lg:block'}`}>
                        <div className="mb-6 space-y-4">
                            {/* Job Description Panel */}
                            <JobDescriptionPanel
                                value={jobDescription}
                                onChange={setJobDescription}
                                onAnalyzed={handleJobDescriptionAnalyzed}
                                onGenerateCV={handleGenerateCV}
                            />

                            {/* Enhanced ATS Score */}
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-xl border border-indigo-200 dark:border-slate-700 shadow-sm relative overflow-hidden" role="region" aria-label="ATS Score">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                                            <Trophy size={14} className={atsScore && atsScore.overall >= 85 ? "text-yellow-500" : "text-slate-400"} />
                                            ATS Score
                                        </h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {atsScore?.grade || 'Calculating...'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl font-bold ${
                                            !atsScore ? 'text-slate-400' :
                                            atsScore.overall >= 85 ? 'text-green-500' :
                                            atsScore.overall >= 70 ? 'text-indigo-600' :
                                            atsScore.overall >= 50 ? 'text-yellow-600' : 'text-red-500'
                                        }`}>
                                            {atsScore?.overall || 0}
                                        </span>
                                        <span className="text-sm text-slate-500">/100</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-3">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                                            !atsScore ? 'bg-slate-400' :
                                            atsScore.overall >= 85 ? 'bg-green-500' :
                                            atsScore.overall >= 70 ? 'bg-indigo-600' :
                                            atsScore.overall >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${atsScore?.overall || 0}%` }}
                                    ></div>
                                </div>

                                {/* Score Breakdown - Compact */}
                                {atsScore && (
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="flex items-center justify-between p-1.5 bg-white/60 dark:bg-slate-700/60 rounded">
                                            <span className="text-slate-600 dark:text-slate-300">Keywords</span>
                                            <span className={`font-bold ${atsScore.criteria.keywords.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {atsScore.criteria.keywords.score}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 bg-white/60 dark:bg-slate-700/60 rounded">
                                            <span className="text-slate-600 dark:text-slate-300">Formatting</span>
                                            <span className={`font-bold ${atsScore.criteria.formatting.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {atsScore.criteria.formatting.score}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 bg-white/60 dark:bg-slate-700/60 rounded">
                                            <span className="text-slate-600 dark:text-slate-300">Metrics</span>
                                            <span className={`font-bold ${atsScore.criteria.quantification.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {atsScore.criteria.quantification.score}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 bg-white/60 dark:bg-slate-700/60 rounded">
                                            <span className="text-slate-600 dark:text-slate-300">Action Verbs</span>
                                            <span className={`font-bold ${atsScore.criteria.actionVerbs.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {atsScore.criteria.actionVerbs.score}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 bg-white/60 dark:bg-slate-700/60 rounded">
                                            <span className="text-slate-600 dark:text-slate-300">Length</span>
                                            <span className={`font-bold ${atsScore.criteria.length.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {atsScore.criteria.length.score}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 bg-white/60 dark:bg-slate-700/60 rounded">
                                            <span className="text-slate-600 dark:text-slate-300">Structure</span>
                                            <span className={`font-bold ${atsScore.criteria.structure.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {atsScore.criteria.structure.score}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Top Suggestion */}
                                {atsScore && atsScore.suggestions.length > 0 && (
                                    <div className="mt-3 p-2 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-indigo-200 dark:border-slate-600">
                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                            💡 {atsScore.suggestions[0]}
                                        </p>
                                    </div>
                                )}
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
                        <div className="flex-1 overflow-auto flex justify-center items-start bg-slate-200/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar relative pb-24 lg:pb-0">
                            {/* Watermark Container */}
                            <div className="relative">
                                {!isPro && <Watermark />}
                                {/* Pass debounced preview data to prevent typing lag */}
                                <CvPreview cvData={previewCvData} previewRef={cvPreviewRef} />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: ATS Sidebar */}
                    <CvAtsSidebar show={showAtsSidebar} onClose={() => setShowAtsSidebar(false)} atsAnalysis={atsAnalysis} jobDescription={jobDescription} setJobDescription={setJobDescription} runAtsAnalysis={runAtsAnalysis} isLoading={isLoading} handleApplyKeywords={handleApplyKeywords} handleApplySummary={handleApplySummary} clearAnalysis={() => setAtsAnalysis(null)} />

                    {/* Column 4: AI Co-Pilot Sidebar */}
                    {showAiCoach && (
                        <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-shrink-0 overflow-hidden flex flex-col">
                            <CvAiCoach
                                cvData={cvData}
                                atsScore={atsScore}
                                onUpdateCV={handleUpdateCV}
                            />
                        </div>
                    )}

                    {/* Column 5: Version History Sidebar */}
                    {showVersionHistory && (
                        <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-shrink-0 overflow-hidden flex flex-col">
                            <VersionHistoryPanel
                                onRestoreVersion={handleRestoreVersion}
                                onClose={() => setShowVersionHistory(false)}
                            />
                        </div>
                    )}
                </div>
            ) : viewMode === 'cover_letter' ? (
                /* Cover Letter View */
                <CoverLetterPanel
                    cvData={cvData}
                    jobDescription={jobDescription}
                    onClose={() => setViewMode('cv')}
                    className="flex-1"
                />
            ) : (
                /* LinkedIn Posts View */
                <LinkedInPostsPanel
                    cvData={cvData}
                    jobTarget={jobDescription || cvData.personal.jobTitle}
                    onClose={() => setViewMode('cv')}
                    className="flex-1"
                />
            )}

            {/* Template Selector Modal */}
            {showTemplateSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateSelector(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <TemplateSelector
                                currentTemplate={cvData.template}
                                onSelectTemplate={handleSelectTemplate}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CvBuilder;