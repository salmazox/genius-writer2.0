
import React, { useRef, useState } from 'react';
import { 
    ChevronRight, User as UserIcon, Briefcase, GraduationCap, Zap, 
    XCircle, Plus, Sparkles, Loader2, X 
} from 'lucide-react';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';
import RichTextEditor from '../../components/RichTextEditor';
import { CVData, CVExperience, CVEducation } from '../../types';
import { validateImageFile } from '../../utils/security';
import { useToast } from '../../contexts/ToastContext';

interface CvEditorProps {
    cvData: CVData;
    setCvData: React.Dispatch<React.SetStateAction<CVData>>;
    generateCvDescription: (id: string, item: CVExperience) => void;
    isLoading: boolean;
}

const CvEditor: React.FC<CvEditorProps> = ({ cvData, setCvData, generateCvDescription, isLoading }) => {
    const { t } = useThemeLanguage();
    const { showToast } = useToast();
    const [activeAccordion, setActiveAccordion] = useState<string>('personal');
    const [skillInput, setSkillInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCvChange = (section: keyof CVData['personal'], value: string) => {
        setCvData(prev => ({ ...prev, personal: { ...prev.personal, [section]: value } }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                showToast(validation.error || "Upload failed", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => handleCvChange('photoBase64', reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const addExperience = () => setCvData(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now().toString(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }] }));
    const updateExperience = (id: string, field: keyof CVExperience, value: string | boolean) => setCvData(prev => ({ ...prev, experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    const removeExperience = (id: string) => setCvData(prev => ({ ...prev, experience: prev.experience.filter(item => item.id !== id) }));
    
    const addEducation = () => setCvData(prev => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), degree: '', school: '', location: '', year: '' }] }));
    const updateEducation = (id: string, field: keyof CVEducation, value: string) => setCvData(prev => ({ ...prev, education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    const removeEducation = (id: string) => setCvData(prev => ({ ...prev, education: prev.education.filter(item => item.id !== id) }));

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!cvData.skills.includes(skillInput.trim())) {
                setCvData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            }
            setSkillInput('');
        }
    };
    const removeSkill = (skill: string) => setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

    return (
        <div className="space-y-3 pb-20 lg:pb-0">
            {/* Personal */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => setActiveAccordion(activeAccordion === 'personal' ? '' : 'personal')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><UserIcon size={16}/> {t('dashboard.cv.personal')}</span>
                    <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'personal' ? 'rotate-90' : ''}`} />
                </button>
                {activeAccordion === 'personal' && (
                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                                {cvData.personal.photoBase64 ? <img src={cvData.personal.photoBase64} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="text-slate-400" />}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded font-medium hover:bg-slate-50 transition-colors">{t('dashboard.cv.uploadPhoto')}</button>
                                {cvData.personal.photoBase64 && (
                                    <div className="flex gap-2">
                                        <select value={cvData.personal.photoShape} onChange={(e) => handleCvChange('photoShape', e.target.value)} className="text-xs p-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent"><option value="circle">Circle</option><option value="square">Square</option><option value="rounded">Rounded</option></select>
                                        <select value={cvData.personal.photoFilter} onChange={(e) => handleCvChange('photoFilter', e.target.value)} className="text-xs p-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent"><option value="none">None</option><option value="grayscale">B&W</option></select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder={t('auth.name')} value={cvData.personal.fullName} onChange={e => handleCvChange('fullName', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                            <input type="text" placeholder="Job Title" value={cvData.personal.jobTitle} onChange={e => handleCvChange('jobTitle', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="email" placeholder="Email" value={cvData.personal.email} onChange={e => handleCvChange('email', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                            <input type="text" placeholder="Phone" value={cvData.personal.phone} onChange={e => handleCvChange('phone', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                        </div>
                        <input type="text" placeholder="Location" value={cvData.personal.address} onChange={e => handleCvChange('address', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Website" value={cvData.personal.website} onChange={e => handleCvChange('website', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                            <input type="text" placeholder="LinkedIn" value={cvData.personal.linkedin} onChange={e => handleCvChange('linkedin', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                        </div>
                        <textarea placeholder="Summary" value={cvData.personal.summary} onChange={e => handleCvChange('summary', e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm h-24 resize-none" />
                    </div>
                )}
            </div>

            {/* Experience */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => setActiveAccordion(activeAccordion === 'experience' ? '' : 'experience')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Briefcase size={16}/> {t('dashboard.cv.experience')}</span>
                    <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'experience' ? 'rotate-90' : ''}`} />
                </button>
                {activeAccordion === 'experience' && (
                    <div className="p-4 bg-white dark:bg-slate-900">
                        {cvData.experience.map((exp) => (
                            <div key={exp.id} className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative group">
                                <button onClick={() => removeExperience(exp.id)} className="absolute right-0 top-0 text-slate-300 hover:text-red-500"><XCircle size={16}/></button>
                                <div className="space-y-3">
                                    <input type="text" placeholder="Job Title" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm font-semibold" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                                        <input type="text" placeholder="Location" value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="Start Date" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                                        <input type="text" placeholder="End Date" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                                    </div>
                                    <div className="relative">
                                        <RichTextEditor value={exp.description} onChange={(val) => updateExperience(exp.id, 'description', val)} />
                                        <button onClick={() => generateCvDescription(exp.id, exp)} className="absolute bottom-2 right-2 p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors z-10">
                                            {isLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addExperience} className="w-full py-2 flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors mt-2"><Plus size={14} /> Add Position</button>
                    </div>
                )}
            </div>

            {/* Education */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => setActiveAccordion(activeAccordion === 'education' ? '' : 'education')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><GraduationCap size={16}/> {t('dashboard.cv.education')}</span>
                    <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'education' ? 'rotate-90' : ''}`} />
                </button>
                {activeAccordion === 'education' && (
                    <div className="p-4 bg-white dark:bg-slate-900">
                        {cvData.education.map((edu) => (
                            <div key={edu.id} className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative">
                                <button onClick={() => removeEducation(edu.id)} className="absolute right-0 top-0 text-slate-300 hover:text-red-500"><XCircle size={16}/></button>
                                <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm mb-2" />
                                <input type="text" placeholder="School" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm mb-2" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Location" value={edu.location} onChange={e => updateEducation(edu.id, 'location', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                                    <input type="text" placeholder="Year" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                                </div>
                            </div>
                        ))}
                        <button onClick={addEducation} className="w-full py-2 flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors mt-2"><Plus size={14} /> Add Education</button>
                    </div>
                )}
            </div>

            {/* Skills */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => setActiveAccordion(activeAccordion === 'skills' ? '' : 'skills')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Zap size={16}/> {t('dashboard.cv.skills')}</span>
                    <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'skills' ? 'rotate-90' : ''}`} />
                </button>
                {activeAccordion === 'skills' && (
                    <div className="p-4 bg-white dark:bg-slate-900">
                        <input type="text" placeholder="Type skill & hit Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm mb-3" />
                        <div className="flex flex-wrap gap-2">
                            {cvData.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 group cursor-default">{skill}<button onClick={() => removeSkill(skill)} className="text-slate-400 group-hover:text-red-500"><X size={12}/></button></span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CvEditor;
