
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  PenTool, 
  Globe, 
  FileText, 
  Mail, 
  BarChart, 
  Share2, 
  Zap,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

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

const LandingPage: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-48 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>

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
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transform duration-200"
            >
              {t('hero.startFree')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/product"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hover:-translate-y-0.5 transform duration-200"
            >
              {t('hero.viewFeatures')}
            </Link>
          </div>
          
          <div className="mt-16 relative mx-auto max-w-5xl">
             <div className="bg-slate-900 dark:bg-slate-950 rounded-xl shadow-2xl p-2 md:p-4 ring-1 ring-slate-900/5 dark:ring-slate-800">
                <div className="aspect-[16/9] bg-slate-800 dark:bg-slate-900 rounded-lg overflow-hidden relative">
                    {/* Mock Interface showing off the product */}
                    <div className="absolute inset-0 flex">
                        <div className="w-1/4 border-r border-slate-700 p-4 hidden md:block">
                            <div className="space-y-3">
                                <div className="h-2 w-20 bg-slate-600 rounded opacity-50"></div>
                                <div className="h-8 bg-slate-700 rounded w-full"></div>
                                <div className="h-8 bg-slate-700/50 rounded w-full"></div>
                                <div className="h-8 bg-slate-700/50 rounded w-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-6 md:p-8">
                             <div className="flex justify-between items-center mb-6">
                                 <div className="h-4 w-32 bg-indigo-500 rounded"></div>
                                 <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
                             </div>
                             <div className="space-y-3">
                                <div className="h-2 w-full bg-slate-600 rounded opacity-50"></div>
                                <div className="h-2 w-full bg-slate-600 rounded opacity-50"></div>
                                <div className="h-2 w-3/4 bg-slate-600 rounded opacity-50"></div>
                             </div>
                             <div className="mt-8 p-4 bg-slate-700/30 rounded border border-slate-700 border-dashed">
                                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                    <Zap size={16} className="animate-pulse" /> <span className="text-xs font-mono">{t('hero.generating')}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-600/50 rounded animate-pulse"></div>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">{t('landing.logos')}</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
                {/* Placeholder Logos - using text for now but would be SVGs */}
                <span className="text-xl font-black text-slate-800 dark:text-slate-400">ACME Corp</span>
                <span className="text-xl font-bold italic text-slate-800 dark:text-slate-400">GlobalTech</span>
                <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-400">StarkInd</span>
                <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-400">WayneEnt</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-400">Cyberdyne</span>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-900 py-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{t('landing.stats.wordsVal')}</div>
                      <div className="text-indigo-200 text-sm font-medium uppercase tracking-wide">{t('landing.stats.words')}</div>
                  </div>
                  <div>
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{t('landing.stats.usersVal')}</div>
                      <div className="text-indigo-200 text-sm font-medium uppercase tracking-wide">{t('landing.stats.users')}</div>
                  </div>
                  <div>
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{t('landing.stats.ratingVal')}</div>
                      <div className="text-indigo-200 text-sm font-medium uppercase tracking-wide">{t('landing.stats.rating')}</div>
                  </div>
                  <div>
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{t('landing.stats.uptimeVal')}</div>
                      <div className="text-indigo-200 text-sm font-medium uppercase tracking-wide">{t('landing.stats.uptime')}</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
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
              icon={<BarChart />} 
              title={t('features.data')}
              description={t('features.dataDesc')}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">Trusted by 10,000+ Writers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Sarah J.", role: "Marketing Director", text: "This tool saved me hours on product copy. The tone adjustment is incredible." },
                    { name: "David L.", role: "Freelance Writer", text: "I use the blog generator to outline my articles. It's like having a brilliant co-writer." },
                    { name: "Emily R.", role: "Job Seeker", text: "The CV builder helped me land interviews at top tech companies. Highly recommended!" }
                ].map((t, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1 text-yellow-400 mb-4">
                            {[1,2,3,4,5].map(s => <Sparkles key={s} size={16} className="fill-current" />)}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 italic leading-relaxed">"{t.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
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
      <section className="py-20 bg-white dark:bg-slate-950">
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
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
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
