import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  PenTool, 
  Globe, 
  FileText, 
  Mail, 
  Share2, 
  Zap,
  Sparkles,
  ChevronDown,
  Check,
  CheckCircle2,
  XCircle,
  Briefcase,
  Layers,
  Copy,
  Image as ImageIcon
} from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { CVData } from '../types';
import { Modal } from '../components/ui/Modal';
import { getTools, IconMap } from '../config/tools';
import CvPreview from '../features/cv/CvPreview';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all hover:-translate-y-1 group">
    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
  </div>
);

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button 
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base font-medium text-slate-900 dark:text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const ToolModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useThemeLanguage();
    const tools = getTools(t);
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="All 18 Tools" size="lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tools.map(tool => {
                    const Icon = IconMap[tool.icon] || FileText;
                    return (
                        <Link to={`/dashboard?tool=${tool.id}`} key={tool.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                <Icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tool.name}</h4>
                                <p className="text-xs text-slate-500">{tool.category}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </Modal>
    );
}

// Sample Data for Showcase
const SAMPLE_CV_DATA: CVData = {
    template: 'modern',
    theme: { name: 'Midnight Blue', primary: '#1e3a8a', secondary: '#eff6ff', text: '#1e293b' },
    personal: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 555 0192',
        address: 'New York, NY',
        website: 'alexmorgan.design',
        linkedin: 'in/alexmorgan',
        jobTitle: 'Senior Product Designer',
        summary: 'Creative lead with 8+ years of experience in digital product design. Specialized in building accessible, user-centric interfaces for fintech applications. Proven track record of leading teams and increasing user engagement by 40%.',
        photoBase64: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        photoShape: 'circle',
        photoFilter: 'none'
    },
    experience: [
        {
            id: '1', title: 'Lead Product Designer', company: 'TechFlow', location: 'Remote', startDate: '2020', endDate: 'Present', current: true,
            description: '<ul><li>Spearheaded the redesign of the mobile banking app, resulting in a 40% increase in daily active users.</li><li>Managed a team of 5 designers, conducting weekly critiques and mentorship sessions.</li><li>Implemented a new design system that reduced development time by 25%.</li></ul>'
        },
        {
            id: '2', title: 'UI/UX Designer', company: 'Creative Solutions', location: 'San Francisco, CA', startDate: '2017', endDate: '2020', current: false,
            description: '<ul><li>Designed intuitive interfaces for e-commerce clients, increasing conversion rates by an average of 15%.</li><li>Collaborated with developers to ensure pixel-perfect implementation of designs.</li></ul>'
        }
    ],
    education: [
        { id: '1', degree: 'BFA in Interaction Design', school: 'California College of the Arts', location: 'San Francisco', year: '2016' }
    ],
    skills: ['Figma', 'Prototyping', 'User Research', 'HTML/CSS', 'Design Systems', 'Agile'],
    certifications: [],
    languages: []
};

