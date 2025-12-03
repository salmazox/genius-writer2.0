import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Logo } from './Logo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, theme, toggleTheme, currency, setCurrency, t } = useThemeLanguage();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.product'), path: '/product' },
    { name: t('nav.pricing'), path: '/pricing' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group" aria-label="Genius Writer Home">
              <div className="group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                <Logo size={36} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Genius Writer</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
             {/* Theme Toggle */}
             <button 
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Currency Switcher */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 px-3 h-6" role="group" aria-label="Currency selection">
              <button 
                onClick={() => setCurrency('EUR')}
                aria-label="Switch to Euro"
                aria-pressed={currency === 'EUR'}
                className={`text-xs font-bold ${currency === 'EUR' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                €
              </button>
              <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
              <button 
                onClick={() => setCurrency('USD')}
                aria-label="Switch to Dollar"
                aria-pressed={currency === 'USD'}
                className={`text-xs font-bold ${currency === 'USD' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                $
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 border-l border-r border-slate-200 dark:border-slate-700 px-3 h-6" role="group" aria-label="Language selection">
              <button 
                onClick={() => setLanguage('en')}
                aria-label="Switch to English"
                aria-pressed={language === 'en'}
                className={`text-xs font-bold ${language === 'en' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('de')}
                aria-label="Switch to German"
                aria-pressed={language === 'de'}
                className={`text-xs font-bold ${language === 'de' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                DE
              </button>
            </div>

            <Link
              to="/user-dashboard"
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
              title="My Account"
              aria-label="User Dashboard"
              data-tour="user-menu"
            >
                <User size={20} />
            </Link>
            
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          <div className="flex items-center md:hidden gap-4">
             <button 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-slate-600 dark:text-slate-300"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
             <div className="flex items-center justify-between px-3 py-4 border-t border-slate-100 dark:border-slate-800">
               {/* Mobile Language */}
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`text-sm font-bold ${language === 'en' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                  >
                    EN
                  </button>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                  <button 
                    onClick={() => setLanguage('de')}
                    className={`text-sm font-bold ${language === 'de' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                  >
                    DE
                  </button>
               </div>

               {/* Mobile Currency */}
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrency('EUR')}
                    className={`text-sm font-bold ${currency === 'EUR' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                  >
                    EUR (€)
                  </button>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                  <button 
                    onClick={() => setCurrency('USD')}
                    className={`text-sm font-bold ${currency === 'USD' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                  >
                    USD ($)
                  </button>
               </div>
            </div>

            <div className="pt-2 mt-2 space-y-2">
                <Link to="/user-dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300">
                    <User size={18} /> My Account
                </Link>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-center bg-indigo-600 text-white rounded-lg mx-3">
                    {t('nav.getStarted')}
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;