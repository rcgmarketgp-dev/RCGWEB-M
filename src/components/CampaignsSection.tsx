import React from 'react';
import { CampaignLanding, Language, SectionCustomization, SiteSettings } from '../types';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { ExternalIconBadge } from './ExternalIconBadge';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, ShieldCheck, Clock } from 'lucide-react';
import { Sparkle, Tag } from '@phosphor-icons/react';

interface CampaignsSectionProps {
  campaigns: CampaignLanding[];
  language: Language;
  settings?: SiteSettings;
  sectionConfig?: SectionCustomization;
  onSelectCampaign: (campaign: CampaignLanding) => void;
}

export const CampaignsSection: React.FC<CampaignsSectionProps> = ({
  campaigns,
  language,
  settings,
  sectionConfig,
  onSelectCampaign,
}) => {
  const isRtl = language === 'fa';
  const activeCampaigns = campaigns.filter((c) => c.isActive);

  if (activeCampaigns.length === 0) return null;

  return (
    <section
      id="campaigns"
      className="py-14 sm:py-20 lg:py-24 bg-slate-100/80 dark:bg-[#050C1F] border-y border-slate-200 dark:border-blue-900/40 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-[#FD5202]/15 border border-orange-200 dark:border-[#FD5202]/40 text-[11px] sm:text-xs font-bold text-[#FD5202] tracking-wide">
            <Sparkle weight="fill" className="w-4 h-4" />
            <span>{isRtl ? sectionConfig?.badgeFa || 'جشنواره‌های فروش و کمپین‌های ویژه آرسی' : sectionConfig?.badgeEn || 'RCG Official Campaigns & Offers'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#091A42] dark:text-white">
            {isRtl ? sectionConfig?.titleFa || 'پیشنهادهای طلایی تجهیز کارگاه و خدمات برش' : sectionConfig?.titleEn || 'Exclusive Equipment Financing & Service Offers'}
          </h2>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl
              ? sectionConfig?.subtitleFa || 'مشاهده جزئیات کامل هر کمپین، شرایط پرداخت اقساطی بدون واسطه و فرم ثبت‌نام مستقیم در واحد بازرگانی RCG.'
              : sectionConfig?.subtitleEn || 'Explore full financing details, machine demos, and priority workshop enrollment pages.'}
          </p>
        </motion.div>

        {/* Campaign Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          {activeCampaigns.map((camp, idx) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white dark:bg-[#091A42] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-blue-900/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Top Visual Banner */}
              <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden">
                <img
                  src={camp.heroImage}
                  alt={isRtl ? camp.titleFa : camp.titleEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091A42] via-[#091A42]/35 to-black/25" />

                <div className="absolute top-3 rtl:right-3 ltr:left-3 sm:top-4 sm:rtl:right-4 sm:ltr:left-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#FD5202] text-white text-[11px] sm:text-xs font-bold shadow-md">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{isRtl ? camp.badgeFa : camp.badgeEn}</span>
                  </span>
                </div>

                {camp.discountPercentage && (
                  <div className="absolute top-3 rtl:left-3 ltr:right-3 sm:top-4 sm:rtl:left-4 sm:ltr:right-4 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-900/90 text-[#091A42] dark:text-[#A6D6FE] text-[11px] sm:text-xs font-black tabular-nums shadow">
                    {camp.discountPercentage}% {isRtl ? 'مزایا' : 'OFF'}
                  </div>
                )}

                <div className="absolute bottom-3 inset-x-4 sm:bottom-4 sm:inset-x-5">
                  <h3 className="text-base sm:text-xl font-black text-white leading-snug line-clamp-2">
                    {isRtl ? camp.headlineFa : camp.headlineEn}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {isRtl ? camp.subheadlineFa : camp.subheadlineEn}
                  </p>

                  {/* Offer Callout */}
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-[#060F26] border border-blue-200 dark:border-blue-800/60 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#144AE0] text-white flex items-center justify-center shrink-0">
                      <Tag weight="bold" className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-[#091A42] dark:text-[#A6D6FE]">
                      {isRtl ? camp.specialOfferFa : camp.specialOfferEn}
                    </div>
                  </div>

                  {/* Quick Highlights */}
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {(isRtl ? camp.highlightsFa : camp.highlightsEn).slice(0, 3).map((hl, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FD5202] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Terms & CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-blue-900/50 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isRtl ? camp.warrantyFa : camp.warrantyEn}</span>
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
                      <span>{isRtl ? camp.deliveryTermsFa : camp.deliveryTermsEn}</span>
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() =>
                      triggerCtaLink(sectionConfig?.ctaLink, () => onSelectCampaign(camp))
                    }
                    className="rcg-btn-primary w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 sm:py-3.5 sm:px-5 rounded-xl bg-gradient-to-r from-[#FD5202] to-[#E04600] hover:from-[#E04600] hover:to-[#C63D00] text-white text-xs sm:text-sm font-bold text-center leading-snug shadow-md shadow-orange-500/20 dark:shadow-orange-950/40 cursor-pointer"
                  >
                    {settings?.externalCtaIcon && (
                      <ExternalIconBadge
                        iconName={settings.externalCtaIcon}
                        className="w-4 h-4 shrink-0"
                        invertColor={true}
                        fallback={null}
                      />
                    )}
                    <span>
                      {isRtl
                        ? `${camp.ctaTextFa} / ${sectionConfig?.ctaTextFa || 'مشاهده صفحه فرود'}`
                        : `${camp.ctaTextEn} / ${sectionConfig?.ctaTextEn || 'Open Landing'}`}
                    </span>
                    {isRtl ? <ArrowLeft className="w-4 h-4 shrink-0" /> : <ArrowRight className="w-4 h-4 shrink-0" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
