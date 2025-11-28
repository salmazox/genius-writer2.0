
import React from 'react';
import { User as UserIcon, Briefcase, Mail, Phone, MapPin, Globe, Linkedin, Calendar, Award } from 'lucide-react';
import { CVData } from '../../types';
import { sanitizeHtml } from '../../utils/security';

interface CvPreviewProps {
    cvData: CVData;
    previewRef: React.RefObject<HTMLDivElement>;
}

// Memoize to prevent unnecessary re-renders during form edits unless data changes
const CvPreview: React.FC<CvPreviewProps> = React.memo(({ cvData, previewRef }) => {
    
    const createMarkup = (htmlContent: string) => {
        return { __html: sanitizeHtml(htmlContent) };
    };

    // --- Template: Modern (Sidebar, bold colors) ---
    const ModernTemplate = () => (
        <div className="flex h-full min-h-[1056px] bg-white text-slate-800">
            {/* Sidebar */}
            <div className="w-[32%] p-8 flex flex-col text-white" style={{ backgroundColor: cvData.theme.primary }}>
                {cvData.personal.photoBase64 && (
                    <div className="mb-8 mx-auto flex justify-center">
                        <img 
                            src={cvData.personal.photoBase64} 
                            alt="Profile" 
                            className={`w-40 h-40 object-cover border-4 border-white/20 shadow-lg ${cvData.personal.photoShape === 'circle' ? 'rounded-full' : cvData.personal.photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none'} ${cvData.personal.photoFilter === 'grayscale' ? 'grayscale' : ''}`} 
                        />
                    </div>
                )}
                
                <div className="space-y-8">
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2 opacity-90">Contact</h3>
                        <div className="space-y-4 text-sm font-medium opacity-95">
                            {cvData.personal.email && <div className="break-words flex items-start gap-3"><Mail size={16} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.email}</span></div>}
                            {cvData.personal.phone && <div className="flex items-center gap-3"><Phone size={16} className="shrink-0 opacity-70"/> <span>{cvData.personal.phone}</span></div>}
                            {cvData.personal.address && <div className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.address}</span></div>}
                            {cvData.personal.website && <div className="break-words flex items-start gap-3"><Globe size={16} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.website}</span></div>}
                            {cvData.personal.linkedin && <div className="break-words flex items-start gap-3"><Linkedin size={16} className="mt-0.5 shrink-0 opacity-70"/> <span>{cvData.personal.linkedin}</span></div>}
                        </div>
                    </div>

                    {/* Education */}
                    {cvData.education.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2 opacity-90">Education</h3>
                            <div className="space-y-5">
                                {cvData.education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-bold text-base">{edu.degree}</div>
                                        <div className="text-sm opacity-90">{edu.school}</div>
                                        <div className="text-xs opacity-70 mt-1 flex items-center gap-1"><Calendar size={10}/> {edu.year}</div>
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
                                    <span key={s} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-semibold backdrop-blur-sm border border-white/10">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 bg-white">
                <header className="mb-10 pb-6 border-b-2 border-slate-100">
                    <h1 className="text-5xl font-extrabold uppercase tracking-tight mb-2 leading-none" style={{ color: cvData.theme.text }}>{cvData.personal.fullName || "Your Name"}</h1>
                    <p className="text-2xl font-light text-slate-500 tracking-wide">{cvData.personal.jobTitle || "Job Title"}</p>
                </header>

                <div className="space-y-10">
                    {/* Summary */}
                    {cvData.personal.summary && (
                        <div className="relative">
                            <div className="absolute -left-4 top-1 w-1 h-full bg-slate-100 rounded-full"></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: cvData.theme.primary }}>
                                <UserIcon size={18}/> Professional Profile
                            </h3>
                            <p className="text-base leading-relaxed text-slate-600">{cvData.personal.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {cvData.experience.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: cvData.theme.primary }}>
                                <Briefcase size={18}/> Experience
                            </h3>
                            <div className="space-y-8">
                                {cvData.experience.map(exp => (
                                    <div key={exp.id} className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{exp.title}</h4>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                        </div>
                                        <div className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: cvData.theme.primary }}>
                                            {exp.company} {exp.location && <span className="text-slate-300 font-light">|</span>} {exp.location}
                                        </div>
                                        <div className="text-sm leading-relaxed text-slate-600 rich-text-content prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // --- Template: Classic (Elegant Serif, Academic/Legal feel) ---
    const ClassicTemplate = () => (
        <div className="flex flex-col h-full min-h-[1056px] p-12 bg-[#fdfbf7] text-slate-900 font-serif relative">
            {/* Decorative border */}
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: cvData.theme.primary }}></div>

            <header className="text-center mb-10 border-b-4 border-double border-slate-200 pb-8">
                <h1 className="text-5xl font-bold mb-3 tracking-wide text-slate-900">{cvData.personal.fullName || "Your Name"}</h1>
                <p className="text-xl italic text-slate-600 mb-6 font-medium">{cvData.personal.jobTitle || "Job Title"}</p>
                
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-sans text-slate-600 uppercase tracking-wider">
                     {cvData.personal.email && <span className="flex items-center gap-1"><Mail size={12}/> {cvData.personal.email}</span>}
                     {cvData.personal.phone && <span className="flex items-center gap-1"><Phone size={12}/> {cvData.personal.phone}</span>}
                     {cvData.personal.address && <span className="flex items-center gap-1"><MapPin size={12}/> {cvData.personal.address}</span>}
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
                                <div key={exp.id}>
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <h4 className="font-bold text-xl text-slate-900">{exp.title}</h4>
                                            <div className="text-base italic font-medium" style={{ color: cvData.theme.primary }}>{exp.company}, {exp.location}</div>
                                        </div>
                                        <span className="text-sm font-sans font-bold text-slate-500 bg-white px-2 py-1 border border-slate-200">{exp.startDate} – {exp.endDate || 'Present'}</span>
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
                        <div className="grid grid-cols-2 gap-6">
                            {cvData.education.map(edu => (
                                <div key={edu.id} className="bg-white p-4 border border-slate-200 shadow-sm">
                                    <div className="font-bold text-lg text-slate-900 mb-1">{edu.school}</div>
                                    <div className="text-base italic text-slate-600 mb-2">{edu.degree}</div>
                                    <div className="text-xs font-sans text-slate-400 uppercase tracking-wider">{edu.year} • {edu.location}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {cvData.skills.length > 0 && (
                    <section>
                         <h3 className="text-lg font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1 flex items-center gap-3" style={{ color: cvData.theme.text }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Skills & Expertise
                        </h3>
                         <div className="flex flex-wrap gap-x-6 gap-y-2 text-base leading-relaxed">
                             {cvData.skills.map((s, i) => (
                                 <span key={s} className="flex items-center gap-2">
                                     {i > 0 && <span className="text-slate-300 text-xs">◆</span>}
                                     {s}
                                 </span>
                             ))}
                         </div>
                    </section>
                )}
            </div>
        </div>
    );

    // --- Template: Minimal (Clean, Grid-based, High readability) ---
    const MinimalTemplate = () => (
        <div className="flex flex-col h-full min-h-[1056px] p-12 bg-white font-sans text-slate-800">
             <header className="mb-16 grid grid-cols-12 gap-8 items-end">
                <div className="col-span-8">
                    <h1 className="text-6xl font-light tracking-tight mb-4 text-slate-900 leading-tight">{cvData.personal.fullName || "Your Name"}</h1>
                    <p className="text-2xl text-slate-400 font-normal tracking-wide">{cvData.personal.jobTitle || "Job Title"}</p>
                </div>
                <div className="col-span-4 text-right space-y-1 text-sm font-medium text-slate-500">
                     {cvData.personal.email && <div className="hover:text-slate-900 transition-colors">{cvData.personal.email}</div>}
                     {cvData.personal.phone && <div className="hover:text-slate-900 transition-colors">{cvData.personal.phone}</div>}
                     {cvData.personal.website && <div className="hover:text-slate-900 transition-colors">{cvData.personal.website}</div>}
                     {cvData.personal.address && <div className="hover:text-slate-900 transition-colors">{cvData.personal.address}</div>}
                </div>
            </header>
            
            <div className="grid grid-cols-12 gap-12">
                {/* Left Column (Main) */}
                <div className="col-span-8 space-y-12">
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
                                    <div key={exp.id} className="relative pl-8 border-l border-slate-200">
                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-300"></div>
                                        <div className="flex justify-between items-baseline mb-2">
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

                {/* Right Column (Sidebar info) */}
                <div className="col-span-4 space-y-12">
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
                                    <div key={edu.id}>
                                        <div className="font-bold text-base text-slate-900 leading-tight mb-1">{edu.school}</div>
                                        <div className="text-sm text-slate-600 mb-2">{edu.degree}</div>
                                        <div className="text-xs font-mono text-slate-400">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {cvData.languages.length > 0 && (
                        <section>
                             <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-6">Languages</h3>
                             <div className="space-y-2">
                                 {cvData.languages.map(l => (
                                     <div key={l.id} className="flex justify-between text-sm">
                                         <span className="text-slate-700">{l.language}</span>
                                         <span className="text-slate-400">{l.proficiency}</span>
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
        <div className="relative py-8 px-4 md:px-0">
            <div 
                ref={previewRef} 
                className="bg-white shadow-2xl transition-all duration-300 origin-top transform scale-[0.48] sm:scale-[0.6] md:scale-[0.85] lg:scale-[0.7] xl:scale-[0.8] 2xl:scale-100"
                style={{ width: '816px', minHeight: '1056px', marginBottom: '-40%' }}
            >
                {cvData.template === 'modern' && <ModernTemplate />}
                {cvData.template === 'classic' && <ClassicTemplate />}
                {cvData.template === 'minimal' && <MinimalTemplate />}
            </div>
        </div>
    );
});

export default CvPreview;
