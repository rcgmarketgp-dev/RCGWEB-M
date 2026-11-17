import React from 'react';
import { Language, SiteSettings, NavLinkItem } from '../types';
import { translations } from '../utils/i18n';
import { RcgLogo } from './RcgLogo';
import { Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import {
  InstagramBrandIcon,
  LinkedInBrandIcon,
  TelegramBrandIcon,
  WhatsAppBrandIcon,
} from './SocialBrandIcons';

interface FooterProps {
  settings: SiteSettings;
  isDark?: boolean;
  language: Language;
  navLinks: NavLinkItem[];
  sectionConfig?: import('../types').SectionCustomization;
}

export const Footer: React.FC<FooterProps> = ({ settings, isDark = false, language, navLinks, sectionConfig }) => {
  const t = translations[language].footer;
  const isRtl = language === 'fa';
  const visibleLinks = navLinks.filter((l) => l.isVisible);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const brandDescText = isRtl
    ? sectionConfig?.bodyFa || t.brandDesc
    : sectionConfig?.bodyEn || t.brandDesc;
  const dealerBadgeText = isRtl
    ? sectionConfig?.badgeFa || 'نمایندگی رسمی ماشین‌آلات پایون چوب'
    : sectionConfig?.badgeEn || 'Authorized Payon Woodworking Dealer';
  const topButtonText = isRtl
    ? sectionConfig?.ctaTextFa || 'بازگشت به بالا'
    : sectionConfig?.ctaTextEn || 'Back to Top';

  return (
    <footer className="bg-[#091A42] dark:bg-[#050C1F] text-slate-300 border-t border-blue-900/60 dark:border-blue-950 pt-12 pb-10 sm:pt-16 sm:pb-12 relative overflow-hidden">
      {/* Background Triangles Pattern */}
      <div className="absolute inset-0 opacity-10 rcg-pattern-triangles-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-blue-800/50 dark:border-blue-950">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="cursor-pointer inline-block max-w-full" onClick={scrollToTop}>
              <RcgLogo
                settings={settings}
                isDark={isDark}
                surface="dark"
                height={Math.min(52, Math.max(32, Math.round((settings.logoHeight || 36) * 1.1)))}
                subtitleType={isRtl ? 'fa' : 'en'}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md pt-1 sm:pt-2">
              {brandDescText}
            </p>

            {/* Official Social Brand Icons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="min-w-[42px] min-h-[42px] flex items-center justify-center p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/70 text-slate-200 hover:text-[#FD5202] hover:border-[#FD5202] transition-colors"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramBrandIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="min-w-[42px] min-h-[42px] flex items-center justify-center p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/70 text-slate-200 hover:text-[#A6D6FE] hover:border-[#A6D6FE] transition-colors"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedInBrandIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="min-w-[42px] min-h-[42px] flex items-center justify-center p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/70 text-slate-200 hover:text-[#A6D6FE] hover:border-[#A6D6FE] transition-colors"
                aria-label="Telegram"
                title="Telegram"
              >
                <TelegramBrandIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-[42px] min-h-[42px] flex items-center justify-center p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/70 text-slate-200 hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <WhatsAppBrandIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.quickLinks}
            </h4>
            <ul className="grid grid-cols-2 sm:block gap-x-4 gap-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              {visibleLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.targetId)}
                    className={`py-1 text-start hover:text-white transition-colors cursor-pointer ${
                      link.targetId === 'calculator' || link.targetId === 'campaigns'
                        ? 'hover:text-[#FD5202] font-semibold text-blue-100'
                        : 'text-slate-300'
                    }`}
                  >
                    {isRtl ? link.labelFa : link.labelEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Northern Iran Regional Coverage */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isRtl ? 'دفاتر و شبکه خدمات پس از فروش' : 'Showroom & Field Network'}
            </h4>
            <div className="text-xs text-slate-200 space-y-2.5 leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FD5202] shrink-0 mt-0.5" />
                <span>{isRtl ? settings.addressFa : settings.addressEn}</span>
              </p>
              <p className="flex items-center gap-2 font-mono tabular-nums flex-wrap">
                <Phone className="w-4 h-4 text-[#A6D6FE] shrink-0" />
                <a href={`tel:${settings.phonePrimary}`} className="hover:text-[#FD5202] transition-colors">{settings.phonePrimary}</a>
                <span className="text-slate-500">|</span>
                <a href={`tel:${settings.phoneSecondary}`} className="hover:text-[#FD5202] transition-colors">{settings.phoneSecondary}</a>
              </p>
              <p className="flex items-center gap-2 font-mono min-w-0">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-[#FD5202] transition-colors">
                  {settings.email}
                </a>
              </p>
            </div>

            <div className="pt-1 sm:pt-2">
              <span className="inline-block px-3 py-1 text-[11px] font-bold rounded-md bg-blue-950 border border-blue-800 text-[#A6D6FE]">
                {dealerBadgeText}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-start">
          <p>{t.rights}</p>

          <button
            onClick={scrollToTop}
            className="w-full sm:w-auto min-h-[40px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800/70 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <span>{topButtonText}</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#FD5202]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
