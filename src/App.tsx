
import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { HelpProvider } from './contexts/HelpContext';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CommandPalette } from './components/CommandPalette';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CookieConsent } from './components/CookieConsent';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { HelpPanel } from './components/help/HelpPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Lazy load pages for performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPageEnhanced'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';
  const is404 = location.pathname === '/404';

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Keyboard Shortcuts for global actions
  useKeyboardShortcuts([
    {
      combo: { key: '/', ctrlKey: true },
      handler: () => setIsShortcutsOpen(prev => !prev)
    },
    {
      combo: { key: 'k', ctrlKey: true },
      handler: () => setIsCommandPaletteOpen(prev => !prev)
    },
    {
        combo: { key: 'k', metaKey: true }, // Mac Command+K
        handler: () => setIsCommandPaletteOpen(prev => !prev)
    }
  ]);

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200 relative overflow-x-hidden">
      <OfflineBanner />
      <CookieConsent />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <HelpPanel />

      {!isDashboard && !isAuth && !is404 && <Navbar />}
      {isDashboard && !isAuth && <Navbar />}

      <main id="main-content" className={`flex-grow overflow-x-hidden ${isDashboard ? 'h-[calc(100dvh-64px)] overflow-y-hidden' : ''} pb-16 md:pb-0`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {!isDashboard && !isAuth && !is404 && <Footer />}

      {/* Mobile Bottom Navigation - Visible only on mobile, and not on auth pages */}
      {!isAuth && <MobileBottomNav onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />}
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = localStorage.getItem('ai_writer_user');
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen w-full bg-slate-50 dark:bg-slate-950">
    <Loader2 className="animate-spin text-indigo-600" size={48} />
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeLanguageProvider>
      <ToastProvider>
        <UserProvider>
          <OnboardingProvider>
            <HelpProvider>
              <Router>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/product" element={<ProductPage />} />
                      <Route path="/login" element={<AuthPage />} />
                      <Route path="/signup" element={<AuthPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/privacy" element={<LegalPage />} />
                      <Route path="/terms" element={<LegalPage />} />
                      <Route path="/imprint" element={<LegalPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                  <OnboardingTour />
                </Layout>
              </Router>
            </HelpProvider>
          </OnboardingProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeLanguageProvider>
  );
};

export default App;
