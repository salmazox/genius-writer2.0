import React from 'react';

/**
 * Debug page to verify Turnstile configuration
 * Navigate to /debug-turnstile to see this page
 */
export const TurnstileDebugPage: React.FC = () => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Turnstile Debug Information
        </h1>

        <div className="space-y-4">
          {/* Site Key Check */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              VITE_TURNSTILE_SITE_KEY
            </h2>
            {siteKey ? (
              <div>
                <p className="text-green-600 dark:text-green-400 mb-2">✅ Configured</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-mono break-all">
                  {siteKey}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 dark:text-red-400 mb-2">❌ Not Set</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Environment variable VITE_TURNSTILE_SITE_KEY is not configured
                </p>
              </div>
            )}
          </div>

          {/* API URL Check */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              VITE_API_URL
            </h2>
            {apiUrl ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                {apiUrl}
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Not set (using default)
              </p>
            )}
          </div>

          {/* All Environment Variables */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              All VITE Environment Variables
            </h2>
            <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto">
              {JSON.stringify(import.meta.env, null, 2)}
            </pre>
          </div>

          {/* Instructions */}
          <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Troubleshooting Steps
            </h2>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li>Add VITE_TURNSTILE_SITE_KEY to Vercel environment variables</li>
              <li>Redeploy your Vercel project (important!)</li>
              <li>For local development, add to .env file: VITE_TURNSTILE_SITE_KEY=your_key</li>
              <li>Restart your dev server after adding .env variables</li>
              <li>Check browser console for any errors</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnstileDebugPage;
