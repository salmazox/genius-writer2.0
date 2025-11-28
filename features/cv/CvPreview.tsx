
import React from 'react';
import { User as UserIcon, Briefcase } from 'lucide-react';
import { CVData } from '../../types';
import { sanitizeHtml } from '../../utils/security';

interface CvPreviewProps {
    cvData: CVData;
    previewRef: React.RefObject<HTMLDivElement>;
}

// Memoize to prevent unnecessary re-renders during form edits unless data changes
const CvPreview: React.FC<CvPreviewProps> = React.memo(({ cvData, previewRef }) => {
    
    // Safety check for rich text rendering
    const createMarkup = (htmlContent: string) => {
        return { __html: sanitizeHtml(htmlContent) };
    };

    return (
        <div className="relative py-8 px-4 md:px-0">
            <div 
                ref={previewRef} 
                className={`bg-white shadow-2xl min-h-[1056px] w-[816px] transition-all duration-300 origin-top
                transform scale-[0.48] sm:scale-[0.6] md:scale-[0.85] lg:scale-[0.7] xl:scale-[0.8] 2xl:scale-100
                ${cvData.template === 'modern' ? 'font-sans' : cvData.template === 'classic' ? 'p-12 font-serif' : 'p-8 font-mono'}`}
                style={{ marginBottom: '-40%' }} // Negative margin to reduce whitespace from scaling
            >
                {cvData.template === 'modern' && (
                    <div className="flex h-full min-h-[1056px]">
                        <div className="w-[35%] p-8 flex flex-col" style={{ backgroundColor: cvData.theme.secondary, color: cvData.theme.text }}>
                            {cvData.personal.photoBase64 && (
                                <div className="mb-8 mx-auto flex justify-center">
                                    <img 
                                        src={cvData.personal.photoBase64} 
                                        alt="Profile" 
                                        className={`w-36 h-36 object-cover border-4 border-white shadow-md ${cvData.personal.photoShape === 'circle' ? 'rounded-full' : cvData.personal.photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none'} ${cvData.personal.photoFilter === 'grayscale' ? 'grayscale' : ''}`} 
                                    />
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2 opacity-80" style={{ borderColor: cvData.theme.primary, color: cvData.theme.primary }}>Contact</h3>
                                    <div className="space-y-3 text-sm opacity-90">
                                        <div className="break-words font-medium">{cvData.personal.email}</div>
                                        <div>{cvData.personal.phone}</div>
                                        <div>{cvData.personal.address}</div>
                                        {cvData.personal.website && <div className="break-words text-xs">{cvData.personal.website}</div>}
                                        {cvData.personal.linkedin && <div className="break-words text-xs">{cvData.personal.linkedin}</div>}
                                    </div>
                                </div>
                                {cvData.education.length > 0 && (
                                    <div>
                                         <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2 opacity-80" style={{ borderColor: cvData.theme.primary, color: cvData.theme.primary }}>Education</h3>
                                         <div className="space-y-4">
                                            {cvData.education.map(edu => (
                                                <div key={edu.id}>
                                                    <div className="font-bold text-sm">{edu.degree}</div>
                                                    <div className="text-sm opacity-90">{edu.school}</div>
                                                    <div className="text-xs opacity-75">{edu.year}</div>
                                                </div>
                                            ))}
                                         </div>
                                    </div>
                                )}
                                {cvData.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2 opacity-80" style={{ borderColor: cvData.theme.primary, color: cvData.theme.primary }}>Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.skills.map(s => <span key={s} className="px-2 py-1 bg-white rounded text-xs font-semibold shadow-sm text-slate-700">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 p-8 text-slate-800">
                            <header className="mb-8 border-b-2 border-slate-100 pb-8">
                                <h1 className="text-4xl font-bold uppercase tracking-tight mb-2" style={{ color: cvData.theme.primary }}>{cvData.personal.fullName || "Your Name"}</h1>
                                <p className="text-xl font-light text-slate-500">{cvData.personal.jobTitle || "Job Title"}</p>
                            </header>
                            <div className="mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: cvData.theme.primary }}><UserIcon size={16}/> Profile</h3>
                                <p className="text-sm leading-relaxed text-slate-600">{cvData.personal.summary || "Summary goes here..."}</p>
                            </div>
                            {cvData.experience.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: cvData.theme.primary }}><Briefcase size={16}/> Experience</h3>
                                    <div className="space-y-8 border-l-2 border-slate-100 pl-6 ml-1">
                                        {cvData.experience.map(exp => (
                                            <div key={exp.id}>
                                                <h4 className="font-bold text-lg text-slate-900">{exp.title}</h4>
                                                <p className="font-medium text-sm mb-3" style={{ color: cvData.theme.primary }}>{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                                                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">{exp.startDate} - {exp.endDate || 'Present'}</div>
                                                <div className="text-sm leading-relaxed text-slate-600 rich-text-content prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={createMarkup(exp.description)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Simplified fallback for other templates */}
                {cvData.template !== 'modern' && (
                     <div className="flex flex-col h-full min-h-[1056px] p-12 text-center items-center justify-center">
                        <p className="text-slate-400 mb-4">Preview for {cvData.template} template...</p>
                        <p className="text-slate-300 text-sm">(Switch to 'Modern' for full preview in this demo)</p>
                     </div>
                )}
            </div>
        </div>
    );
});

export default CvPreview;
