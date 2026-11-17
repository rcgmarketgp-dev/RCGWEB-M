import React, { useState, useEffect, useRef } from 'react';
import { HeroSlide, Language, SectionCustomization, SiteSettings } from '../types';
import { translations } from '../utils/i18n';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { useResponsiveLayoutRatios } from '../hooks/useResponsiveLayoutRatios';
import { ExternalIconBadge } from './ExternalIconBadge';
import { ArrowLeft, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { ShieldCheck, Sparkle, Cpu, Users, Toolbox } from '@phosphor-icons/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface HeroProps {
  slides: HeroSlide[];
  language: Language;
  settings?: SiteSettings;
  sectionConfig?: SectionCustomization;
  onExploreDepartments: () => void;
  onOpenCalculator: () => void;
  onOpenContactModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  slides,
  language,
  settings,
  sectionConfig,
  onExploreDepartments,
  onOpenCalculator,
  onOpenContactModal,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Subtle parallax depth layers
  const bgBackdropY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const patternParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const imageParallaxY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const carrierParallaxY = useTransform(scrollYProgress, [0, 1], [0, -14]);

  const t = translations[language].hero;
  const currentSlide = slides[currentIdx] || slides[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const isRtl = language === 'fa';
  const { hero: heroLayout } = useResponsiveLayoutRatios(language);

  return (
    <section
      ref={heroRef}
      id="hero"
      className={`relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/40 dark:from-[#091A42] dark:via-[#060F26] dark:to-[#040A1A] text-slate-900 dark:text-white ${heroLayout.sectionPadding} border-b border-slate-200 dark:border-blue-900/40`}
    >
      {/* Parallax Backdrop Layer */}
      <motion.div
        style={{ y: bgBackdropY }}
        className="absolute -inset-x-0 -top-16 -bottom-16 pointer-events-none overflow-hidden"
      >
        <img
          src={sectionConfig?.image || '/assets/aistudio/03_rcg_facility_hero_crop_20984afa.jpg'}
          alt=""
          className="w-full h-full object-cover opacity-[0.06] dark:opacity-15 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-slate-50/90 to-slate-50 dark:from-[#091A42]/85 dark:via-[#060F26]/90 dark:to-[#040A1A]" />
      </motion.div>

      {/* Geometric Pattern Layer */}
      <motion.div
        style={{ y: patternParallaxY }}
        className="absolute -inset-x-0 -top-24 -bottom-24 pointer-events-none opacity-45 dark:opacity-30 rcg-pattern-triangles dark:rcg-pattern-triangles-dark"
      />

      {/* Ambient Corporate Accents */}
      <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#144AE0]/10 dark:bg-[#144AE0]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 left-12 w-72 h-72 bg-[#FD5202]/10 dark:bg-[#FD5202]/15 rounded-full blur-3xl pointer-events-none" />

      <div className={`max-w-7xl mx-auto ${heroLayout.containerPadding} relative z-10`}>
        {/* Main Hero Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 ${heroLayout.gridGap} items-center`}>
          {/* Text Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:col-span-7 flex flex-col justify-center ${heroLayout.contentStackGap}`}
          >
            {/* Editorial Kicker */}
            <div className={`inline-flex items-center self-start ${heroLayout.kickerClass} rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-500/30 font-bold text-[#091A42] dark:text-[#A6D6FE] max-w-full`}>
              <span className="w-2 h-2 rounded-full bg-[#FD5202] shrink-0" />
              <span className="truncate">{isRtl ? sectionConfig?.badgeFa || 'گروه صنعتی و بازرگانی آرسی' : sectionConfig?.badgeEn || 'Rezaei Commerce Group (RCG)'}</span>
              <span className="text-slate-400">·</span>
              <span className="text-[#144AE0] dark:text-slate-300 whitespace-nowrap">{t.yearsExp}</span>
            </div>

            {/* Headline */}
            <div className={`${heroLayout.headlineBoxMinHeight} flex flex-col justify-center`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h1 className={`${heroLayout.headlineClass} font-black text-balance`}>
                    <span className="block text-[#091A42] dark:text-white">
                      {isRtl ? currentSlide.titleFa : currentSlide.titleEn}
                    </span>
                    <span className="block text-[#FD5202] mt-1 sm:mt-1.5">
                      {isRtl ? currentSlide.highlightFa : currentSlide.highlightEn}
                    </span>
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Subtitle */}
            <p className={`${heroLayout.subtitleClass} text-slate-600 dark:text-slate-300 max-w-2xl`}>
              {isRtl ? currentSlide.subtitleFa : currentSlide.subtitleEn}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className={`flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center ${heroLayout.ctaGroupGap}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  triggerCtaLink(
                    currentSlide.primaryCtaLink || sectionConfig?.ctaLink,
                    onExploreDepartments,
                    onOpenContactModal
                  )
                }
                className={`rcg-btn-primary group w-full sm:w-auto flex items-center justify-center gap-2.5 ${heroLayout.ctaButtonClass} font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-lg shadow-orange-500/25 dark:shadow-orange-950/40 whitespace-nowrap cursor-pointer`}
              >
                {settings?.externalCtaIcon && (
                  <ExternalIconBadge
                    iconName={settings.externalCtaIcon}
                    className="w-4 h-4"
                    invertColor={true}
                    fallback={null}
                  />
                )}
                <span>{isRtl ? currentSlide.primaryCtaFa : currentSlide.primaryCtaEn}</span>
                {isRtl ? (
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  triggerCtaLink(
                    currentSlide.secondaryCtaLink || sectionConfig?.secondaryCtaLink,
                    onOpenCalculator,
                    onOpenContactModal
                  )
                }
                className={`rcg-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 ${heroLayout.ctaButtonClass} font-bold text-[#091A42] dark:text-slate-100 bg-white hover:bg-blue-50 dark:bg-blue-950/70 dark:hover:bg-blue-900/80 border border-slate-300 dark:border-blue-500/40 rounded-xl shadow-sm whitespace-nowrap cursor-pointer`}
              >
                <Sparkle weight="fill" className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
                <span>{isRtl ? currentSlide.secondaryCtaFa : currentSlide.secondaryCtaEn}</span>
              </motion.button>
            </div>

            {/* Slider Pagination */}
            <div className={`flex items-center justify-between sm:justify-start ${heroLayout.paginationClass} border-t border-slate-200 dark:border-slate-800/80`}>
              <div className="font-mono tabular-nums text-slate-500 dark:text-slate-400 tracking-wider">
                <span className="text-[#091A42] dark:text-white font-bold text-base">0{currentIdx + 1}</span>
                <span className="mx-1 text-slate-400 dark:text-slate-600">/</span>
                <span>0{slides.length}</span>
              </div>

              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIdx
                        ? 'w-8 bg-[#FD5202]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 hover:border-[#144AE0] text-slate-600 dark:text-slate-300 hover:text-[#144AE0] dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 hover:border-[#144AE0] text-slate-600 dark:text-slate-300 hover:text-[#144AE0] dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Visual Showcase Frame */}
          <motion.div
            style={{ y: carrierParallaxY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-blue-500/30 shadow-2xl bg-[#091A42] aspect-[4/3] sm:aspect-[16/11]">
                <motion.div
                  style={{ y: imageParallaxY, scale: imageScale }}
                  className="w-full h-full"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide.image}
                      src={currentSlide.image}
                      alt={isRtl ? currentSlide.titleFa : currentSlide.titleEn}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55 }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#091A42] via-[#091A42]/15 to-transparent opacity-85 pointer-events-none" />

                <div className={`absolute ${heroLayout.cardOverlayClass} backdrop-blur-md bg-[#091A42]/90 border border-blue-400/30 flex items-center justify-between text-xs text-white`}>
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#FD5202]/20 text-[#FD5202] shrink-0">
                      <ShieldCheck weight="duotone" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-[11px] sm:text-xs truncate">
                        {isRtl ? 'تضمین اصالت و دقت مهندسی' : 'Guaranteed Precision & Spares'}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                        {isRtl ? 'مطابق استاندارد ماشین‌ابزار آلمان' : 'German Industrial Machining Standards'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block font-mono text-[11px] text-[#A6D6FE] bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800">
                    ISO 9001
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4 Key Proof Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className={`${heroLayout.metricsGridClass} border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4`}
        >
          <div className="flex items-center gap-2 sm:gap-3.5">
            <div className={`${heroLayout.metricIconBoxClass} bg-white dark:bg-blue-950/80 border border-slate-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE] shadow-sm shrink-0`}>
              <Users weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className={`font-black ${heroLayout.metricValueClass} text-[#091A42] dark:text-white tabular-nums`}>+۴,۰۰۰</p>
              <p className={`${heroLayout.metricLabelClass} text-slate-600 dark:text-slate-400 truncate`}>{t.stats.units}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <div className={`${heroLayout.metricIconBoxClass} bg-white dark:bg-blue-950/80 border border-slate-200 dark:border-blue-800 text-[#FD5202] shadow-sm shrink-0`}>
              <Toolbox weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className={`font-black ${heroLayout.metricValueClass} text-[#091A42] dark:text-white truncate`}>پایون (Payon)</p>
              <p className={`${heroLayout.metricLabelClass} text-slate-600 dark:text-slate-400 truncate`}>{t.stats.rep}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <div className={`${heroLayout.metricIconBoxClass} bg-white dark:bg-blue-950/80 border border-slate-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE] shadow-sm shrink-0`}>
              <Cpu weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className={`font-black ${heroLayout.metricValueClass} text-[#091A42] dark:text-white tabular-nums`}>+۲۰,۰۰۰</p>
              <p className={`${heroLayout.metricLabelClass} text-slate-600 dark:text-slate-400 truncate`}>{t.stats.sharpened}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <div className={`${heroLayout.metricIconBoxClass} bg-white dark:bg-blue-950/80 border border-slate-200 dark:border-blue-800 text-[#FD5202] shadow-sm shrink-0`}>
              <ShieldCheck weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className={`font-black ${heroLayout.metricValueClass} text-[#091A42] dark:text-white`}>VOLLMER</p>
              <p className={`${heroLayout.metricLabelClass} text-slate-600 dark:text-slate-400 truncate`}>{t.stats.germanTech}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
