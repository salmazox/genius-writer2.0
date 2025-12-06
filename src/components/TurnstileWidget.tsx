import React, { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

/**
 * Cloudflare Turnstile Widget Component
 *
 * A privacy-friendly CAPTCHA alternative that's invisible for most users
 */
export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no site key
    if (!siteKey) {
      console.warn('[TURNSTILE] No site key provided');
      return;
    }

    // Load Turnstile script
    const loadTurnstile = () => {
      if (window.turnstile) {
        renderWidget();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      script.onerror = () => {
        console.error('[TURNSTILE] Failed to load Turnstile script');
        if (onError) onError();
      };
      document.head.appendChild(script);
    };

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;

      // Remove existing widget if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore if widget doesn't exist
        }
      }

      // Render new widget
      try {
        console.log('[TURNSTILE] Rendering widget with site key:', siteKey.substring(0, 10) + '...');
        console.log('[TURNSTILE] Current domain:', window.location.hostname);

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            console.log('[TURNSTILE] ✅ Verification successful, token received:', token.substring(0, 20) + '...');
            onVerify(token);
          },
          'error-callback': (errorCode: string) => {
            console.error('[TURNSTILE] ❌ Verification error. Error code:', errorCode);
            console.error('[TURNSTILE] Common causes:');
            console.error('[TURNSTILE] 1. Domain not added in Cloudflare Turnstile settings');
            console.error('[TURNSTILE] 2. Wrong site key');
            console.error('[TURNSTILE] 3. Network issues');
            console.error('[TURNSTILE] Current domain:', window.location.hostname);
            console.error('[TURNSTILE] Add this domain to your Cloudflare Turnstile allowed domains list');
            if (onError) onError();
          },
          'expired-callback': () => {
            console.log('[TURNSTILE] ⏱️ Token expired (tokens last 5 minutes)');
            if (onExpire) onExpire();
          },
          'timeout-callback': () => {
            console.error('[TURNSTILE] ⏱️ Verification timeout');
            console.error('[TURNSTILE] This might indicate domain not configured in Cloudflare');
            if (onError) onError();
          }
        });

        console.log('[TURNSTILE] Widget rendered with ID:', widgetIdRef.current);
      } catch (error) {
        console.error('[TURNSTILE] Render error:', error);
        if (onError) onError();
      }
    };

    loadTurnstile();

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, theme, size, onVerify, onError, onExpire]);

  return (
    <div
      ref={containerRef}
      className={className}
    />
  );
};

// TypeScript declaration for window.turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
  }
}

export default TurnstileWidget;
