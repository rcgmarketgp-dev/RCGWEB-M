import React from 'react';

interface RcgLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  inverted?: boolean;
  showSubtitle?: boolean;
  subtitleType?: 'en' | 'fa' | 'full';
  height?: number;
  logoType?: 'vector' | 'custom';
  customLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  companyNameFa?: string;
  sloganFa?: string;
  sloganEn?: string;
}

export const RcgLogo: React.FC<RcgLogoProps> = ({
  className = '',
  variant = 'color',
  inverted = false,
  showSubtitle = true,
  subtitleType = 'full',
  height = 42,
  logoType = 'vector',
  customLogoUrl,
  primaryColor = '#144AE0',
  secondaryColor = '#091A42',
  accentColor = '#FD5202',
  companyNameFa = 'گروه صنعتی آرسی',
  sloganFa = 'راه حل یکپارچه ماشین ابزار صنعت چوب',
  sloganEn = 'WOODWORKING SOLUTIONS',
}) => {
  const mainBlue =
    variant === 'light'
      ? '#FFFFFF'
      : variant === 'dark'
      ? secondaryColor
      : primaryColor;

  const darkNavy =
    variant === 'light'
      ? '#FFFFFF'
      : inverted
      ? '#FFFFFF'
      : secondaryColor;

  const orangeAccent =
    variant === 'light'
      ? '#FFFFFF'
      : variant === 'dark'
      ? secondaryColor
      : accentColor;

  const showCustomImage = logoType === 'custom' && !!customLogoUrl?.trim();

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      {/* Logo Graphic: Uploaded Custom Image OR Brand Vector */}
      <div className="flex items-center">
        {showCustomImage ? (
          <img
            src={customLogoUrl}
            alt={companyNameFa}
            style={{ height: `${height}px` }}
            className="w-auto max-w-[200px] object-contain transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            height={height}
            viewBox="0 0 280 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200"
            aria-label="RCG Woodworking Solutions Logo"
          >
            {/* Letter R */}
            <g id="RCG-R">
              <path
                d="M6 10 H74 C86 10 96 19 96 32 C96 44 86 53 74 53 H38 L72 70 H48 L18 53 H6 V10 Z"
                fill={mainBlue}
              />
              <path
                d="M26 23 H68 C74 23 78 27 78 32 C78 37 74 41 68 41 H26 V23 Z"
                fill={inverted || variant === 'dark' ? '#091A42' : '#FFFFFF'}
                className={inverted ? '' : 'dark:fill-[#060F26]'}
              />
              <path
                d="M6 35 L26 23 V53 L6 53 Z"
                fill={inverted ? mainBlue : secondaryColor}
                className={inverted ? '' : 'dark:fill-[#144AE0]'}
              />
              <path
                d="M6 53 L26 40 L26 53 Z"
                fill={orangeAccent}
              />
            </g>

            {/* Letter C */}
            <g id="RCG-C">
              <path
                d="M112 10 H178 V24 H132 C125 24 121 28 121 34 V48 C121 54 125 58 132 58 H178 V72 H112 C98 72 90 64 90 50 V32 C90 18 98 10 112 10 Z"
                fill={darkNavy}
                className={inverted ? '' : 'dark:fill-white'}
              />
            </g>

            {/* Letter G */}
            <g id="RCG-G">
              <path
                d="M198 10 H268 V24 H220 C213 24 209 28 209 34 V48 C209 54 213 58 220 58 H250 V43 H234 V30 H268 V72 H198 C184 72 176 64 176 50 V32 C176 18 184 10 198 10 Z"
                fill={darkNavy}
                className={inverted ? '' : 'dark:fill-white'}
              />
              <path
                d="M250 43 L268 30 V43 Z"
                fill={orangeAccent}
              />
            </g>
          </svg>
        )}
      </div>

      {/* Official English & Persian Lockup underneath the Logo */}
      {showSubtitle && (
        <div className="flex flex-col items-start mt-1">
          <span
            className={`text-[9.5px] font-extrabold tracking-[0.22em] uppercase ${
              inverted ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {sloganEn}
          </span>

          {(subtitleType === 'full' || subtitleType === 'fa') && (
            <div className="flex flex-col items-start mt-0.5">
              <span
                className={`text-xs font-black ${
                  inverted ? 'text-[#A6D6FE]' : 'text-[#091A42] dark:text-[#A6D6FE]'
                }`}
              >
                {companyNameFa}
              </span>
              {subtitleType === 'full' && (
                <span
                  className={`text-[9px] leading-tight ${
                    inverted ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {sloganFa}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
