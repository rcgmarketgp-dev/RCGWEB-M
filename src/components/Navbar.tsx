import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RcgLogo } from './RcgLogo';
import { GoogleBrandIcon } from './GoogleBrandIcon';
import { isBootstrappedAdminEmail, useFirebase } from '../context/FirebaseContext';
import { Language, NavLinkItem, SiteSettings } from '../types';
import { translations } from '../utils/i18n';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { Globe, Shield, Moon, Sun, Menu, X, PhoneCall, SlidersHorizontal, User } from 'lucide-react';
import { ExternalIconBadge } from './ExternalIconBadge';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  navLinks: NavLinkItem[];
  settings: SiteSettings;
  isPageEditMode?: boolean;
  onEditHeaderSection?: () => void;
  onOpenAdmin?: () => void;
  onOpenUserPortal: () => void;
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
  onEditHeaderSection,
  onOpenAdmin,
  onOpenUserPortal,
  onOpenContactModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const { user, isAdmin, authLoading, signInWithGoogle } = useFirebase();
  const canEdit = Boolean(
    user &&
      user.emailVerified &&
      isBootstrappedAdminEmail(user.email) &&
      isAdmin
  );
  const t = translations[language].nav;

  const isRtl = language === 'fa';
  const visibleLinks = navLinks.filter((l) => l.isVisible);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');

  useEffect(() => {
    const targetIds = Array.from(new Set(['hero', ...visibleLinks.map((l) => l.targetId)]));
    const elements = targetIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let bestId = '';
        let bestRatio = 0;
        for (const id of targetIds) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (bestId) {
          setActiveSectionId(bestId);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [navLinks]);

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
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#060F26]/95 border-b text-slate-900 dark:text-white transition-colors duration-200 shadow-sm dark:shadow-lg dark:shadow-black/20 ${
        isPageEditMode
          ? 'border-[#FD5202] ring-1 ring-[#FD5202]/40'
          : 'border-slate-200 dark:border-blue-900/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Dynamic Corporate Brand Logo */}
        <div
          onClick={() => {
            if (isPageEditMode && onEditHeaderSection) {
              onEditHeaderSection();
            } else {
              scrollTo('hero');
            }
          }}
          className={`cursor-pointer group flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:shrink-0 transition-opacity duration-200 ${
            isFading ? 'opacity-40' : 'opacity-100'
          } ${
            isPageEditMode
              ? 'p-1 sm:p-1.5 rounded-xl border border-dashed border-[#FD5202] bg-orange-50/50 dark:bg-orange-950/20'
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
          {visibleLinks.map((link) => {
            const isActive = activeSectionId === link.targetId;
            return (
              <button
                key={link.id}
                onClick={() => scrollTo(link.targetId)}
                className={`relative hover:text-[#FD5202] dark:hover:text-[#FD5202] transition-colors whitespace-nowrap shrink-0 py-2 cursor-pointer ${
                  link.targetId === 'campaigns'
                    ? 'text-[#FD5202] font-bold'
                    : link.targetId === 'calculator'
                    ? 'text-[#144AE0] dark:text-[#A6D6FE] font-bold'
                    : isActive
                    ? 'text-[#091A42] dark:text-white font-bold'
                    : ''
                }`}
              >
                {isRtl ? link.labelFa : link.labelEn}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute bottom-0.5 inset-x-0 h-0.5 rounded-full bg-[#FD5202]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Corporate Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 min-h-[38px] text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 border border-slate-200 dark:border-blue-800/50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            title={language === 'fa' ? 'Switch to English' : 'تغییر به زبان فارسی'}
          >
            <Globe className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#FD5202]" />
            <span className="font-mono uppercase">{language === 'fa' ? 'EN' : 'فا'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-600 hover:text-[#091A42] dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 rounded-xl border border-slate-200 dark:border-blue-800/50 transition-colors cursor-pointer"
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

          {/* Google Sign-In / Authenticated User Account */}
          {user ? (
            <button
              onClick={onOpenUserPortal}
              className="flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 min-h-[38px] min-w-[38px] text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/90 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800/70 text-[#091A42] dark:text-white transition-colors cursor-pointer whitespace-nowrap"
              title={user.email || (isRtl ? 'حساب کاربری و سوابق من' : 'My Account & Orders')}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Account'}
                  className="w-5 h-5 rounded-lg object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
              )}
              <span className="hidden md:inline max-w-[96px] truncate">
                {user.displayName?.split(' ')[0] || (isRtl ? 'حساب من' : 'Account')}
              </span>
            </button>
          ) : (
            <button
              onClick={() => void signInWithGoogle()}
              disabled={authLoading}
              className="flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 min-h-[38px] min-w-[38px] text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800/60 text-slate-700 dark:text-slate-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
              title={isRtl ? 'ورود امن با حساب گوگل' : 'Sign in with Google'}
            >
              <GoogleBrandIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{isRtl ? 'ورود گوگل' : 'Sign in'}</span>
            </button>
          )}

          {/* Admin CMS Trigger (Admin Only) */}
          {canEdit && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[38px] min-w-[38px] text-xs font-semibold rounded-xl bg-slate-100 hover:bg-[#091A42] hover:text-white dark:bg-blue-950/80 dark:hover:bg-[#144AE0] border border-slate-200 dark:border-blue-800/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              title={t.admin}
            >
              <Shield className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
              <span className="hidden sm:inline">{t.admin}</span>
            </button>
          )}

          {/* Primary Consultation / Custom Header CTA */}
          <button
            onClick={handleHeaderCtaClick}
            className="rcg-btn-primary hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-sm shadow-orange-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ExternalIconBadge
              iconName={settings.externalCtaIcon}
              className="w-3.5 h-3.5"
              invertColor={true}
              fallback={<PhoneCall className="w-3.5 h-3.5" />}
            />
            <span>{headerCtaLabel}</span>
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/60 rounded-xl border border-slate-200 dark:border-blue-800/40 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#FD5202]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="xl:hidden overflow-hidden bg-white dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/50 shadow-xl"
          >
            <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pt-3 pb-6 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-semibold">
                {visibleLinks.map((link) => {
                  const isActive = activeSectionId === link.targetId;
                  return (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.targetId)}
                      className={`px-3 py-2.5 min-h-[44px] flex items-center text-right rtl:text-right ltr:text-left rounded-xl border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-orange-50 dark:bg-[#FD5202]/15 border-[#FD5202]/50 text-[#FD5202] font-bold'
                          : 'bg-slate-50 hover:bg-blue-50 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-200 hover:text-[#FD5202] border-slate-200 dark:border-blue-900/40'
                      }`}
                    >
                      <span className="truncate">{isRtl ? link.labelFa : link.labelEn}</span>
                    </button>
                  );
                })}
              </div>

          {canEdit && onOpenAdmin && (
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-blue-950/35 border border-slate-200 dark:border-blue-900/50 space-y-2">
              <span className="text-[11px] font-extrabold text-[#144AE0] dark:text-[#A6D6FE] px-1 block">
                {isRtl ? 'پنل مدیریت سایت (مدیر کل)' : 'Admin Console'}
              </span>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/80 text-[#091A42] dark:text-white cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE] shrink-0" />
                <span>{t.admin}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (user) {
                onOpenUserPortal();
              } else {
                void signInWithGoogle();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] text-xs font-bold rounded-xl border border-slate-200 dark:border-blue-800 bg-white dark:bg-blue-950/80 text-slate-800 dark:text-white cursor-pointer"
          >
            <GoogleBrandIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {user
                ? isRtl
                  ? `حساب کاربری (${user.displayName || user.email})`
                  : `Account (${user.displayName || user.email})`
                : isRtl
                ? 'ورود و پیگیری سفارش با گوگل'
                : 'Sign in with Google'}
            </span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleHeaderCtaClick();
            }}
            className="rcg-btn-primary w-full flex items-center justify-center gap-2 py-3 min-h-[48px] text-sm font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-md cursor-pointer"
          >
            <ExternalIconBadge
              iconName={settings.externalCtaIcon}
              className="w-4 h-4"
              invertColor={true}
              fallback={<PhoneCall className="w-4 h-4" />}
            />
            <span>{headerCtaLabel}</span>
          </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
