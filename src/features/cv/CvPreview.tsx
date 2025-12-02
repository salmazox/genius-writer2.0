
import React, { useState } from 'react';
import { User as UserIcon, Briefcase, Mail, Phone, MapPin, Globe, Linkedin, Calendar, Award, ExternalLink } from 'lucide-react';
import { CVData } from '../../types';
import { sanitizeHtml } from '../../utils/security';

interface CvPreviewProps {
    cvData: CVData;
    previewRef: React.RefObject<HTMLDivElement>;
}

// Memoize to prevent unnecessary re-renders
const CvPreview: React.FC<CvPreviewProps> = React.memo(({ cvData, previewRef }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const createMarkup = (htmlContent: string) => {
        return { __html: sanitizeHtml(htmlContent) };
    };

    // --- Template: Modern ---
    // Uses float layout to keep sidebar on first page only, while main content flows naturally.
    const ModernTemplate = () => (
        <div className="relative bg-white text-slate-800 shadow-sm overflow-hidden" style={{ minHeight: '297mm' }}>

            {/* 1. Background Color for Sidebar (Absolute, Page 1 Height Only) */}
            <div className="absolute top-0 left-0 w-[32%] h-[297mm] print:h-[297mm] z-0" style={{ backgroundColor: cvData.theme.primary }}></div>

            {/* 2. Sidebar Content (Absolute, Page 1 Height Only) */}
            <div className="absolute top-0 left-0 w-[32%] h-[297mm] p-8 flex flex-col text-white z-10 overflow-hidden">
                {cvData.personal.photoBase64 && (
                    <div className="mb-8 mx-auto flex justify-center">
                        <img 
                            src={cvData.personal.photoBase64} 
                            alt="Profile" 
                            onLoad={() => setImageLoaded(true)}
                            className={`w-32 h-32 object-cover border-4 border-white/20 shadow-lg ${cvData.personal.photoShape === 'circle' ? 'rounded-full' : cvData.personal.photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none'} ${cvData.personal.photoFilter === 'grayscale' ? 'grayscale' : ''} ${!imageLoaded ? 'blur-sm scale-95 opacity-80' : 'scale-100 opacity-100'} transition-all duration-500`} 
                        />
                    </div>
                )}
                
                <div className="space-y-8">
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2 opacity-90">Contact</h3>
                        <div className="space-y-4 text-xs sm:text-sm font-medium opacity-95">
                            {cvData.personal.email && <div className="break-words flex items-start gap-3"><Mail size={14} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.email}</span></div>}
                            {cvData.personal.phone && <div className="flex items-center gap-3"><Phone size={14} className="shrink-0 opacity-70"/> <span>{cvData.personal.phone}</span></div>}
                            {cvData.personal.address && <div className="flex items-start gap-3"><MapPin size={14} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.address}</span></div>}
                            {cvData.personal.linkedin && <div className="break-words flex items-start gap-3"><Linkedin size={14} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.linkedin}</span></div>}
                            {cvData.personal.website && <div className="break-words flex items-start gap-3"><Globe size={14} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.website}</span></div>}
                        </div>
                    </div>

                    {/* Education */}
                    {cvData.education.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2 opacity-90">Education</h3>
                            <div className="space-y-5">
                                {cvData.education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-bold text-sm">{edu.degree}</div>
                                        <div className="text-xs opacity-90">{edu.school}</div>
                                        <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1"><Calendar size={10}/> {edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications (Sidebar) */}
                    {cvData.certifications.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2 opacity-90">Certifications</h3>
                            <div className="space-y-4">
                                {cvData.certifications.map(cert => (
                                    <div key={cert.id}>
                                        <div className="font-bold text-sm">{cert.name}</div>
                                        <div className="text-xs opacity-90">{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</div>
                                        {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-[10px] underline opacity-70 hover:opacity-100 flex items-center gap-1 mt-0.5"><ExternalLink size={8} /> Credential</a>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {cvData.skills.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2 opacity-90">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {cvData.skills.map(s => (
                                    <span key={s} className="px-2 py-1 bg-white/10 rounded text-[10px] sm:text-xs font-semibold backdrop-blur-sm border border-white/10">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Invisible Spacer Float (Pushes content right on Page 1) */}
            <div className="float-left w-[32%] h-[297mm] shape-outside-margin-box"></div>

            {/* 4. Main Content (Flows around spacer) */}
            <div className="relative p-8 sm:p-10 w-full" style={{ boxSizing: 'border-box' }}>
                <header className="mb-10 pb-6 border-b-2 border-slate-100">
                    <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-2 leading-none break-words" style={{ color: cvData.theme.text }}>{cvData.personal.fullName || "Your Name"}</h1>
                    <p className="text-xl font-light text-slate-500 tracking-wide">{cvData.personal.jobTitle || "Job Title"}</p>
                </header>

                <div className="space-y-10">
                    {/* Summary */}
                    {cvData.personal.summary && (
                        <div className="relative">
                            <div className="absolute -left-4 top-1 w-1 h-full bg-slate-100 rounded-full hidden sm:block"></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: cvData.theme.primary }}>
                                <UserIcon size={16}/> Professional Profile
                            </h3>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-600">{cvData.personal.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {cvData.experience.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: cvData.theme.primary }}>
                                <Briefcase size={16}/> Experience
                            </h3>
                            <div className="space-y-8">
                                {cvData.experience.map(exp => (
                                    <div key={exp.id} className="group break-inside-avoid">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{exp.title}</h4>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded inline-block w-fit mt-1 sm:mt-0">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                        </div>
                                        <div className="text-sm font-semibold mb-3 flex items-center gap-2 flex-wrap" style={{ color: cvData.theme.primary }}>
                                            {exp.company} {exp.location && <span className="text-slate-300 font-light hidden sm:inline">|</span>} {exp.location}
                                        </div>
                                        <div className="text-sm leading-relaxed text-slate-600 rich-text-content prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Clear fix for float */}
            <div className="clear-both"></div>
        </div>
    );

    // --- Template: Classic ---
    const ClassicTemplate = () => (
        <div className="flex flex-col min-h-[29.7cm] p-8 sm:p-12 bg-[#fdfbf7] text-slate-900 font-serif relative shadow-sm">
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: cvData.theme.primary }}></div>

            <header className="text-center mb-10 border-b-4 border-double border-slate-200 pb-8">
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-wide text-slate-900">{cvData.personal.fullName || "Your Name"}</h1>
                <p className="text-xl italic text-slate-600 mb-6 font-medium">{cvData.personal.jobTitle || "Job Title"}</p>
                
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-sans text-slate-600 uppercase tracking-wider">
                     {cvData.personal.email && <span className="flex items-center gap-1"><Mail size={12}/> {cvData.personal.email}</span>}
                     {cvData.personal.phone && <span className="flex items-center gap-1"><Phone size={12}/> {cvData.personal.phone}</span>}
                     {cvData.personal.linkedin && <span className="flex items-center gap-1"><Linkedin size={12}/> LinkedIn</span>}
                </div>
            </header>

            <div className="space-y-8">
                {cvData.personal.summary && (
                    <section>
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1 flex items-center gap-3" style={{ color: cvData.theme.text }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Summary
                        </h3>
                        <p className="text-base leading-relaxed text-justify">{cvData.personal.summary}</p>
                    </section>
                )}

                {cvData.experience.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-300 mb-6 pb-1 flex items-center gap-3" style={{ color: cvData.theme.text }}>
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Experience
                        </h3>
                        <div className="space-y-8">
                            {cvData.experience.map(exp => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-2">
                                        <div>
                                            <h4 className="font-bold text-xl text-slate-900">{exp.title}</h4>
                                            <div className="text-base italic font-medium" style={{ color: cvData.theme.primary }}>{exp.company}, {exp.location}</div>
                                        </div>
                                        <span className="text-sm font-sans font-bold text-slate-500 bg-white px-2 py-1 border border-slate-200 inline-block w-fit mt-1 sm:mt-0">{exp.startDate} – {exp.endDate || 'Present'}</span>
                                    </div>
                                    <div className="text-base leading-relaxed text-slate-700 pl-4 border-l-2 border-slate-200 rich-text-content" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {cvData.education.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-300 mb-6 pb-1 flex items-center gap-3" style={{ color: cvData.theme.text }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Education
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {cvData.education.map(edu => (
                                <div key={edu.id} className="bg-white p-4 border border-slate-200 shadow-sm break-inside-avoid">
                                    <div className="font-bold text-lg text-slate-900 mb-1">{edu.school}</div>
                                    <div className="text-base italic text-slate-600 mb-2">{edu.degree}</div>
                                    <div className="text-xs font-sans text-slate-400 uppercase tracking-wider">{edu.year} • {edu.location}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {cvData.certifications.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-300 mb-6 pb-1 flex items-center gap-3" style={{ color: cvData.theme.text }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Certifications
                        </h3>
                        <div className="space-y-4">
                            {cvData.certifications.map(cert => (
                                <div key={cert.id} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-lg text-slate-900">{cert.name}</h4>
                                        <span className="text-sm font-sans text-slate-500">{cert.date}</span>
                                    </div>
                                    <div className="text-base italic text-slate-600 mb-1">{cert.issuer}</div>
                                    {cert.description && <p className="text-sm text-slate-700 leading-relaxed mb-1">{cert.description}</p>}
                                    {cert.url && <a href={cert.url} className="text-xs text-indigo-600 underline">View Credential</a>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );

    // --- Template: Minimal ---
    const MinimalTemplate = () => (
        <div className="flex flex-col min-h-[29.7cm] p-8 sm:p-12 bg-white font-sans text-slate-800 shadow-sm">
             <header className="mb-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-8">
                    <h1 className="text-5xl sm:text-6xl font-light tracking-tight mb-4 text-slate-900 leading-tight">{cvData.personal.fullName || "Your Name"}</h1>
                    <p className="text-2xl text-slate-400 font-normal tracking-wide">{cvData.personal.jobTitle || "Job Title"}</p>
                </div>
                <div className="md:col-span-4 md:text-right space-y-1 text-sm font-medium text-slate-500">
                     {cvData.personal.email && <div>{cvData.personal.email}</div>}
                     {cvData.personal.phone && <div>{cvData.personal.phone}</div>}
                     {cvData.personal.address && <div>{cvData.personal.address}</div>}
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-8 space-y-12">
                     {cvData.personal.summary && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">Profile</h3>
                            <p className="text-lg leading-relaxed text-slate-800 font-light">{cvData.personal.summary}</p>
                        </section>
                    )}

                    {cvData.experience.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-8">Work Experience</h3>
                            <div className="space-y-10">
                                {cvData.experience.map(exp => (
                                    <div key={exp.id} className="relative pl-8 border-l border-slate-200 break-inside-avoid">
                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-300"></div>
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-2">
                                            <h4 className="font-bold text-xl text-slate-900">{exp.title}</h4>
                                            <span className="text-xs font-mono text-slate-400">{exp.startDate} — {exp.endDate || 'Present'}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 mb-4">{exp.company}</div>
                                        <div className="text-sm leading-7 text-slate-600 rich-text-content opacity-90" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="md:col-span-4 space-y-12">
                    {cvData.skills.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">Expertise</h3>
                            <div className="flex flex-col gap-3">
                                {cvData.skills.map(s => (
                                    <div key={s} className="text-sm font-medium text-slate-700 pb-2 border-b border-slate-50">{s}</div>
                                ))}
                            </div>
                        </section>
                    )}

                    {cvData.education.length > 0 && (
                         <section>
                            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">Education</h3>
                            <div className="space-y-8">
                                {cvData.education.map(edu => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <div className="font-bold text-base text-slate-900 leading-tight mb-1">{edu.school}</div>
                                        <div className="text-sm text-slate-600 mb-2">{edu.degree}</div>
                                        <div className="text-xs font-mono text-slate-400">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {cvData.certifications.length > 0 && (
                         <section>
                            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">Certifications</h3>
                            <div className="space-y-6">
                                {cvData.certifications.map(cert => (
                                    <div key={cert.id} className="break-inside-avoid">
                                        <div className="font-bold text-sm text-slate-900 mb-1">{cert.name}</div>
                                        <div className="text-xs text-slate-500 mb-1">{cert.issuer} • {cert.date}</div>
                                        {cert.url && <a href={cert.url} className="text-[10px] text-slate-400 underline hover:text-indigo-600 block">Link</a>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

    // --- Template: Professional ---
    const ProfessionalTemplate = () => (
        <div className="flex flex-col min-h-[29.7cm] bg-white text-slate-900 font-sans shadow-sm">
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">{cvData.personal.fullName || "Your Name"}</h1>
                        <p className="text-xl font-light text-slate-300 tracking-wide">{cvData.personal.jobTitle || "Job Title"}</p>
                    </div>
                    <div className="text-sm space-y-1 text-slate-300">
                        {cvData.personal.email && <div className="flex items-center gap-2"><Mail size={14} /> {cvData.personal.email}</div>}
                        {cvData.personal.phone && <div className="flex items-center gap-2"><Phone size={14} /> {cvData.personal.phone}</div>}
                        {cvData.personal.linkedin && <div className="flex items-center gap-2"><Linkedin size={14} /> {cvData.personal.linkedin.split('/').pop()}</div>}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 space-y-10">
                {cvData.personal.summary && (
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-1 w-16 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                            <h3 className="text-base font-bold uppercase tracking-[0.2em] text-slate-700">Executive Summary</h3>
                        </div>
                        <p className="text-base leading-relaxed text-slate-600 pl-4 border-l-4 border-slate-200">{cvData.personal.summary}</p>
                    </section>
                )}

                {cvData.experience.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-1 w-16 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                            <h3 className="text-base font-bold uppercase tracking-[0.2em] text-slate-700">Professional Experience</h3>
                        </div>
                        <div className="space-y-8">
                            {cvData.experience.map(exp => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-2 pb-2 border-b-2 border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-xl text-slate-900">{exp.title}</h4>
                                            <div className="text-base font-semibold mt-1" style={{ color: cvData.theme.primary }}>{exp.company} • {exp.location}</div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block w-fit mt-2 sm:mt-0 uppercase tracking-wide">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                    </div>
                                    <div className="text-base leading-relaxed text-slate-600 mt-3 rich-text-content" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {cvData.education.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">Education</h3>
                            </div>
                            <div className="space-y-5">
                                {cvData.education.map(edu => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <div className="font-bold text-lg text-slate-900">{edu.degree}</div>
                                        <div className="text-base text-slate-600 font-medium mt-1">{edu.school}</div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {cvData.skills.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">Core Competencies</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {cvData.skills.map(s => (
                                    <span key={s} className="px-3 py-1.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-300 transition-colors">{s}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

    // --- Template: Creative ---
    const CreativeTemplate = () => (
        <div className="flex flex-col min-h-[29.7cm] bg-white text-slate-900 font-sans relative overflow-hidden shadow-sm">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl -z-0 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-100 to-orange-100 dark:from-pink-900/20 dark:to-orange-900/20 rounded-full blur-3xl -z-0 opacity-30"></div>

            {/* Side Accent */}
            <div className="absolute right-0 top-32 bottom-32 w-1.5 rounded-full" style={{ background: `linear-gradient(to bottom, ${cvData.theme.primary}, transparent)`, opacity: 0.3 }}></div>

            {/* Content */}
            <div className="relative z-10 p-8 sm:p-10">
                {/* Header */}
                <header className="mb-12 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
                        <div className="flex-1">
                            <div className="inline-block mb-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: `${cvData.theme.primary}20`, color: cvData.theme.primary }}>
                                {cvData.personal.jobTitle || "Job Title"}
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-none bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent" style={{ transform: 'rotate(-1deg)', transformOrigin: 'left' }}>
                                {cvData.personal.fullName || "Your Name"}
                            </h1>
                            {cvData.personal.summary && (
                                <p className="text-lg leading-relaxed text-slate-600 max-w-2xl mt-6 italic border-l-4 pl-6" style={{ borderColor: cvData.theme.primary }}>
                                    {cvData.personal.summary}
                                </p>
                            )}
                        </div>

                        {cvData.personal.photoBase64 && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30"></div>
                                <img
                                    src={cvData.personal.photoBase64}
                                    alt="Profile"
                                    onLoad={() => setImageLoaded(true)}
                                    className={`relative w-32 h-32 object-cover border-4 border-white shadow-2xl ${cvData.personal.photoShape === 'circle' ? 'rounded-full' : cvData.personal.photoShape === 'rounded' ? 'rounded-3xl' : 'rounded-lg'} ${cvData.personal.photoFilter === 'grayscale' ? 'grayscale' : ''} ${!imageLoaded ? 'blur-sm scale-95 opacity-80' : 'scale-100 opacity-100'} transition-all duration-500`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-4 mt-8 text-sm text-slate-600">
                        {cvData.personal.email && <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200"><Mail size={14} className="opacity-60" /> {cvData.personal.email}</div>}
                        {cvData.personal.phone && <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200"><Phone size={14} className="opacity-60" /> {cvData.personal.phone}</div>}
                        {cvData.personal.linkedin && <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200"><Linkedin size={14} className="opacity-60" /> LinkedIn</div>}
                        {cvData.personal.website && <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200"><Globe size={14} className="opacity-60" /> {cvData.personal.website.replace(/^https?:\/\//, '')}</div>}
                    </div>
                </header>

                {/* Experience */}
                {cvData.experience.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                            Work Experience
                        </h3>
                        <div className="space-y-10">
                            {cvData.experience.map((exp, idx) => (
                                <div key={exp.id} className="relative pl-8 break-inside-avoid">
                                    <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-white shadow-md" style={{ backgroundColor: cvData.theme.primary }}></div>
                                    {idx < cvData.experience.length - 1 && (
                                        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 to-transparent"></div>
                                    )}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-3">
                                            <div>
                                                <h4 className="font-bold text-xl text-slate-900 mb-1">{exp.title}</h4>
                                                <div className="text-base font-semibold" style={{ color: cvData.theme.primary }}>{exp.company}</div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full inline-block w-fit mt-2 sm:mt-0">{exp.startDate} → {exp.endDate || 'Now'}</span>
                                        </div>
                                        <div className="text-sm leading-relaxed text-slate-600 rich-text-content" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {cvData.skills.length > 0 && (
                        <section className="sm:col-span-2">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                                Skills & Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {cvData.skills.map(s => (
                                    <span key={s} className="px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border-2 transition-all hover:shadow-md" style={{ borderColor: `${cvData.theme.primary}40`, color: cvData.theme.primary, backgroundColor: `${cvData.theme.primary}10` }}>{s}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {cvData.education.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: cvData.theme.primary }}></div>
                                Education
                            </h3>
                            <div className="space-y-5">
                                {cvData.education.map(edu => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <div className="font-bold text-base text-slate-900 leading-tight">{edu.degree}</div>
                                        <div className="text-sm text-slate-600 mt-1">{edu.school}</div>
                                        <div className="text-xs text-slate-400 mt-1 font-mono">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-full flex items-start justify-center py-4 overflow-auto">
            {/*
               A4 Container - FIXED at A4 size, scaled on mobile
               Mobile: CSS transform scales down to fit viewport
               Desktop: Full A4 size (210mm x 297mm)
               User can pinch-zoom on mobile for better readability
            */}
            <div
                ref={previewRef}
                className="bg-white shadow-2xl print:shadow-none origin-top"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    transform: 'scale(var(--cv-scale, 1))',
                    marginBottom: 'calc((297mm * (1 - var(--cv-scale, 1))))'
                }}
            >
                {cvData.template === 'modern' && <ModernTemplate />}
                {cvData.template === 'classic' && <ClassicTemplate />}
                {cvData.template === 'minimal' && <MinimalTemplate />}
                {cvData.template === 'professional' && <ProfessionalTemplate />}
                {cvData.template === 'creative' && <CreativeTemplate />}
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 640px) {
                    [style*="--cv-scale"] {
                        --cv-scale: calc((100vw - 32px) / 793px);
                    }
                }
                @media (min-width: 641px) and (max-width: 1024px) {
                    [style*="--cv-scale"] {
                        --cv-scale: 0.7;
                    }
                }
            `}} />
        </div>
    );
});

export default CvPreview;
