import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quote, Eye, EyeOff, Chrome, Github, Sparkles } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Logo } from '../components/Logo';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useThemeLanguage();

  const handleDemoLogin = () => {
      const demoUser = {
          name: 'Alex Writer',
          email: 'alex@demo.com',
          plan: 'pro',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          bio: 'Creative Director at Demo Corp',
          linkedAccounts: { twitter: true, linkedin: false, instagram: true },
          favorites: []
      };
      localStorage.setItem('ai_writer_user', JSON.stringify(demoUser));
      // Navigate and reload to ensure context hydration
      navigate('/dashboard');
      window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    
    const name = nameInput?.value || (isLogin ? 'Returning User' : 'New User');
    const email = emailInput?.value || 'user@example.com';

    const user = {
        name: name,
        email: email,
        plan: 'free', // Default to free for manual signups
        bio: 'Just started writing.',
        linkedAccounts: { twitter: false, linkedin: false, instagram: false },
        favorites: []
    };

    localStorage.setItem('ai_writer_user', JSON.stringify(user));
    navigate('/dashboard');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-200">
      
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
             <div className="mx-auto h-16 w-16 flex items-center justify-center mb-4">
              <Logo size={64} />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
              >
                {isLogin ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            
            {/* Demo Login Button */}
            <button 
                type="button" 
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:scale-[1.02] transition-all ring-offset-2 focus:ring-2 focus:ring-orange-500"
            >
                <Sparkles size={18} className="fill-white/20" /> Sign in with Demo Account
            </button>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Chrome size={18} className="text-red-500" /> {t('auth.google')}
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Github size={18} /> {t('auth.github')}
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-950 text-slate-500">Or continue with email</span>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-xl shadow-sm space-y-4">
                {!isLogin && (
                    <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('auth.name')}</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                        placeholder={t('auth.name')}
                    />
                    </div>
                )}
                <div>
                    <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('auth.email')}</label>
                    <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                    placeholder="user@example.com"
                    />
                </div>
                <div className="relative">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('auth.password')}</label>
                    <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all pr-10"
                    placeholder={t('auth.password')}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
                </div>

                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-300">
                    {t('auth.rememberMe')}
                    </label>
                </div>

                <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                    {t('auth.forgotPass')}
                    </a>
                </div>
                </div>

                {!isLogin && (
                    <div className="flex items-start">
                        <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded" />
                        <label htmlFor="terms" className="ml-2 block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {t('auth.agree')} <Link to="/terms" className="underline hover:text-indigo-500">{t('auth.terms')}</Link> & <Link to="/privacy" className="underline hover:text-indigo-500">{t('auth.privacy')}</Link>.
                        </label>
                    </div>
                )}

                <div>
                <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                    {isLogin ? t('auth.signIn') : t('auth.createAccount')}
                </button>
                </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side: Visual (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-indigo-600 dark:bg-slate-900 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-slate-900 dark:to-slate-800 opacity-90"></div>
          
          <div className="relative z-10 max-w-lg px-10 text-white">
              <Quote size={64} className="text-indigo-300 dark:text-slate-600 mb-6 opacity-50" />
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                  "{t('auth.quote')}"
              </h2>
              <p className="text-lg text-indigo-200 dark:text-slate-400 font-medium">
                  — {t('auth.quoteAuthor')}
              </p>
          </div>
      </div>
    </div>
  );
};

export default AuthPage;