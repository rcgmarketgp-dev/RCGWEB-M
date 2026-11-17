import React from 'react';
import { Language, SectionCustomization, SiteSettings } from '../types';
import { translations } from '../utils/i18n';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { ExternalIconBadge } from './ExternalIconBadge';
import { History, Award, Shield, Wrench, Building2, Check } from 'lucide-react';
import { Gauge, Sparkle } from '@phosphor-icons/react';
import { motion } from 'motion/react';

interface AboutSectionProps {
  language: Language;
  settings?: SiteSettings;
  sectionConfig?: SectionCustomization;
  onOpenConsultation: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  language,
  settings,
  sectionConfig,
  onOpenConsultation,
}) => {
  const t = translations[language].about;
  const isRtl = language === 'fa';

  const technicalMetrics = [
    {
      labelFa: 'سطح دقت تیزکاری و کالیبراسیون (VOLLMER آلمان)',
      labelEn: 'Grinding Precision & Calibration Level (VOLLMER Germany)',
      value: 99.5,
      detailFa: 'تلورانس ۰.۰۰۵ میلی‌متر',
      detailEn: '0.005mm Tolerance',
      gradient: 'from-[#144AE0] to-[#FD5202]',
    },
    {
      labelFa: 'شاخص دوام و پایداری عملکرد کارگاهی (Durability Rating)',
      labelEn: 'Machinery Durability & Industrial Rigidity Rating',
      value: 97.8,
      detailFa: 'تست مداوم تحت بار سنگین',
      detailEn: 'Continuous Heavy-Duty Load Tested',
      gradient: 'from-[#FD5202] to-[#FFA066]',
    },
    {
      labelFa: 'آمادگی انبار و تأمین قطعات یدکی اصلی (Spare Parts Coverage)',
      labelEn: 'Genuine Spare Parts Stock & Immediate Availability',
      value: 99.0,
      detailFa: '+۵,۰۰۰ قلم قطعه اورجینال',
      detailEn: '5,000+ In-Stock Genuine Items',
      gradient: 'from-[#144AE0] to-[#3B82F6]',
    },
    {
      labelFa: 'نرخ انطباق با استانداردهای رسمی کارخانه پایون (Payon Compliance)',
      labelEn: 'Factory Compliance & Quality Verification Standard',
      value: 98.4,
      detailFa: 'گارانتی ۱۰۰٪ رسمی شرکتی',
      detailEn: '100% Official Certified Warranty',
      gradient: 'from-[#091A42] via-[#144AE0] to-[#FD5202]',
    },
  ];

  return (
    <section id="about" className="py-14 sm:py-20 lg:py-24 bg-white dark:bg-[#050C1F] text-slate-900 dark:text-white relative overflow-hidden border-y border-slate-200 dark:border-blue-900/40">
      <div className="absolute inset-0 opacity-30 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-[#FD5202]/15 border border-orange-200 dark:border-[#FD5202]/40 text-[11px] sm:text-xs font-bold text-[#FD5202]">
            <History className="w-3.5 h-3.5" />
            <span>{isRtl ? sectionConfig?.badgeFa || 'اصالت، تخصص و سابقه درخشان' : sectionConfig?.badgeEn || 'Heritage & Industrial Expertise'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#091A42] dark:text-white">
            {isRtl ? sectionConfig?.titleFa || t.title : sectionConfig?.titleEn || t.title}
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl ? sectionConfig?.subtitleFa || t.subtitle : sectionConfig?.subtitleEn || t.subtitle}
          </p>
        </motion.div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center mb-10 sm:mb-16">
          {/* Facility Photo */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 28 : -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-blue-500/40 shadow-xl bg-slate-900 aspect-[16/10] group">
              <img
                src={sectionConfig?.image || '/assets/aistudio/03_rcg_facility_hero_crop_20984afa.jpg'}
                alt="RCG Industrial Headquarters & Showroom"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#091A42] via-transparent to-black/25" />

              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md bg-[#091A42]/90 border border-blue-400/30 flex items-center justify-between gap-2 text-white">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-[#FD5202] font-bold truncate">
                    {isRtl ? 'مجتمع مرکزی نمایشگاهی و کارگاهی آرسی' : 'RCG Industrial Headquarters & Workshop'}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {isRtl ? 'قطب خدمات فنی و ماشین‌آلات چوب شمال' : 'Northern Woodworking Machinery Hub'}
                  </p>
                </div>
                <span className="font-mono text-[10px] sm:text-xs font-bold text-[#A6D6FE] bg-blue-950 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-blue-800 shrink-0">
                  EST. 2010
                </span>
              </div>
            </div>
          </motion.div>

          {/* Narrative */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -28 : 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-4 sm:space-y-5"
          >
            <h3 className="text-xl sm:text-3xl font-extrabold text-[#091A42] dark:text-white flex items-center gap-2.5 sm:gap-3">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#FD5202] shrink-0" />
              <span>{isRtl ? sectionConfig?.historyTitleFa || t.historyTitle : sectionConfig?.historyTitleEn || t.historyTitle}</span>
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {isRtl ? sectionConfig?.bodyFa || t.heritage1 : sectionConfig?.bodyEn || t.heritage1}
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {isRtl ? sectionConfig?.bodySecondaryFa || t.heritage2 : sectionConfig?.bodySecondaryEn || t.heritage2}
            </p>

            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => triggerCtaLink(sectionConfig?.ctaLink, onOpenConsultation, onOpenConsultation)}
                className="rcg-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[46px] text-xs sm:text-sm font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {settings?.externalCtaIcon && (
                  <ExternalIconBadge
                    iconName={settings.externalCtaIcon}
                    className="w-4 h-4"
                    invertColor={true}
                    fallback={null}
                  />
                )}
                <span>
                  {isRtl
                    ? sectionConfig?.ctaTextFa || 'مشاوره با مدیران فنی آرسی'
                    : sectionConfig?.ctaTextEn || 'Consult RCG Engineering Directors'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Technical Performance Metric Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-[#091A42]/95 border border-slate-200 dark:border-blue-500/30 shadow-lg space-y-5 sm:space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-blue-900/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FD5202] text-white shadow-sm shrink-0">
                <Gauge weight="duotone" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-extrabold text-[#091A42] dark:text-white">
                  {isRtl ? 'شاخص‌های فنی و استانداردهای کیفی RCG' : 'RCG Technical Benchmarks & Performance Ratings'}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#144AE0] dark:text-[#A6D6FE]">
                  {isRtl ? 'دقت ابزارآلات برشی، ماندگاری تجهیزات و تضمین خدمات پس از فروش' : 'Precision metrics, equipment durability ratings & quality assurance'}
                </p>
              </div>
            </div>

            <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 px-2.5 sm:px-3 py-1 rounded-xl">
              ISO 9001:2015 CERTIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 pt-1">
            {technicalMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="space-y-2.5 bg-white dark:bg-[#060F26]/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold gap-2">
                  <span className="text-[#091A42] dark:text-slate-200">
                    {isRtl ? metric.labelFa : metric.labelEn}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-[#FD5202] tabular-nums shrink-0">
                    {metric.value}%
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-200 dark:bg-blue-950 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-blue-900/60">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.value}%` }}
                    viewport={{ once: true, amount: 'some' }}
                    transition={{ duration: 1, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full bg-gradient-to-r ${metric.gradient}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                  <span className="flex items-center gap-1 text-[#144AE0] dark:text-[#A6D6FE]">
                    <Check className="w-3 h-3 text-[#FD5202]" />
                    <span>{isRtl ? metric.detailFa : metric.detailEn}</span>
                  </span>
                  <span className="font-mono">RCG Standard</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4 Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {t.values.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#091A42]/75 border border-slate-200 dark:border-blue-900/50 hover:border-[#144AE0] dark:hover:border-blue-500/60 transition-all duration-300 space-y-3 shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-blue-950 border border-slate-200 dark:border-blue-800 flex items-center justify-center text-[#FD5202] shadow-sm">
                {idx === 0 ? (
                  <Sparkle weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : idx === 1 ? (
                  <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : idx === 2 ? (
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#091A42] dark:text-white">{val.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
