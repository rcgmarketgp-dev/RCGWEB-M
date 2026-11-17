import React, { useState } from 'react';
import { Department, Language, SectionCustomization } from '../types';
import { translations } from '../utils/i18n';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { RcgLogo } from './RcgLogo';
import { ArrowLeft, ArrowRight, CheckCircle, X, PhoneCall } from 'lucide-react';
import { Toolbox, Wrench, Disc, Factory, Sparkle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

interface DepartmentsSectionProps {
  departments: Department[];
  language: Language;
  sectionConfig?: SectionCustomization;
  onSelectDepartmentForInquiry: (deptName: string) => void;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  language,
  sectionConfig,
  onSelectDepartmentForInquiry,
}) => {
  const [activeDeptModal, setActiveDeptModal] = useState<Department | null>(null);
  const t = translations[language].departments;
  const isRtl = language === 'fa';

  const getDeptIcon = (key: Department['key']) => {
    switch (key) {
      case 'sales':
        return <Toolbox weight="duotone" className="w-5 h-5 text-[#144AE0] dark:text-[#A6D6FE]" />;
      case 'service':
        return <Wrench weight="duotone" className="w-5 h-5 text-[#FD5202]" />;
      case 'sharpening':
        return <Disc weight="duotone" className="w-5 h-5 text-[#144AE0] dark:text-[#A6D6FE]" />;
      case 'overhaul':
        return <Factory weight="duotone" className="w-5 h-5 text-[#FD5202]" />;
    }
  };

  return (
    <section id="departments" className="py-20 sm:py-24 bg-slate-50 dark:bg-[#050C1F] relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-35 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-[#FD5202]/15 border border-orange-200 dark:border-[#FD5202]/40 text-xs font-bold text-[#FD5202]">
            <Sparkle weight="fill" className="w-3.5 h-3.5" />
            <span>{isRtl ? sectionConfig?.badgeFa || 'دپارتمان‌های تخصصی آرسی' : sectionConfig?.badgeEn || 'Our Specialized Departments'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#091A42] dark:text-white tracking-tight">
            {isRtl ? sectionConfig?.titleFa || t.tagline : sectionConfig?.titleEn || t.tagline}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl ? sectionConfig?.subtitleFa || t.subtitle : sectionConfig?.subtitleEn || t.subtitle}
          </p>
        </motion.div>

        {/* 4 Pillars Structured Master Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {departments.map((dept, idx) => {
            const title = isRtl ? dept.titleFa : dept.titleEn;
            const shortDesc = isRtl ? dept.shortDescFa : dept.shortDescEn;
            const subTitle = isRtl ? dept.subSectionTitleFa : dept.subSectionTitleEn;
            const bannerText = isRtl ? dept.bottomBannerFa : dept.bottomBannerEn;

            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-[#091A42] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-blue-900/60 shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col justify-between p-6 sm:p-7 space-y-6"
              >
                {/* Card Top: Mini Logo + Dept Icon + Index */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/50 pb-3">
                    <RcgLogo variant="color" height={28} showSubtitle={false} />
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-800">
                        {getDeptIcon(dept.key)}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE] bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 tabular-nums">
                        0{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Department Main Photo Banner */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/8] sm:aspect-[16/7] bg-slate-900 shadow-md">
                    <img
                      src={dept.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 mt-0.5">
                        {shortDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Middle Section: Sub-section title + 3 Distinct Mini Cards with Matching Photos */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-center">
                    {subTitle}
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    {dept.subCards.map((sc, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => setActiveDeptModal(dept)}
                        className="group/mini rounded-xl overflow-hidden bg-slate-100 dark:bg-[#060F26] border border-blue-200 dark:border-blue-900/60 p-2 text-center cursor-pointer hover:border-[#144AE0] transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-900 mb-2">
                          <img
                            src={sc.image}
                            alt={isRtl ? sc.titleFa : sc.titleEn}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/mini:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover/mini:text-[#144AE0] dark:group-hover/mini:text-[#A6D6FE] line-clamp-2 leading-tight">
                          {isRtl ? sc.titleFa : sc.titleEn}
                        </span>

                        <div className="mt-1 flex justify-center text-[#144AE0] dark:text-[#A6D6FE]">
                          {isRtl ? (
                            <ArrowLeft className="w-3 h-3 group-hover/mini:-translate-x-1 transition-transform" />
                          ) : (
                            <ArrowRight className="w-3 h-3 group-hover/mini:translate-x-1 transition-transform" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Bottom Callout Banner Bar */}
                <div
                  onClick={() =>
                    triggerCtaLink(dept.bottomBannerLink, () => setActiveDeptModal(dept))
                  }
                  className="rounded-2xl bg-gradient-to-r from-[#091A42] to-[#144AE0] dark:from-[#060F26] dark:to-blue-900 text-white p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer group/banner"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover/banner:text-[#A6D6FE] transition-colors line-clamp-1">
                    {bannerText}
                  </p>

                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover/banner:bg-[#FD5202] text-white flex items-center justify-center shrink-0 transition-colors">
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>

      {/* In-Depth Department Modal with Motion Transition */}
      <AnimatePresence>
        {activeDeptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-900 dark:text-white"
            >
              {/* Modal Header */}
              <div className="relative h-48 sm:h-56 overflow-hidden shrink-0">
                <img
                  src={activeDeptModal.image}
                  alt={isRtl ? activeDeptModal.titleFa : activeDeptModal.titleEn}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091A42] via-[#091A42]/55 to-transparent" />

                <button
                  onClick={() => setActiveDeptModal(null)}
                  className="absolute top-4 rtl:left-4 ltr:right-4 p-2 rounded-full bg-slate-900/80 hover:bg-[#FD5202] text-white transition-colors border border-slate-700 cursor-pointer"
                  aria-label={t.modalClose}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 px-6 space-y-1">
                  <span className="text-xs font-bold text-[#FD5202] uppercase tracking-wider">
                    {isRtl ? activeDeptModal.taglineFa : activeDeptModal.taglineEn}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {isRtl ? activeDeptModal.titleFa : activeDeptModal.titleEn}
                  </h3>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-200">
                {/* Detailed Description */}
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl ? activeDeptModal.fullDescFa : activeDeptModal.fullDescEn}
                </p>

                {/* Stats Highlights */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60">
                  {(isRtl ? activeDeptModal.statsFa : activeDeptModal.statsEn).map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg sm:text-xl font-extrabold text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Key Services List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#091A42] dark:text-white text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#FD5202]" />
                    <span>{t.servicesTitle}</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(isRtl ? activeDeptModal.servicesFa : activeDeptModal.servicesEn).map((service, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FD5202] mt-2 shrink-0" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => setActiveDeptModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {t.modalClose}
                </button>

                <button
                  onClick={() => {
                    const deptTitle = isRtl ? activeDeptModal.titleFa : activeDeptModal.titleEn;
                    setActiveDeptModal(null);
                    onSelectDepartmentForInquiry(deptTitle);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.requestService}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
