
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Send } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  const { t } = useThemeLanguage();
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
               <Logo size={32} />
              <span className="font-bold text-xl text-white tracking-tight">Genius Writer</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-indigo-600"><Twitter size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-indigo-600"><Github size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-indigo-600"><Linkedin size={18} /></a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">{t('footer.product')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/product" className="text-slate-400 hover:text-indigo-400 transition-colors">{t('nav.product')}</Link></li>
              <li><Link to="/pricing" className="text-slate-400 hover:text-indigo-400 transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 transition-colors">{t('hero.startFree')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">{t('footer.company')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="text-slate-400 hover:text-indigo-400 transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">{t('footer.newsletter')}</h3>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                    {t('footer.subscribe')} <Send size={14} />
                </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Genius Writer. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
