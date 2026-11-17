import React from 'react';
import { SiteSettings } from '../types';

interface RcgLogoProps {
  className?: string;
  settings?: SiteSettings;
  isDark?: boolean;
  surface?: 'auto' | 'light' | 'dark';
  variant?: 'light' | 'dark' | 'color';
  inverted?: boolean;
  showSubtitle?: boolean;
  subtitleType?: 'en' | 'fa' | 'full';
  height?: number;
  heightScale?: number;
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
  settings,
  isDark = false,
  surface = 'auto',
  variant,
  inverted = false,
  showSubtitle,
  subtitleType = 'full',
  height,
  heightScale = 1,
  logoType,
  customLogoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  companyNameFa,
  sloganFa,
  sloganEn,
}) => {
  const isDarkSurface =
    surface === 'dark' || (surface === 'auto' && (isDark || inverted));

  const resolvedLogoType = logoType ?? settings?.logoType ?? 'vector';
  const resolvedVariant =
    variant ??
    (isDarkSurface
      ? settings?.logoDarkVariant ?? 'color'
      : settings?.logoVariant ?? 'color');

  const resolvedCustomUrl =
    customLogoUrl !== undefined
      ? customLogoUrl
      : isDarkSurface
      ? settings?.customLogoDarkUrl?.trim() || settings?.customLogoUrl?.trim()
      : settings?.customLogoUrl?.trim() || settings?.customLogoDarkUrl?.trim();

  const resolvedPrimary =
    primaryColor ??
    (isDarkSurface
      ? settings?.logoDarkPrimaryColor || '#3B82F6'
      : settings?.logoPrimaryColor || '#144AE0');

  const resolvedSecondary =
    secondaryColor ??
    (isDarkSurface
      ? settings?.logoDarkSecondaryColor || '#FFFFFF'
      : settings?.logoSecondaryColor || '#091A42');

  const resolvedAccent =
    accentColor ??
    (isDarkSurface
      ? settings?.logoDarkAccentColor || '#FD5202'
      : settings?.logoAccentColor || '#FD5202');

  const baseHeight = height ?? settings?.logoHeight ?? 36;
  const computedHeight = Math.max(18, Math.round(baseHeight * heightScale));
  const resolvedShowSubtitle =
    showSubtitle !== undefined
      ? showSubtitle
      : settings
      ? settings.logoShowSubtitle !== false
      : true;

  const resolvedCompanyNameFa = companyNameFa ?? settings?.companyNameFa ?? 'گروه صنعتی آرسی';
  const resolvedSloganFa =
    sloganFa ?? settings?.sloganFa ?? 'راه حل یکپارچه ماشین ابزار صنعت چوب';
  const resolvedSloganEn = sloganEn ?? 'WOODWORKING SOLUTIONS';

  const mainBlue =
    resolvedVariant === 'light'
      ? '#FFFFFF'
      : resolvedVariant === 'dark'
      ? resolvedSecondary
      : resolvedPrimary;

  const lettersFill =
    resolvedVariant === 'light'
      ? '#FFFFFF'
      : resolvedVariant === 'dark'
      ? resolvedSecondary
      : resolvedSecondary;

  const orangeAccent =
    resolvedVariant === 'light'
      ? '#FFFFFF'
      : resolvedVariant === 'dark'
      ? resolvedSecondary
      : resolvedAccent;

  const innerCutoutFill = isDarkSurface ? '#060F26' : '#FFFFFF';
  const stemAccentFill =
    resolvedVariant === 'light'
      ? 'rgba(255,255,255,0.82)'
      : isDarkSurface
      ? mainBlue
      : resolvedSecondary;

  const showCustomImage = resolvedLogoType === 'custom' && !!resolvedCustomUrl;

  return (
    <div className={`flex flex-col items-start select-none min-w-0 max-w-full overflow-hidden ${className}`}>
      <div className="flex items-center max-w-full">
        {showCustomImage ? (
          <img
            src={resolvedCustomUrl}
            alt={resolvedCompanyNameFa}
            style={{ height: `${computedHeight}px` }}
            className="w-auto max-w-[135px] sm:max-w-[200px] object-contain transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            height={computedHeight}
            viewBox="0 0 280 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-auto max-w-[135px] sm:max-w-none transition-transform duration-200"
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
                fill={innerCutoutFill}
              />
              <path
                d="M6 35 L26 23 V53 L6 53 Z"
                fill={stemAccentFill}
              />
              <path d="M6 53 L26 40 L26 53 Z" fill={orangeAccent} />
            </g>

            {/* Letter C */}
            <g id="RCG-C">
              <path
                d="M112 10 H178 V24 H132 C125 24 121 28 121 34 V48 C121 54 125 58 132 58 H178 V72 H112 C98 72 90 64 90 50 V32 C90 18 98 10 112 10 Z"
                fill={lettersFill}
              />
            </g>

            {/* Letter G */}
            <g id="RCG-G">
              <path
                d="M198 10 H268 V24 H220 C213 24 209 28 209 34 V48 C209 54 213 58 220 58 H250 V43 H234 V30 H268 V72 H198 C184 72 176 64 176 50 V32 C176 18 184 10 198 10 Z"
                fill={lettersFill}
              />
              <path d="M250 43 L268 30 V43 Z" fill={orangeAccent} />
            </g>
          </svg>
        )}
      </div>

      {resolvedShowSubtitle && (
        <div className="flex flex-col items-start mt-1 max-w-full">
          <span
            className={`text-[8.5px] sm:text-[9.5px] font-extrabold tracking-[0.16em] sm:tracking-[0.22em] uppercase truncate max-w-[165px] sm:max-w-none ${
              isDarkSurface ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {resolvedSloganEn}
          </span>

          {(subtitleType === 'full' || subtitleType === 'fa') && (
            <div className="flex flex-col items-start mt-0.5 max-w-full">
              <span
                className={`text-[11px] sm:text-xs font-black truncate max-w-[165px] sm:max-w-none ${
                  isDarkSurface ? 'text-[#A6D6FE]' : 'text-[#091A42]'
                }`}
              >
                {resolvedCompanyNameFa}
              </span>
              {subtitleType === 'full' && (
                <span
                  className={`text-[9px] leading-tight truncate max-w-[180px] sm:max-w-none ${
                    isDarkSurface ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {resolvedSloganFa}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
