import React, { Suspense, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Lazy load pages for performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';
  const is404 = location.pathname === '/404';

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useKeyboardShortcuts([
    {
      combo: { key: '/', ctrlKey: true },
      handler: () => setIsShortcutsOpen(prev => !prev)
    }
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <OfflineBanner />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      {!isDashboard && !isAuth && !is404 && <Navbar />}
      {isDashboard && !isAuth && <Navbar />} 
      <main className={`flex-grow ${isDashboard ? 'h-[calc(100dvh-64px)] overflow-hidden' : ''}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      {!isDashboard && !isAuth && !is404 && <Footer />}
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, check context auth state. 
    // For this demo, we assume the user is "logged in" if they accessed the dashboard via AuthPage redirect
    // or if a user object exists in local storage.
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
                  <Route path="/privacy" element={<LegalPage />} />
                  <Route path="/terms" element={<LegalPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </UserProvider>
      </ToastProvider>
    </ThemeLanguageProvider>
  );
};

export default App;