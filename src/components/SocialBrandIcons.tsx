import React from 'react';

interface IconProps {
  className?: string;
}

export const InstagramBrandIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="ig-brand-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FD5949" />
        <stop offset="50%" stopColor="#D6249F" />
        <stop offset="100%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-brand-grad)" />
    <rect x="6" y="6" width="12" height="12" rx="3.5" stroke="#ffffff" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.8" stroke="#ffffff" strokeWidth="1.6" />
    <circle cx="15.8" cy="8.2" r="1" fill="#ffffff" />
  </svg>
);

export const LinkedInBrandIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
    <path
      d="M7.5 10.2V17M7.5 7.4V7.5M11.2 17V10.2M11.2 12.2C11.7 10.9 12.9 10 14.3 10C16.1 10 17 11.2 17 13.3V17"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TelegramBrandIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#229ED9" />
    <path
      d="M16.9 7.8L14.9 17C14.75 17.65 14.35 17.8 13.8 17.5L10.75 15.25L9.28 16.66C9.12 16.82 8.98 16.96 8.66 16.96L8.88 13.86L14.52 8.76C14.76 8.54 14.46 8.42 14.14 8.64L7.16 13.04L4.16 12.1C3.51 11.9 3.5 11.45 4.3 11.14L16.02 6.62C16.56 6.42 17.04 6.75 16.9 7.8Z"
      fill="#ffffff"
    />
  </svg>
);

export const WhatsAppBrandIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#25D366" />
    <path
      d="M16.5 14.3C16.25 14.18 15.02 13.57 14.8 13.49C14.57 13.4 14.41 13.36 14.24 13.61C14.08 13.86 13.6 14.42 13.45 14.58C13.31 14.75 13.16 14.77 12.91 14.65C12.66 14.52 11.86 14.26 10.91 13.41C10.17 12.75 9.67 11.93 9.52 11.68C9.38 11.43 9.5 11.3 9.63 11.17C9.74 11.06 9.88 10.88 10 10.74C10.13 10.6 10.17 10.49 10.25 10.33C10.34 10.16 10.29 10.02 10.23 9.89C10.17 9.77 9.67 8.54 9.46 8.04C9.26 7.56 9.05 7.62 8.9 7.61H8.42C8.25 7.61 7.98 7.67 7.75 7.92C7.52 8.17 6.88 8.77 6.88 10C6.88 11.23 7.77 12.42 7.9 12.58C8.02 12.75 9.65 15.26 12.15 16.34C12.74 16.6 13.21 16.75 13.57 16.87C14.17 17.06 14.71 17.03 15.14 16.97C15.62 16.9 16.62 16.37 16.83 15.79C17.04 15.2 17.04 14.7 16.97 14.59C16.91 14.48 16.75 14.42 16.5 14.3Z"
      fill="#ffffff"
    />
  </svg>
);
