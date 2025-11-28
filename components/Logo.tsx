import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="magic_gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" /> {/* Indigo-500 */}
          <stop offset="100%" stopColor="#A855F7" /> {/* Purple-500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Spark Shape - Represents Genius/Magic */}
      <path
        d="M20 0C21.5 11 26 16.5 38 20C26 23.5 21.5 29 20 40C18.5 29 14 23.5 2 20C14 16.5 18.5 11 20 0Z"
        fill="url(#magic_gradient)"
        filter="url(#glow)"
      />
      
      {/* Sharper Inner Spark for definition */}
      <path
        d="M20 4C21.2 12 25 17 34 20C25 23 21.2 28 20 36C18.8 28 15 23 6 20C15 17 18.8 12 20 4Z"
        fill="url(#magic_gradient)"
      />

      {/* Center Diamond Core */}
      <path
        d="M20 15L22.5 20L20 25L17.5 20L20 15Z"
        fill="white"
        className="dark:fill-slate-900"
      />
      
      {/* Pen Tip Slit Detail at bottom to denote writing */}
      <path 
        d="M20 28V36" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        className="dark:stroke-slate-900"
        opacity="0.5"
      />

      {/* Floating Magic Particles */}
      <circle cx="33" cy="9" r="2" fill="#A855F7" className="animate-pulse" style={{ animationDuration: '3s' }} />
      <circle cx="7" cy="31" r="1.5" fill="#6366F1" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      <circle cx="35" cy="28" r="1" fill="#6366F1" className="animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
    </svg>
  );
};