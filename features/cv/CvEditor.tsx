
import React, { useRef, useState } from 'react';
import { 
    ChevronRight, User as UserIcon, Briefcase, GraduationCap, Zap, 
    XCircle, Plus, Sparkles, Loader2, X, ChevronUp, ChevronDown, Award
} from 'lucide-react';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';
import RichTextEditor from '../../components/RichTextEditor';
import { CVData, CVExperience, CVEducation, CVCertificate } from '../../types';
import { validateImageFile } from '../../utils/security';
import { useToast } from '../../contexts/ToastContext';
import { Input, Textarea, Select } from '../../components/ui/Forms';
import { Button } from '../../components/ui/Button';

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

    // Section Order State - In a real app this would be part of CVData
    const [sections, setSections] = useState(['personal', 'experience', 'education', 'certifications', 'skills']);

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

    // Generic move function
    const moveItem = <T,>(arr: T[], index: number, direction: 'up' | 'down'): T[] => {
        const newArr = [...arr];
        if (direction === 'up' && index > 0) {
            [newArr[index], newArr[index - 1]] = [newArr[index - 1], newArr[index]];
        } else if (direction === 'down' && index < newArr.length - 1) {
            [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
        }
        return newArr;
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        setSections(prev => moveItem(prev, index, direction));
    };

    const addExperience = () => setCvData(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now().toString(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }] }));
    const updateExperience = (id: string, field: keyof CVExperience, value: string | boolean) => setCvData(prev => ({ ...prev, experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    const removeExperience = (id: string) => setCvData(prev => ({ ...prev, experience: prev.experience.filter(item => item.id !== id) }));
    const moveExperience = (index: number, direction: 'up' | 'down') => setCvData(prev => ({ ...prev, experience: moveItem(prev.experience, index, direction) }));
    
    const addEducation = () => setCvData(prev => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), degree: '', school: '', location: '', year: '' }] }));
    const updateEducation = (id: string, field: keyof CVEducation, value: string) => setCvData(prev => ({ ...prev, education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    const removeEducation = (id: string) => setCvData(prev => ({ ...prev, education: prev.education.filter(item => item.id !== id) }));
    const moveEducation = (index: number, direction: 'up' | 'down') => setCvData(prev => ({ ...prev, education: moveItem(prev.education, index, direction) }));

    const addCertificate = () => setCvData(prev => ({ ...prev, certifications: [...prev.certifications, { id: Date.now().toString(), name: '', issuer: '', date: '', url: '', description: '' }] }));
    const updateCertificate = (id: string, field: keyof CVCertificate, value: string) => setCvData(prev => ({ ...prev, certifications: prev.certifications.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    const removeCertificate = (id: string) => setCvData(prev => ({ ...prev, certifications: prev.certifications.filter(item => item.id !== id) }));
    const moveCertificate = (index: number, direction: 'up' | 'down') => setCvData(prev => ({ ...prev, certifications: moveItem(prev.certifications, index, direction) }));

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

    const renderSection = (section: string, index: number) => {
        const isFirst = index === 0;
        const isLast = index === sections.length - 1;

        const controls = (
            <div className="flex gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => moveSection(index, 'up')} disabled={isFirst} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-20" aria-label="Move section up"><ChevronUp size={14}/></button>
                <button onClick={() => moveSection(index, 'down')} disabled={isLast} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-20" aria-label="Move section down"><ChevronDown size={14}/></button>
            </div>
        );

        if (section === 'personal') {
            return (
                <div key="personal" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
                    <button onClick={() => setActiveAccordion(activeAccordion === 'personal' ? '' : 'personal')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                            {controls}
                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><UserIcon size={16}/> {t('dashboard.cv.personal')}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'personal' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeAccordion === 'personal' && (
                        <div className="p-4 space-y-4 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2">
                            {/* Personal Fields */}
                            <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                                    {cvData.personal.photoBase64 ? <img src={cvData.personal.photoBase64} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="text-slate-400" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleImageUpload} className="hidden" aria-label="Upload Profile Photo" />
                                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-xs">{t('dashboard.cv.uploadPhoto')}</Button>
                                    {cvData.personal.photoBase64 && (
                                        <div className="flex gap-2">
                                            <Select label={t('dashboard.cv.shape')} value={cvData.personal.photoShape} onChange={(e) => handleCvChange('photoShape', e.target.value)} options={['circle', 'square', 'rounded']} className="text-xs py-1" />
                                            <Select label={t('dashboard.cv.filter')} value={cvData.personal.photoFilter} onChange={(e) => handleCvChange('photoFilter', e.target.value)} options={['none', 'grayscale']} className="text-xs py-1" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder={t('auth.name')} value={cvData.personal.fullName} onChange={e => handleCvChange('fullName', e.target.value)} aria-label={t('auth.name')} />
                                <Input placeholder={t('dashboard.cv.jobTitle')} value={cvData.personal.jobTitle} onChange={e => handleCvChange('jobTitle', e.target.value)} aria-label="Job Title" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="email" placeholder="Email" value={cvData.personal.email} onChange={e => handleCvChange('email', e.target.value)} aria-label="Email" />
                                <Input placeholder="Phone" value={cvData.personal.phone} onChange={e => handleCvChange('phone', e.target.value)} aria-label="Phone" />
                            </div>
                            <Input placeholder={t('dashboard.cv.location')} value={cvData.personal.address} onChange={e => handleCvChange('address', e.target.value)} aria-label="Location" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Website" value={cvData.personal.website} onChange={e => handleCvChange('website', e.target.value)} aria-label="Website" />
                                <Input placeholder="LinkedIn" value={cvData.personal.linkedin} onChange={e => handleCvChange('linkedin', e.target.value)} aria-label="LinkedIn" />
                            </div>
                            <Textarea placeholder="Professional Summary" value={cvData.personal.summary} onChange={e => handleCvChange('summary', e.target.value)} className="h-24" aria-label="Professional Summary" />
                        </div>
                    )}
                </div>
            );
        }

        if (section === 'experience') {
            return (
                <div key="experience" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
                    <button onClick={() => setActiveAccordion(activeAccordion === 'experience' ? '' : 'experience')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                             {controls}
                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Briefcase size={16}/> {t('dashboard.cv.experience')}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'experience' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeAccordion === 'experience' && (
                        <div className="p-4 bg-white dark:bg-slate-900">
                            {cvData.experience.map((exp, idx) => (
                                <div key={exp.id} className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative group">
                                    <div className="absolute right-0 top-0 flex gap-1 z-10">
                                        <button onClick={() => moveExperience(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30" aria-label="Move position up"><ChevronUp size={16}/></button>
                                        <button onClick={() => moveExperience(idx, 'down')} disabled={idx === cvData.experience.length - 1} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30" aria-label="Move position down"><ChevronDown size={16}/></button>
                                        <button onClick={() => removeExperience(exp.id)} className="p-1 text-slate-300 hover:text-red-500 ml-2" aria-label="Remove position"><XCircle size={16}/></button>
                                    </div>
                                    <div className="space-y-3 pt-6">
                                        <Input placeholder={t('dashboard.cv.jobTitle')} value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} className="font-semibold" aria-label="Job Title" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input placeholder={t('dashboard.cv.company')} value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} aria-label="Company" />
                                            <Input placeholder={t('dashboard.cv.location')} value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} aria-label="Location" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input placeholder={t('dashboard.cv.startDate')} value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} aria-label="Start Date" />
                                            <Input placeholder={t('dashboard.cv.endDate')} value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} aria-label="End Date" />
                                        </div>
                                        <div className="relative">
                                            <RichTextEditor value={exp.description} onChange={(val) => updateExperience(exp.id, 'description', val)} />
                                            <button onClick={() => generateCvDescription(exp.id, exp)} className="absolute bottom-2 right-2 p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors z-10" aria-label="Generate description with AI">
                                                {isLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={addExperience} variant="outline" className="w-full border-dashed flex gap-2"><Plus size={14} /> {t('dashboard.cv.addPosition')}</Button>
                        </div>
                    )}
                </div>
            );
        }

        if (section === 'education') {
            return (
                <div key="education" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
                    <button onClick={() => setActiveAccordion(activeAccordion === 'education' ? '' : 'education')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                            {controls}
                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><GraduationCap size={16}/> {t('dashboard.cv.education')}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'education' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeAccordion === 'education' && (
                        <div className="p-4 bg-white dark:bg-slate-900">
                             {cvData.education.map((edu, idx) => (
                                <div key={edu.id} className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative">
                                    <div className="absolute right-0 top-0 flex gap-1 z-10">
                                        <button onClick={() => moveEducation(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30" aria-label="Move education up"><ChevronUp size={16}/></button>
                                        <button onClick={() => moveEducation(idx, 'down')} disabled={idx === cvData.education.length - 1} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30" aria-label="Move education down"><ChevronDown size={16}/></button>
                                        <button onClick={() => removeEducation(edu.id)} className="p-1 text-slate-300 hover:text-red-500 ml-2" aria-label="Remove education"><XCircle size={16}/></button>
                                    </div>
                                    <div className="pt-6">
                                        <Input placeholder={t('dashboard.cv.degree')} value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="mb-2" aria-label="Degree" />
                                        <Input placeholder={t('dashboard.cv.school')} value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} className="mb-2" aria-label="School" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input placeholder={t('dashboard.cv.location')} value={edu.location} onChange={e => updateEducation(edu.id, 'location', e.target.value)} aria-label="Location" />
                                            <Input placeholder={t('dashboard.cv.year')} value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} aria-label="Year" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={addEducation} variant="outline" className="w-full border-dashed flex gap-2"><Plus size={14} /> {t('dashboard.cv.addEducation')}</Button>
                        </div>
                    )}
                </div>
            );
        }

        if (section === 'certifications') {
            return (
                <div key="certifications" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
                    <button onClick={() => setActiveAccordion(activeAccordion === 'certifications' ? '' : 'certifications')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                            {controls}
                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Award size={16}/> {t('dashboard.cv.certifications')}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'certifications' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeAccordion === 'certifications' && (
                        <div className="p-4 bg-white dark:bg-slate-900">
                             {cvData.certifications.map((cert, idx) => (
                                <div key={cert.id} className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0 relative">
                                    <div className="absolute right-0 top-0 flex gap-1 z-10">
                                        <button onClick={() => moveCertificate(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30" aria-label="Move certificate up"><ChevronUp size={16}/></button>
                                        <button onClick={() => moveCertificate(idx, 'down')} disabled={idx === cvData.certifications.length - 1} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-30" aria-label="Move certificate down"><ChevronDown size={16}/></button>
                                        <button onClick={() => removeCertificate(cert.id)} className="p-1 text-slate-300 hover:text-red-500 ml-2" aria-label="Remove certificate"><XCircle size={16}/></button>
                                    </div>
                                    <div className="pt-6 space-y-2">
                                        <Input placeholder={t('dashboard.cv.certName')} value={cert.name} onChange={e => updateCertificate(cert.id, 'name', e.target.value)} aria-label="Certificate Name" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input placeholder={t('dashboard.cv.issuer')} value={cert.issuer} onChange={e => updateCertificate(cert.id, 'issuer', e.target.value)} aria-label="Issuer" />
                                            <Input placeholder="Date (e.g. 2023)" value={cert.date} onChange={e => updateCertificate(cert.id, 'date', e.target.value)} aria-label="Date" />
                                        </div>
                                        <Input placeholder={t('dashboard.cv.credentialUrl')} value={cert.url} onChange={e => updateCertificate(cert.id, 'url', e.target.value)} aria-label="Credential URL" />
                                        <Textarea placeholder={t('dashboard.cv.description')} value={cert.description} onChange={e => updateCertificate(cert.id, 'description', e.target.value)} className="h-20" aria-label="Description" />
                                    </div>
                                </div>
                            ))}
                            <Button onClick={addCertificate} variant="outline" className="w-full border-dashed flex gap-2"><Plus size={14} /> {t('dashboard.cv.addCert')}</Button>
                        </div>
                    )}
                </div>
            );
        }

        if (section === 'skills') {
            return (
                <div key="skills" className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
                    <button onClick={() => setActiveAccordion(activeAccordion === 'skills' ? '' : 'skills')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                             {controls}
                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Zap size={16}/> {t('dashboard.cv.skills')}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${activeAccordion === 'skills' ? 'rotate-90' : ''}`} />
                    </button>
                    {activeAccordion === 'skills' && (
                        <div className="p-4 bg-white dark:bg-slate-900">
                            <Input placeholder="Type skill & hit Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} className="mb-3" aria-label="Add Skill" />
                            <div className="flex flex-wrap gap-2">
                                {cvData.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 group cursor-default">{skill}<button onClick={() => removeSkill(skill)} className="text-slate-400 group-hover:text-red-500" aria-label={`Remove ${skill}`}><X size={12}/></button></span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-3 pb-20 lg:pb-0">
            {sections.map((sec, idx) => renderSection(sec, idx))}
        </div>
    );
};

export default CvEditor;
