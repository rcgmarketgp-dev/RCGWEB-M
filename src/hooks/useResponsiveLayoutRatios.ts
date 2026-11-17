import { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';

export type ViewportDensityTier = 'narrow-mobile' | 'mobile' | 'wide-mobile' | 'desktop';

export interface HeroResponsiveTokens {
  sectionPadding: string;
  containerPadding: string;
  gridGap: string;
  contentStackGap: string;
  kickerClass: string;
  headlineBoxMinHeight: string;
  headlineClass: string;
  subtitleClass: string;
  ctaGroupGap: string;
  ctaButtonClass: string;
  paginationClass: string;
  cardOverlayClass: string;
  metricsGridClass: string;
  metricIconBoxClass: string;
  metricValueClass: string;
  metricLabelClass: string;
}

export interface DepartmentsResponsiveTokens {
  sectionPadding: string;
  containerPadding: string;
  headerSpacing: string;
  badgeClass: string;
  titleClass: string;
  subtitleClass: string;
  masterGridGap: string;
  cardPadding: string;
  bannerOverlayPadding: string;
  bannerTitleClass: string;
  bannerDescClass: string;
  subSectionGap: string;
  subTitleClass: string;
  subGridGap: string;
  subCardPadding: string;
  subCardTitleClass: string;
  bottomBannerPadding: string;
  bottomBannerTextClass: string;
}

export interface ResponsiveLayoutRatios {
  viewportWidth: number;
  isCompactMobile: boolean;
  tier: ViewportDensityTier;
  textRatio: number;
  paddingRatio: number;
  gapRatio: number;
  hero: HeroResponsiveTokens;
  departments: DepartmentsResponsiveTokens;
}

const MOBILE_BREAKPOINT = 640;

function getViewportWidth(): number {
  if (typeof window === 'undefined') return 1024;
  return window.innerWidth || document.documentElement?.clientWidth || 1024;
}

function getDensityTier(width: number): ViewportDensityTier {
  if (width >= MOBILE_BREAKPOINT) return 'desktop';
  if (width < 390) return 'narrow-mobile';
  if (width < 520) return 'mobile';
  return 'wide-mobile';
}

export function useResponsiveLayoutRatios(language: Language = 'fa'): ResponsiveLayoutRatios {
  const [viewportWidth, setViewportWidth] = useState<number>(getViewportWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateWidth = () => {
      const next = getViewportWidth();
      setViewportWidth((prev) => (prev === next ? prev : next));
    };

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    updateWidth();

    window.addEventListener('resize', updateWidth, { passive: true });
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateWidth);
    }

    return () => {
      window.removeEventListener('resize', updateWidth);
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateWidth);
      }
    };
  }, []);

  return useMemo(() => {
    const isCompactMobile = viewportWidth < MOBILE_BREAKPOINT;
    const tier = getDensityTier(viewportWidth);
    const isRtl = language === 'fa';

    // Continuous bounded ratios below 640px for balanced mobile typography & spacing
    const clampedRatio = isCompactMobile
      ? Math.max(0.84, Math.min(0.97, viewportWidth / MOBILE_BREAKPOINT))
      : 1;

    const textRatio = Number((isCompactMobile ? 0.86 + (clampedRatio - 0.84) * 0.85 : 1).toFixed(2));
    const paddingRatio = Number((isCompactMobile ? 0.78 + (clampedRatio - 0.84) * 1.15 : 1).toFixed(2));
    const gapRatio = Number((isCompactMobile ? 0.76 + (clampedRatio - 0.84) * 1.2 : 1).toFixed(2));

    const heroByTier: Record<ViewportDensityTier, HeroResponsiveTokens> = {
      'narrow-mobile': {
        sectionPadding: 'pt-4 pb-9',
        containerPadding: 'px-3',
        gridGap: 'gap-5',
        contentStackGap: 'space-y-3',
        kickerClass: 'px-2.5 py-1 text-[10px] gap-1',
        headlineBoxMinHeight: 'min-h-[76px]',
        headlineClass: isRtl
          ? 'text-[1.35rem] leading-[1.42] tracking-tight'
          : 'text-[1.375rem] leading-[1.28] tracking-tight',
        subtitleClass: isRtl
          ? 'text-[13px] leading-[1.75]'
          : 'text-[13px] leading-[1.6]',
        ctaGroupGap: 'gap-2 pt-0.5',
        ctaButtonClass: 'px-4 py-2.5 min-h-[42px] text-[13px]',
        paginationClass: 'gap-2.5 pt-3 text-xs',
        cardOverlayClass: 'bottom-2 left-2 right-2 p-2 rounded-xl',
        metricsGridClass: 'mt-6 pt-4 gap-2.5',
        metricIconBoxClass: 'p-2 rounded-xl',
        metricValueClass: 'text-[15px]',
        metricLabelClass: 'text-[10px]',
      },
      mobile: {
        sectionPadding: 'pt-5 pb-11',
        containerPadding: 'px-4',
        gridGap: 'gap-6',
        contentStackGap: 'space-y-3.5',
        kickerClass: 'px-3 py-1 text-[11px] gap-1.5',
        headlineBoxMinHeight: 'min-h-[84px]',
        headlineClass: isRtl
          ? 'text-[1.52rem] leading-[1.36] tracking-tight'
          : 'text-[1.55rem] leading-[1.25] tracking-tight',
        subtitleClass: isRtl
          ? 'text-[13.5px] leading-[1.72]'
          : 'text-sm leading-[1.6]',
        ctaGroupGap: 'gap-2.5 pt-1',
        ctaButtonClass: 'px-5 py-3 min-h-[44px] text-sm',
        paginationClass: 'gap-3 pt-3.5 text-sm',
        cardOverlayClass: 'bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl',
        metricsGridClass: 'mt-8 pt-5 gap-3',
        metricIconBoxClass: 'p-2.5 rounded-xl',
        metricValueClass: 'text-base',
        metricLabelClass: 'text-[11px]',
      },
      'wide-mobile': {
        sectionPadding: 'pt-6 pb-12',
        containerPadding: 'px-5',
        gridGap: 'gap-7',
        contentStackGap: 'space-y-4',
        kickerClass: 'px-3 py-1.5 text-[11px] gap-1.5',
        headlineBoxMinHeight: 'min-h-[96px]',
        headlineClass: isRtl
          ? 'text-[1.75rem] leading-[1.32] tracking-tight'
          : 'text-[1.8rem] leading-[1.22] tracking-tight',
        subtitleClass: isRtl
          ? 'text-[15px] leading-[1.7]'
          : 'text-[15px] leading-[1.6]',
        ctaGroupGap: 'gap-3 pt-1.5',
        ctaButtonClass: 'px-5 py-3 min-h-[46px] text-sm',
        paginationClass: 'gap-4 pt-4 text-sm',
        cardOverlayClass: 'bottom-3 left-3 right-3 p-3 rounded-2xl',
        metricsGridClass: 'mt-9 pt-6 gap-4',
        metricIconBoxClass: 'p-2.5 rounded-2xl',
        metricValueClass: 'text-base',
        metricLabelClass: 'text-xs',
      },
      desktop: {
        sectionPadding: 'pt-10 pb-16 lg:py-20',
        containerPadding: 'px-6 lg:px-8',
        gridGap: 'gap-10',
        contentStackGap: 'space-y-6',
        kickerClass: 'px-3.5 py-1.5 text-xs gap-2',
        headlineBoxMinHeight: 'min-h-[145px]',
        headlineClass: 'text-4xl md:text-5xl lg:text-[3.1rem] leading-[1.25] tracking-tight',
        subtitleClass: 'text-lg leading-relaxed',
        ctaGroupGap: 'gap-3.5 pt-2',
        ctaButtonClass: 'px-6 py-3.5 min-h-[46px] text-sm',
        paginationClass: 'gap-6 pt-5 text-sm',
        cardOverlayClass: 'bottom-4 left-4 right-4 p-3.5 rounded-2xl',
        metricsGridClass: 'mt-14 pt-8 gap-6',
        metricIconBoxClass: 'p-3 rounded-2xl',
        metricValueClass: 'text-lg',
        metricLabelClass: 'text-xs',
      },
    };

    const departmentsByTier: Record<ViewportDensityTier, DepartmentsResponsiveTokens> = {
      'narrow-mobile': {
        sectionPadding: 'py-10',
        containerPadding: 'px-3',
        headerSpacing: 'mb-7 space-y-2',
        badgeClass: 'px-2.5 py-1 text-[10px] gap-1.5',
        titleClass: isRtl
          ? 'text-[1.35rem] leading-[1.35] tracking-tight'
          : 'text-[1.4rem] leading-[1.25] tracking-tight',
        subtitleClass: isRtl
          ? 'text-[13px] leading-[1.72]'
          : 'text-[13px] leading-[1.6]',
        masterGridGap: 'gap-4',
        cardPadding: 'p-3.5 space-y-3.5',
        bannerOverlayPadding: 'p-2.5',
        bannerTitleClass: 'text-base leading-snug',
        bannerDescClass: 'text-[11px] mt-0.5',
        subSectionGap: 'space-y-2',
        subTitleClass: 'text-[10px]',
        subGridGap: 'gap-1.5',
        subCardPadding: 'p-1',
        subCardTitleClass: 'text-[9.5px] leading-tight',
        bottomBannerPadding: 'p-2.5 gap-2',
        bottomBannerTextClass: 'text-[11px]',
      },
      mobile: {
        sectionPadding: 'py-12',
        containerPadding: 'px-4',
        headerSpacing: 'mb-8 space-y-2.5',
        badgeClass: 'px-3 py-1 text-[11px] gap-2',
        titleClass: isRtl
          ? 'text-[1.55rem] leading-[1.32] tracking-tight'
          : 'text-[1.6rem] leading-[1.24] tracking-tight',
        subtitleClass: isRtl
          ? 'text-[13.5px] leading-[1.7]'
          : 'text-sm leading-[1.6]',
        masterGridGap: 'gap-5',
        cardPadding: 'p-4 space-y-4',
        bannerOverlayPadding: 'p-3',
        bannerTitleClass: 'text-lg leading-snug',
        bannerDescClass: 'text-[11px] mt-0.5',
        subSectionGap: 'space-y-2.5',
        subTitleClass: 'text-[11px]',
        subGridGap: 'gap-2',
        subCardPadding: 'p-1.5',
        subCardTitleClass: 'text-[10px] leading-tight',
        bottomBannerPadding: 'p-3 gap-2.5',
        bottomBannerTextClass: 'text-xs',
      },
      'wide-mobile': {
        sectionPadding: 'py-14',
        containerPadding: 'px-5',
        headerSpacing: 'mb-10 space-y-3',
        badgeClass: 'px-3.5 py-1.5 text-[11px] gap-2',
        titleClass: isRtl
          ? 'text-[1.8rem] leading-[1.28] tracking-tight'
          : 'text-[1.85rem] leading-[1.22] tracking-tight',
        subtitleClass: isRtl
          ? 'text-[15px] leading-[1.68]'
          : 'text-[15px] leading-[1.6]',
        masterGridGap: 'gap-6',
        cardPadding: 'p-5 space-y-5',
        bannerOverlayPadding: 'p-3.5',
        bannerTitleClass: 'text-xl leading-snug',
        bannerDescClass: 'text-xs mt-0.5',
        subSectionGap: 'space-y-2.5',
        subTitleClass: 'text-xs',
        subGridGap: 'gap-2.5',
        subCardPadding: 'p-1.5',
        subCardTitleClass: 'text-[11px] leading-tight',
        bottomBannerPadding: 'p-3.5 gap-3',
        bottomBannerTextClass: 'text-xs',
      },
      desktop: {
        sectionPadding: 'py-20 lg:py-24',
        containerPadding: 'px-6 lg:px-8',
        headerSpacing: 'mb-14 space-y-3',
        badgeClass: 'px-3.5 py-1.5 text-xs gap-2',
        titleClass: 'text-4xl lg:text-5xl tracking-tight',
        subtitleClass: 'text-lg leading-relaxed',
        masterGridGap: 'gap-8 lg:gap-10',
        cardPadding: 'p-6 lg:p-7 space-y-6',
        bannerOverlayPadding: 'p-4',
        bannerTitleClass: 'text-2xl',
        bannerDescClass: 'text-sm mt-0.5',
        subSectionGap: 'space-y-3',
        subTitleClass: 'text-sm',
        subGridGap: 'gap-3',
        subCardPadding: 'p-2',
        subCardTitleClass: 'text-[11px] leading-tight',
        bottomBannerPadding: 'p-4 gap-3',
        bottomBannerTextClass: 'text-sm',
      },
    };

    return {
      viewportWidth,
      isCompactMobile,
      tier,
      textRatio,
      paddingRatio,
      gapRatio,
      hero: heroByTier[tier],
      departments: departmentsByTier[tier],
    };
  }, [viewportWidth, language]);
}
