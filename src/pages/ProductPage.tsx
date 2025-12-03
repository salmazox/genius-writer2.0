
import React from 'react';
import { Layers, Shield, Zap, Users, Briefcase, PenTool, Lock, Server, EyeOff, Check, Cpu, Sparkles, MessageSquare, FileText, BarChart3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const ProductPage: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200 font-sans selection:bg-indigo-500/30">
      
      {/* Hero Header */}
      <div className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px] dark:opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <Sparkles size={12} />
            <span>Genius Writer Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            {t('product.title')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            {t('product.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        <div className="space-y-32">
          
          {/* Feature 1: AI Power (Left Align) */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/30 rotate-3">
                  <Zap size={28} />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{t('product.geminiTitle')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                  {t('product.geminiDesc')} We've fine-tuned the model to understand nuance, tone, and context better than standard chatbots.
                </p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><Check size={14} strokeWidth={3}/></div>
                        <span className="font-medium">Context-aware generation</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><Check size={14} strokeWidth={3}/></div>
                        <span className="font-medium">Real-time tone adjustment</span>
                    </li>
                </ul>
              </div>
              
              <div className="order-1 lg:order-2 relative">
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none text-sm text-slate-600 dark:text-slate-300">
                                Write a witty tweet about coffee being life fuel.
                            </div>
                        </div>
                        <div className="flex gap-4 items-start flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0"><Sparkles size={14}/></div>
                            <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none text-sm shadow-lg shadow-indigo-500/20">
                                "Decaf is just brown sadness water. ☕️ Give me the high-octane bean juice or give me sleep! #MondayMotivation #CoffeeLover"
                            </div>
                        </div>
                        <div className="flex gap-2 justify-center pt-2">
                             <span className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce"></span>
                             <span className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce delay-100"></span>
                             <span className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Templates (Right Align) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="relative">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 mt-8">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform duration-300">
                            <Briefcase className="text-blue-500 mb-3" size={24} />
                            <h4 className="font-bold text-slate-900 dark:text-white">CV Builder</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ATS-Optimized Resumes</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform duration-300">
                            <PenTool className="text-pink-500 mb-3" size={24} />
                            <h4 className="font-bold text-slate-900 dark:text-white">Blog Post</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SEO Article Generator</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform duration-300">
                            <MessageSquare className="text-green-500 mb-3" size={24} />
                            <h4 className="font-bold text-slate-900 dark:text-white">Social</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Viral Posts & Threads</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform duration-300">
                            <Cpu className="text-orange-500 mb-3" size={24} />
                            <h4 className="font-bold text-slate-900 dark:text-white">Translator</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nuance-aware Translate</p>
                        </div>
                    </div>
                 </div>
             </div>
             
             <div>
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-purple-500/30 -rotate-3">
                  <Layers size={28} />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{t('product.templatesTitle')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t('product.templatesDesc')} Our library is constantly expanding with specialized tools for every profession.
                </p>
                <div className="flex flex-wrap gap-2">
                    {['Marketing', 'Sales', 'HR', 'Engineering', 'Founders'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-sm font-semibold rounded-full border border-purple-100 dark:border-purple-800">
                            {tag}
                        </span>
                    ))}
                </div>
             </div>
          </div>

          {/* Feature 3: Smart Editor & Analysis Tools */}
          <div className="group relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-1 lg:order-1">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-green-500/30 rotate-3">
                  <FileText size={28} />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">Smart Editor with Real-Time Analysis</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                  Write long-form content with confidence. Our Smart Editor provides instant feedback on SEO, readability, plagiarism, and ATS scoring as you type.
                </p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><BarChart3 size={14} strokeWidth={3}/></div>
                        <span className="font-medium">Real-time SEO & readability scoring</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><Search size={14} strokeWidth={3}/></div>
                        <span className="font-medium">AI plagiarism detection</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><Briefcase size={14} strokeWidth={3}/></div>
                        <span className="font-medium">ATS optimization for CVs</span>
                    </li>
                </ul>
              </div>

              <div className="order-2 lg:order-2 relative">
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2 items-center">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <span className="ml-4 text-xs font-bold text-slate-600 dark:text-slate-400">SmartEditor.docx</span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">SEO Score</span>
                                <span className="text-lg font-bold text-green-600">82/100</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">Readability</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">Grade 8</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">ATS Score</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">94%</div>
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 flex items-start gap-2">
                            <Check size={16} className="text-green-600 mt-0.5"/>
                            <div className="text-xs text-green-700 dark:text-green-400">
                                <span className="font-bold">No plagiarism detected</span>
                                <p className="text-green-600 dark:text-green-500 mt-1">Content is 98% original</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Personas */}
          <div>
              <div className="text-center mb-16">
                   <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('product.personas.title')}</h2>
                   <p className="text-slate-600 dark:text-slate-400">Tailored experiences for every type of writer.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { 
                          icon: <Briefcase size={32} />, 
                          title: t('product.personas.jobSeekers'), 
                          desc: t('product.personas.jobSeekersDesc'),
                          color: 'bg-blue-500',
                          lightColor: 'bg-blue-50 text-blue-600'
                      },
                      { 
                          icon: <PenTool size={32} />, 
                          title: t('product.personas.creators'), 
                          desc: t('product.personas.creatorsDesc'),
                          color: 'bg-pink-500',
                          lightColor: 'bg-pink-50 text-pink-600'
                      },
                      { 
                          icon: <Users size={32} />, 
                          title: t('product.personas.agencies'), 
                          desc: t('product.personas.agenciesDesc'),
                          color: 'bg-orange-500',
                          lightColor: 'bg-orange-50 text-orange-600'
                      }
                  ].map((p, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                          <div className={`w-16 h-16 rounded-2xl ${p.lightColor} dark:bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                              {p.icon}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{p.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* Section: Security */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 dark:bg-black border border-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-green-500/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 p-10 md:p-20">
                  <div className="flex-1 space-y-8">
                      <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 border border-green-500/20">
                          <Shield size={32} />
                      </div>
                      <h2 className="text-4xl font-bold text-white leading-tight">{t('product.security.title')}</h2>
                      <p className="text-slate-400 text-lg leading-relaxed">{t('product.security.desc')}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {[
                               { icon: Check, text: t('product.security.feature1') },
                               { icon: Lock, text: t('product.security.feature2') },
                               { icon: EyeOff, text: t('product.security.feature3') },
                               { icon: Server, text: "99.9% Uptime SLA" },
                           ].map((f, i) => (
                               <div key={i} className="flex items-center gap-3 text-slate-300">
                                   <div className="p-1 rounded-full bg-green-500/20 text-green-400"><f.icon size={14} /></div>
                                   <span className="font-medium">{f.text}</span>
                               </div>
                           ))}
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full max-w-md">
                      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative">
                          <div className="absolute -top-4 -right-4 bg-green-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-green-500/20 flex items-center gap-1">
                              <Lock size={12}/> SECURE
                          </div>
                          <div className="space-y-6">
                              <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                                  <span className="text-slate-400 text-sm">Encryption Status</span>
                                  <span className="text-green-400 font-mono text-sm">AES-256 Enabled</span>
                              </div>
                              <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                                  <span className="text-slate-400 text-sm">Data Residency</span>
                                  <span className="text-white font-medium text-sm">EU (Frankfurt)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-sm">Access Logs</span>
                                  <span className="text-white font-medium text-sm">Retention: 30 Days</span>
                              </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                               <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Compliance</p>
                               <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                                   <span className="font-bold text-white">SOC2</span>
                                   <span className="font-bold text-white">GDPR</span>
                                   <span className="font-bold text-white">CCPA</span>
                               </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
       <div className="bg-white dark:bg-slate-900 py-24 text-center border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">{t('product.ready')}</h2>
             <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-indigo-900/20"
            >
              {t('hero.startFree')}
            </Link>
            <p className="mt-6 text-sm text-slate-500">No credit card required for free tier.</p>
       </div>
    </div>
  );
};

export default ProductPage;
