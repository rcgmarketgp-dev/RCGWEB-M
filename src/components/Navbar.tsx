import React, { useState } from 'react';
import { RcgLogo } from './RcgLogo';
import { Language, NavLinkItem, SiteSettings } from '../types';
import { translations } from '../utils/i18n';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { Globe, Shield, Moon, Sun, Menu, X, PhoneCall, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  navLinks: NavLinkItem[];
  settings: SiteSettings;
  isPageEditMode?: boolean;
  onTogglePageEditMode?: () => void;
  onEditHeaderSection?: () => void;
  onOpenAdmin: () => void;
  onOpenContactModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isDark,
  onThemeToggle,
  navLinks,
  settings,
  isPageEditMode = false,
  onTogglePageEditMode,
  onEditHeaderSection,
  onOpenAdmin,
  onOpenContactModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const t = translations[language].nav;

  const handleLanguageToggle = () => {
    setIsFading(true);
    setTimeout(() => {
      onLanguageChange(language === 'fa' ? 'en' : 'fa');
      setTimeout(() => {
        setIsFading(false);
      }, 50);
    }, 120);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isRtl = language === 'fa';
  const visibleLinks = navLinks.filter((l) => l.isVisible);

  const headerCtaLabel = isRtl
    ? settings.headerCtaTextFa || t.consultationCta
    : settings.headerCtaTextEn || t.consultationCta;

  const handleHeaderCtaClick = () => {
    if (isPageEditMode && onEditHeaderSection) {
      onEditHeaderSection();
      return;
    }
    triggerCtaLink(settings.headerCtaLink, onOpenContactModal, onOpenContactModal);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#060F26]/95 border-b text-slate-900 dark:text-white transition-colors duration-200 shadow-sm dark:shadow-lg dark:shadow-black/20 ${
        isPageEditMode
          ? 'border-[#FD5202] ring-1 ring-[#FD5202]/40'
          : 'border-slate-200 dark:border-blue-900/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Dynamic Corporate Brand Logo */}
        <div
          onClick={() => {
            if (isPageEditMode && onEditHeaderSection) {
              onEditHeaderSection();
            } else {
              scrollTo('hero');
            }
          }}
          className={`cursor-pointer group flex items-center gap-3 shrink-0 transition-opacity duration-200 ${
            isFading ? 'opacity-40' : 'opacity-100'
          } ${
            isPageEditMode
              ? 'p-1.5 rounded-xl border border-dashed border-[#FD5202] bg-orange-50/50 dark:bg-orange-950/20'
              : ''
          }`}
          title={
            isPageEditMode
              ? isRtl
                ? 'کلیک برای ویرایش لوگو و تنظیمات هدر'
                : 'Click to edit header logo & colors'
              : 'RCG - Rezaei Commerce Group'
          }
        >
          <RcgLogo
            settings={settings}
            isDark={isDark}
            surface="auto"
            subtitleType={language === 'fa' ? 'fa' : 'en'}
            sloganEn="WOODWORKING SOLUTIONS"
          />
          {isPageEditMode && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FD5202] text-white text-[10px] font-bold">
              <SlidersHorizontal className="w-3 h-3" />
              <span>{isRtl ? 'ویرایش لوگو' : 'Edit Logo'}</span>
            </span>
          )}
        </div>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          key={language}
          className={`hidden xl:flex items-center gap-6 text-[13px] font-semibold text-slate-700 dark:text-slate-200 transition-opacity duration-200 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {visibleLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.targetId)}
              className={`hover:text-[#FD5202] dark:hover:text-[#FD5202] transition-colors whitespace-nowrap shrink-0 py-2 cursor-pointer ${
                link.targetId === 'campaigns'
                  ? 'text-[#FD5202] font-bold'
                  : link.targetId === 'calculator'
                  ? 'text-[#144AE0] dark:text-[#A6D6FE] font-bold'
                  : ''
              }`}
            >
              {isRtl ? link.labelFa : link.labelEn}
            </button>
          ))}
        </nav>

        {/* Zone 3: Corporate Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 border border-slate-200 dark:border-blue-800/50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            title={language === 'fa' ? 'Switch to English' : 'تغییر به زبان فارسی'}
          >
            <Globe className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#FD5202]" />
            <span className="font-mono uppercase">{language === 'fa' ? 'EN' : 'فا'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 text-slate-600 hover:text-[#091A42] dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 rounded-xl border border-slate-200 dark:border-blue-800/50 transition-colors cursor-pointer"
            title={
              isDark
                ? isRtl
                  ? 'حالت روز (کلاسیک)'
                  : 'Light Corporate Theme'
                : isRtl
                ? 'حالت شب (صنعتی)'
                : 'Dark Industrial Theme'
            }
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#091A42]" />}
          </button>

          {/* Live Page Edit Mode Toggle Quick Pill */}
          {onTogglePageEditMode && (
            <button
              onClick={onTogglePageEditMode}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                isPageEditMode
                  ? 'bg-[#FD5202] border-[#FD5202] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-blue-50 dark:bg-blue-950/80 dark:hover:bg-blue-900 border-slate-200 dark:border-blue-800/60 text-slate-700 dark:text-slate-200'
              }`}
              title={isRtl ? 'فعال‌سازی حالت تنظیمات صفحه' : 'Toggle Page Settings Mode'}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${isPageEditMode ? 'text-white' : 'text-[#FD5202]'}`} />
              <span>{isPageEditMode ? (isRtl ? 'حالت ویرایش فعال' : 'Edit Mode ON') : (isRtl ? 'تنظیمات صفحه' : 'Edit Page')}</span>
            </button>
          )}

          {/* Admin CMS Trigger */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-[#091A42] hover:text-white dark:bg-blue-950/80 dark:hover:bg-[#144AE0] border border-slate-200 dark:border-blue-800/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            title={t.admin}
          >
            <Shield className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
            <span className="hidden sm:inline">{t.admin}</span>
          </button>

          {/* Primary Consultation / Custom Header CTA */}
          <button
            onClick={handleHeaderCtaClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{headerCtaLabel}</span>
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/60 rounded-xl border border-slate-200 dark:border-blue-800/40"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#FD5202]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/50 px-5 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-semibold">
            {visibleLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.targetId)}
                className="p-2.5 text-right rtl:text-right ltr:text-left rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-200 hover:text-[#FD5202] border border-slate-200 dark:border-blue-900/40 transition-colors"
              >
                {isRtl ? link.labelFa : link.labelEn}
              </button>
            ))}
          </div>

          {onTogglePageEditMode && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onTogglePageEditMode();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border ${
                isPageEditMode
                  ? 'bg-[#FD5202] text-white border-[#FD5202]'
                  : 'bg-slate-100 dark:bg-blue-950 text-slate-800 dark:text-white border-slate-200 dark:border-blue-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{isPageEditMode ? (isRtl ? 'خروج از تنظیمات صفحه' : 'Exit Edit Mode') : (isRtl ? 'فعال‌سازی تنظیمات صفحه' : 'Enable Page Edit Mode')}</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleHeaderCtaClick();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-md"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{headerCtaLabel}</span>
          </button>
        </div>
      )}
    </header>
  );
};