const LandingPage: React.FC = () => {
  const { t, currency } = useThemeLanguage();
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'cv' | 'translate' | 'social'>('cv');
  const dummyPreviewRef = useRef<HTMLDivElement>(null); // For CvPreview prop

  // Pricing Calculation based on Currency
  const symbol = currency === 'EUR' ? '€' : '$';
  const multiplier = currency === 'EUR' ? 1 : 1.15; // Approx logic, manual override below for clean numbers
  
  const getPrice = (eur: number) => {
      if (currency === 'EUR') return eur;
      // Simple custom round numbers for USD
      if (eur === 49) return 59;
      if (eur === 12) return 15;
      if (eur === 40) return 45;
      if (eur === 20) return 25;
      if (eur === 121) return 144;
      if (eur === 39) return 45;
      if (eur === 82) return 99;
      return Math.ceil(eur * multiplier);
  };

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      <ToolModal isOpen={isToolsModalOpen} onClose={() => setIsToolsModalOpen(false)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-8 shadow-sm animate-fade-in-up backdrop-blur-sm">
            <Zap size={16} className="fill-indigo-700 dark:fill-indigo-300" />
            <span>{t('hero.poweredBy')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
            {t('hero.titlePart1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{t('hero.titleHighlight')}</span> <br className="hidden md:block" />
            {t('hero.titlePart2')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transform duration-200"
            >
              {t('hero.startFree')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsToolsModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hover:-translate-y-0.5 transform duration-200"
            >
              {t('hero.viewFeatures')}
            </button>
          </div>

          {/* Value Proof Bar */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-slate-600 dark:text-slate-400 animate-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> 2,000 FREE words/month</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> No credit card</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> 18 specialized tools</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Works in browser</div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Before/After) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('landing.comparison.title')}</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">{t('landing.comparison.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Without */}
                  <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('landing.comparison.withoutTitle')}</h3>
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><XCircle className="text-red-500 shrink-0" size={20}/> <span>{symbol}{getPrice(49)}/mo {t('landing.comparison.items.jasper')}</span></li>
                          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><XCircle className="text-red-500 shrink-0" size={20}/> <span>{symbol}{getPrice(12)}/mo {t('landing.comparison.items.grammarly')}</span></li>
                          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><XCircle className="text-red-500 shrink-0" size={20}/> <span>{symbol}{getPrice(40)}/mo {t('landing.comparison.items.resumake')}</span></li>
                          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400"><XCircle className="text-red-500 shrink-0" size={20}/> <span>{symbol}{getPrice(20)}/mo {t('landing.comparison.items.deepl')}</span></li>
                      </ul>
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('landing.comparison.total')}</p>
                          <p className="text-4xl font-bold text-slate-900 dark:text-white">{symbol}{getPrice(121)}<span className="text-lg text-slate-500 font-normal">{t('landing.comparison.month')}</span></p>
                      </div>
                  </div>

                  {/* With */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border-2 border-indigo-500 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{t('landing.comparison.bestValue')}</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('landing.comparison.withTitle')}</h3>
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-center gap-3 text-slate-800 dark:text-white font-medium"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span>{t('landing.comparison.features.content')}</span></li>
                          <li className="flex items-center gap-3 text-slate-800 dark:text-white font-medium"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span>{t('landing.comparison.features.editor')}</span></li>
                          <li className="flex items-center gap-3 text-slate-800 dark:text-white font-medium"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span>{t('landing.comparison.features.cv')}</span></li>
                          <li className="flex items-center gap-3 text-slate-800 dark:text-white font-medium"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span>{t('landing.comparison.features.trans')}</span></li>
                      </ul>
                      <div className="pt-6 border-t border-indigo-200 dark:border-indigo-800/50">
                          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1">{t('landing.comparison.total')}</p>
                          <div className="flex items-end gap-3">
                              <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{symbol}{getPrice(39)}<span className="text-lg text-indigo-600/70 dark:text-indigo-400/70 font-normal">{t('landing.comparison.month')}</span></p>
                              <span className="mb-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">{t('landing.comparison.save')} {symbol}{getPrice(82)}/{t('landing.comparison.month').replace('/', '').toUpperCase()}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Interactive Tool Showcase */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">See It In Action</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                {['cv', 'translate', 'social'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveDemoTab(tab as any)}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeDemoTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        {tab === 'cv' ? 'CV Builder' : tab === 'translate' ? 'Translator' : 'Social Post'}
                    </button>
                ))}
            </div>

            {/* Visual Demo Area */}
            <div className="bg-slate-900 rounded-2xl p-4 md:p-8 shadow-2xl border border-slate-800 relative overflow-hidden min-h-[500px] flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-10 bg-slate-800 flex items-center px-4 gap-2 z-10 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                <div className="w-full h-full flex items-center justify-center pt-8 overflow-hidden">
                    {activeDemoTab === 'cv' && (
                        <div className="w-full max-w-[900px] h-[450px] bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex shadow-2xl animate-in fade-in zoom-in-95">
                            {/* Editor Side */}
                            <div className="w-1/3 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 hidden md:block">
                                <div className="space-y-2">
                                    <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-2">
                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                                        <div className="h-1.5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 mt-4">
                                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold mb-2"><Sparkles size={12}/> AI Analysis</div>
                                    <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-800 rounded mb-1"></div>
                                    <div className="h-1.5 w-3/4 bg-indigo-200 dark:bg-indigo-800 rounded"></div>
                                </div>
                            </div>
                            {/* Preview Side */}
                            <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-4 flex justify-center overflow-hidden relative">
                                <div className="transform scale-[0.6] origin-top shadow-xl">
                                    <CvPreview cvData={SAMPLE_CV_DATA} previewRef={dummyPreviewRef} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeDemoTab === 'translate' && (
                        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between mb-4 text-sm font-bold text-slate-500">
                                    <span>English (Detected)</span>
                                </div>
                                <p className="text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                                    "Our marketing strategy for Q4 focuses on organic growth and community engagement. We need to prioritize authentic storytelling over aggressive sales tactics."
                                </p>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800 relative">
                                <div className="flex justify-between mb-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    <span>German</span>
                                    <Copy size={16} className="cursor-pointer"/>
                                </div>
                                <p className="text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                                    "Unsere Marketingstrategie für das 4. Quartal konzentriert sich auf organisches Wachstum und das Engagement der Community. Wir müssen authentisches Storytelling gegenüber aggressiven Verkaufstaktiken priorisieren."
                                </p>
                                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-slate-400">
                                    <Sparkles size={12}/> AI Translated
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeDemoTab === 'social' && (
                        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500"></div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Genius Writer</div>
                                        <div className="text-xs text-slate-500">@genius_writer • Just now</div>
                                    </div>
                                </div>
                                <div className="text-slate-400">...</div>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 text-base mb-4 leading-relaxed">
                                Stop juggling 5 different AI tools. 🤹‍♂️ <br/><br/>
                                Meet the all-in-one platform that handles your CVs, translations, emails, and content creation. <br/><br/>
                                Save time. Save money. Create more. ✨<br/><br/>
                                <span className="text-indigo-600">#AI #Productivity #WritingTools</span>
                            </p>
                            <div className="h-48 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-300 mb-4 border border-indigo-100 dark:border-indigo-800/50">
                                <ImageIcon size={32} />
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm px-2">
                                <span>💬 24</span>
                                <span>Example Post</span>
                                <span>❤️ 142</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-center mt-8">
                <Link to="/dashboard" className="text-indigo-600 font-bold hover:underline">Try it yourself &rarr;</Link>
            </div>
        </div>
      </section>

      {/* Features Grid (Simplified) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">{t('features.label')}</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('features.title')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe />} 
              title={t('features.translate')}
              description={t('features.translateDesc')}
            />
            <FeatureCard 
              icon={<FileText />} 
              title={t('features.cv')}
              description={t('features.cvDesc')}
            />
            <FeatureCard 
              icon={<Mail />} 
              title={t('features.email')}
              description={t('features.emailDesc')}
            />
            <FeatureCard 
              icon={<PenTool />} 
              title={t('features.blog')} 
              description={t('features.blogDesc')}
            />
            <FeatureCard 
              icon={<Share2 />} 
              title={t('features.social')}
              description={t('features.socialDesc')}
            />
            <FeatureCard 
              icon={<Layers />} 
              title="And 12 More Tools"
              description="From Interview Prep to Startup Validator. We have a template for everything."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">Join 5,000+ writers who switched</h2>
            <p className="text-center text-slate-500 mb-12">Don't just take our word for it.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Sarah K.", role: "Content Creator", text: "I cancelled my Jasper subscription. This has everything I need." },
                    { name: "Marcus T.", role: "Software Engineer", text: "The CV builder got me 3 interviews in one week. ATS optimization works!" },
                    { name: "Elena R.", role: "Freelancer", text: "I translate client docs daily. This is faster than DeepL and it's included." }
                ].map((t, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1 text-yellow-400 mb-4">
                            {[1,2,3,4,5].map(s => <Sparkles key={s} size={16} className="fill-current" />)}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 italic leading-relaxed">"{t.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">{t('landing.faq.title')}</h2>
              <div className="space-y-2">
                  <FAQItem question={t('landing.faq.q1')} answer={t('landing.faq.a1')} />
                  <FAQItem question={t('landing.faq.q2')} answer={t('landing.faq.a2')} />
                  <FAQItem question={t('landing.faq.q3')} answer={t('landing.faq.a3')} />
                  <FAQItem question={t('landing.faq.q4')} answer={t('landing.faq.a4')} />
              </div>
          </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-slate-950">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-8 md:p-16 text-center text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">{t('product.ready')}</h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">{t('hero.subtitle')}</p>
                <Link to="/dashboard" className="relative z-10 inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
                    {t('nav.getStarted')}
                </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default LandingPage;