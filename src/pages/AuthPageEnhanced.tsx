import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quote, Eye, EyeOff, Chrome, Github, Sparkles, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Logo } from '../components/Logo';
import { authService, SignupData } from '../services/authService';

const AuthPageEnhanced: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useThemeLanguage();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    termsAccepted: false,
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

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
    navigate('/dashboard');
    window.location.reload();
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    const strength = authService.getPasswordStrength(password);
    setPasswordStrength(strength);

    if (password.length > 0) {
      const validation = authService.validatePassword(password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        console.log('Login successful:', result);
        navigate('/dashboard');
        window.location.reload();
      } else {
        // Signup - validate passwords match
        if (formData.password !== formData.passwordConfirm) {
          throw new Error('Passwords do not match');
        }

        // Validate password strength
        const validation = authService.validatePassword(formData.password);
        if (!validation.valid) {
          throw new Error(validation.errors[0]);
        }

        // Validate terms acceptance
        if (!formData.termsAccepted) {
          throw new Error('You must accept the Terms of Service and Privacy Policy');
        }

        const result = await authService.signup(formData as SignupData);

        console.log('Signup successful:', result);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-orange-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-200">

      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto">
        <div className="max-w-md w-full space-y-8 my-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center mb-4">
              <Logo size={64} />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isLogin ? t('auth.welcomeBack') : 'Create Your Account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPasswordErrors([]);
                }}
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
              >
                {isLogin ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </div>

          <div className="mt-8 space-y-6">

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

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

            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Full Name */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Email Address *
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder="user@example.com"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all pr-10"
                  placeholder={isLogin ? "Enter your password" : "Min. 10 characters"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {!isLogin && formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength < 30 ? 'text-red-600' :
                      passwordStrength < 60 ? 'text-orange-600' :
                      passwordStrength < 80 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  {passwordErrors.length > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      {passwordErrors.map((err, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password */}
              {!isLogin && (
                <div className="relative">
                  <label htmlFor="password-confirm" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Confirm Password *
                  </label>
                  <input
                    id="password-confirm"
                    name="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                    className="appearance-none relative block w-full px-3 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all pr-10"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPasswordConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                  {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Passwords do not match
                    </p>
                  )}
                  {formData.passwordConfirm && formData.password === formData.passwordConfirm && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Passwords match
                    </p>
                  )}
                </div>
              )}

              {/* Address Fields - Optional */}
              {!isLogin && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock size={16} />
                    Address (Optional)
                  </h3>

                  <div>
                    <label htmlFor="street" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Street Address
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({...formData, street: e.target.value})}
                      className="appearance-none relative block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="appearance-none relative block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                      placeholder="Berlin"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="postalCode" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Postal Code
                      </label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        className="appearance-none relative block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                        placeholder="10115"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="appearance-none relative block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Remember Me / Forgot Password */}
              {isLogin && (
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
                    <Link to="/forgot-password" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                      {t('auth.forgotPass')}
                    </Link>
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {!isLogin && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded flex-shrink-0"
                    />
                    <label htmlFor="terms" className="ml-3 block text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      I agree to the{' '}
                      <Link to="/legal?section=terms" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/legal?section=privacy" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline">
                        Privacy Policy
                      </Link>
                      . I understand that my data will be processed in accordance with GDPR regulations.
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? t('auth.signIn') : 'Create Account'
                  )}
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

export default AuthPageEnhanced;
