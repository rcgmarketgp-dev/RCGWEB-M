import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  SiteSettings,
  UiDesignPreset,
  ButtonThemeStyle,
  UiInteractionMode,
  ScrollSnapBehavior,
  ExternalIconSet,
} from '../types';
import {
  UI_DESIGN_PRESETS,
  BUTTON_THEME_OPTIONS,
  UI_INTERACTION_OPTIONS,
  SCROLL_SNAP_OPTIONS,
  EXTERNAL_ICON_PACKS,
  EXTERNAL_GOOGLE_FONTS,
  IconifySearchResult,
  searchIconifyIcons,
  DesignSystemPresetSpec,
} from '../utils/uiThemes';
import { ExternalIconBadge } from './ExternalIconBadge';
import {
  X,
  Palette,
  Sparkles,
  Sliders,
  Globe,
  Search,
  RefreshCw,
  Check,
  RotateCcw,
  CloudUpload,
  MousePointerClick,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Loader2,
  Type,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UiThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings: SiteSettings;
  onApplySettings: (updated: SiteSettings) => void;
  canPublishCloud: boolean;
}

type StudioTab = 'presets' | 'buttons' | 'external';

export const UiThemePickerModal: React.FC<UiThemePickerModalProps> = ({
  isOpen,
  onClose,
  language,
  settings,
  onApplySettings,
  canPublishCloud,
}) => {
  const isRtl = language === 'fa';
  const [activeTab, setActiveTab] = useState<StudioTab>('presets');

  const activePreset = settings.uiPreset || 'rcg-corporate';
  const activeButtonStyle = settings.buttonStyle || 'solid-gradient';
  const activeInteraction = settings.uiInteraction || 'corporate-smooth';
  const activeScrollSnap = settings.scrollSnapMode || 'proximity';
  const activeIconPack = settings.externalIconPack || 'lucide-default';
  const activeFontEn = settings.externalFontEn || 'Plus Jakarta Sans';

  // Live External Iconify API State
  const selectedPackMeta =
    EXTERNAL_ICON_PACKS.find((p) => p.id === activeIconPack) || EXTERNAL_ICON_PACKS[0];
  const [iconQuery, setIconQuery] = useState<string>(selectedPackMeta.suggestedQueries[0] || 'settings');
  const [iconResults, setIconResults] = useState<IconifySearchResult[]>([]);
  const [iconsLoading, setIconsLoading] = useState<boolean>(false);
  const [iconsError, setIconsError] = useState<string | null>(null);

  const fetchIcons = useCallback(
    async (query: string, prefix: string) => {
      setIconsLoading(true);
      setIconsError(null);
      try {
        const res = await searchIconifyIcons(query, prefix, 18);
        setIconResults(res);
      } catch (err) {
        setIconsError(
          isRtl
            ? 'اتصال به سرور Iconify برقرار نشد. لطفاً دوباره تلاش کنید.'
            : err instanceof Error
            ? err.message
            : 'Unable to reach Iconify API.'
        );
      } finally {
        setIconsLoading(false);
      }
    },
    [isRtl]
  );

  useEffect(() => {
    if (isOpen && activeTab === 'external') {
      void fetchIcons(iconQuery, selectedPackMeta.prefix);
    }
  }, [isOpen, activeTab, selectedPackMeta.prefix, fetchIcons, iconQuery]);

  if (!isOpen) return null;

  const updatePartial = (patch: Partial<SiteSettings>) => {
    onApplySettings({
      ...settings,
      ...patch,
    });
  };

  const applyPresetBundle = (preset: DesignSystemPresetSpec) => {
    const packMeta = EXTERNAL_ICON_PACKS.find((p) => p.id === preset.externalIconPack);
    const defaultCtaIcons: Record<UiDesignPreset, string> = {
      'rcg-corporate': '',
      'material-you': 'mdi:rocket-launch',
      'apple-glass': 'solar:bolt-bold',
      'carbon-industrial': 'ph:gear-duotone',
      'swiss-minimal': 'tabler:arrow-up-right',
    };

    onApplySettings({
      ...settings,
      uiPreset: preset.id,
      buttonStyle: preset.buttonStyle,
      uiInteraction: preset.uiInteraction,
      scrollSnapMode: preset.scrollSnapMode,
      externalIconPack: preset.externalIconPack,
      externalCtaIcon: defaultCtaIcons[preset.id] || '',
      externalFontEn: preset.externalFontEn,
    });

    if (packMeta) {
      setIconQuery(packMeta.suggestedQueries[0] || 'settings');
    }
  };

  const handleResetDefaults = () => {
    onApplySettings({
      ...settings,
      uiPreset: 'rcg-corporate',
      buttonStyle: 'solid-gradient',
      uiInteraction: 'corporate-smooth',
      scrollSnapMode: 'proximity',
      externalIconPack: 'lucide-default',
      externalCtaIcon: '',
      externalFontEn: 'Plus Jakarta Sans',
    });
  };

  const handlePackSelect = (packId: ExternalIconSet) => {
    const pack = EXTERNAL_ICON_PACKS.find((p) => p.id === packId);
    updatePartial({ externalIconPack: packId });
    if (pack) {
      const nextQuery = pack.suggestedQueries[0] || 'settings';
      setIconQuery(nextQuery);
      void fetchIcons(nextQuery, pack.prefix);
    }
  };

  const updateButtonStyle = (styleId: ButtonThemeStyle) => updatePartial({ buttonStyle: styleId });
  const updateInteraction = (modeId: UiInteractionMode) => updatePartial({ uiInteraction: modeId });
  const updateScrollSnap = (snapId: ScrollSnapBehavior) => updatePartial({ scrollSnapMode: snapId });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-5 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl max-h-[94dvh] bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="px-4 sm:px-7 py-3 sm:py-4 bg-slate-50 dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FD5202]/15 border border-[#FD5202]/30 text-[#FD5202] flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-black text-[#091A42] dark:text-white flex items-center gap-2 flex-wrap">
                  <span className="truncate">{isRtl ? 'استودیو انتخاب تم کلیدها و رابط کاربری' : 'UI & Button Theme Studio'}</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/70 text-[#144AE0] dark:text-[#A6D6FE]">
                    {isRtl ? 'متصل به منابع بیرونی' : 'External Live Engine'}
                  </span>
                </h2>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? 'با کلیک روی هر گزینه، ظاهر کلیدها، انیمیشن تعامل، اسکرول و آیکون‌های زنده کل سایت فوراً تغییر می‌کند.'
                    : 'Click any option to preview real-time changes across site buttons, motion physics, scroll snap & live external icons.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white dark:bg-blue-950 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-blue-800 transition-colors cursor-pointer shrink-0"
              aria-label={isRtl ? 'بستن' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Interactive Preview Strip */}
          <div className="px-4 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-slate-100 via-blue-50/70 to-orange-50/50 dark:from-[#071330] dark:via-[#091A42] dark:to-[#071330] border-b border-slate-200 dark:border-blue-900/50 shrink-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#144AE0] dark:text-[#A6D6FE] flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-[#FD5202] shrink-0" />
                  <span>
                    {isRtl
                      ? 'پیش‌نمایش زنده (روی کلیدها کلیک کنید):'
                      : 'Live Interactive Preview (tap & click buttons):'}
                  </span>
                </span>
                <div className="hidden sm:flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 font-semibold">
                    {isRtl ? 'پکیج:' : 'Preset:'}{' '}
                    {isRtl
                      ? UI_DESIGN_PRESETS.find((p) => p.id === activePreset)?.nameFa
                      : UI_DESIGN_PRESETS.find((p) => p.id === activePreset)?.nameEn}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 font-semibold">
                    {isRtl ? 'فونت لاتین:' : 'Font:'} <span className="font-mono">{activeFontEn}</span>
                  </span>
                  {settings.externalCtaIcon && (
                    <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 font-mono flex items-center gap-1">
                      <ExternalIconBadge
                        iconName={settings.externalCtaIcon}
                        className="w-3.5 h-3.5"
                        invertColor={false}
                        fallback={<Sparkles className="w-3 h-3" />}
                      />
                      <span>{settings.externalCtaIcon}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="rcg-btn-primary group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 min-h-[40px] text-[11px] sm:text-sm font-bold text-white bg-[#FD5202] hover:bg-[#E04600] rounded-xl shadow-md cursor-pointer"
                >
                  <ExternalIconBadge
                    iconName={settings.externalCtaIcon}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                    invertColor={true}
                    fallback={<Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                  />
                  <span className="truncate">{isRtl ? 'کلید اصلی (CTA)' : 'Primary CTA'}</span>
                  {isRtl ? <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                </button>

                <button
                  type="button"
                  className="rcg-btn-secondary flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] text-[11px] sm:text-sm font-bold text-[#091A42] dark:text-white bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-700 rounded-xl shadow-sm cursor-pointer"
                >
                  <span className="truncate">{isRtl ? 'کلید ثانویه' : 'Secondary'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-3 sm:px-7 pt-2 sm:pt-3 bg-slate-50/70 dark:bg-[#060F26]/70 border-b border-slate-200 dark:border-blue-900/50 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[42px] text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-[#FD5202] text-[#FD5202] bg-white dark:bg-[#091A42]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>{isRtl ? '۱. سیستم‌های طراحی بیرونی' : '1. External Design Systems'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buttons')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[42px] text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'buttons'
                  ? 'border-[#FD5202] text-[#FD5202] bg-white dark:bg-[#091A42]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>{isRtl ? '۲. استایل کلیدها و اسکرول' : '2. Button Style & Motion'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('external')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[42px] text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'external'
                  ? 'border-[#FD5202] text-[#FD5202] bg-white dark:bg-[#091A42]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>{isRtl ? '۳. آیکون زنده (Iconify) و فونت' : '3. Live Iconify & Fonts'}</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-3.5 sm:p-7 overflow-y-auto flex-1 space-y-5 sm:space-y-6">
            {/* TAB 1: DESIGN SYSTEM PRESETS */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UI_DESIGN_PRESETS.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPresetBundle(preset)}
                      className={`group rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isSelected
                          ? 'border-[#FD5202] bg-orange-50/40 dark:bg-[#FD5202]/10 shadow-lg'
                          : 'border-slate-200 dark:border-blue-900/60 bg-slate-50/60 dark:bg-[#060F26]/70 hover:border-[#144AE0] dark:hover:border-blue-500'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-[#091A42] dark:text-white">
                              {isRtl ? preset.nameFa : preset.nameEn}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                                style={{ backgroundColor: preset.badgeColor }}
                              >
                                {preset.sourceName}
                              </span>
                              <a
                                href={preset.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-[#144AE0] dark:text-[#A6D6FE] hover:underline font-mono"
                              >
                                <span>{preset.sourceUrl.replace(/^https?:\/\//, '').split('/')[0]}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-[#FD5202] border-[#FD5202] text-white'
                                : 'border-slate-300 dark:border-blue-800 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {isRtl ? preset.descFa : preset.descEn}
                        </p>
                      </div>

                      {/* Mini Specimen Showcase Inside Card */}
                      <div className="pt-3 border-t border-slate-200/80 dark:border-blue-900/50 space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 ${preset.previewPrimaryCls}`}>
                            <span>{isRtl ? 'نمونه کلید اصلی' : 'Primary CTA'}</span>
                          </span>
                          <span className={`px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 ${preset.previewSecondaryCls}`}>
                            <span>{isRtl ? 'کلید ثانویه' : 'Secondary'}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>Motion: {preset.uiInteraction}</span>
                          <span>Font: {preset.externalFontEn}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: BUTTONS + INTERACTION + SCROLL SNAP */}
            {activeTab === 'buttons' && (
              <div className="space-y-7">
                {/* 1. Button Geometry & Material Style */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FD5202]" />
                    <span>{isRtl ? 'تم و شکل هندسی کلیدهای سایت' : 'Button Shape, Surface & Theme'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {BUTTON_THEME_OPTIONS.map((opt) => {
                      const active = activeButtonStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateButtonStyle(opt.id)}
                          className={`p-4 rounded-2xl border-2 text-right rtl:text-right ltr:text-left transition-all cursor-pointer space-y-1.5 ${
                            active
                              ? 'border-[#FD5202] bg-orange-50/50 dark:bg-[#FD5202]/15 shadow-md'
                              : 'border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-[#060F26] hover:border-[#144AE0]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-[#091A42] dark:text-white">
                              {isRtl ? opt.labelFa : opt.labelEn}
                            </span>
                            {active && <Check className="w-4 h-4 text-[#FD5202] shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.descFa}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. UI Interaction / Motion Curve */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
                    <span>{isRtl ? 'نحوه عملکرد و فیزیک حرکتی رابط کاربری (Hover / Click)' : 'UI Interaction & Motion Physics'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {UI_INTERACTION_OPTIONS.map((opt) => {
                      const active = activeInteraction === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateInteraction(opt.id)}
                          className={`p-4 rounded-2xl border-2 text-right rtl:text-right ltr:text-left transition-all cursor-pointer space-y-1 ${
                            active
                              ? 'border-[#144AE0] bg-blue-50/70 dark:bg-blue-900/35 shadow-md'
                              : 'border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-[#060F26] hover:border-[#144AE0]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-extrabold text-[#091A42] dark:text-white">
                              {isRtl ? opt.labelFa : opt.labelEn}
                            </span>
                            {active && <Check className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.descFa}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Scroll Snap Behavior */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#FD5202]" />
                    <span>{isRtl ? 'رفتار اسکرول و هم‌ترازی بخش‌های صفحه (Scroll Snap)' : 'Viewport Scroll-Snap Behavior'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SCROLL_SNAP_OPTIONS.map((opt) => {
                      const active = activeScrollSnap === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateScrollSnap(opt.id)}
                          className={`p-4 rounded-2xl border-2 text-right rtl:text-right ltr:text-left transition-all cursor-pointer space-y-1 ${
                            active
                              ? 'border-[#FD5202] bg-orange-50/50 dark:bg-[#FD5202]/15 shadow-md'
                              : 'border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-[#060F26] hover:border-[#144AE0]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-extrabold text-[#091A42] dark:text-white">
                              {isRtl ? opt.labelFa : opt.labelEn}
                            </span>
                            {active && <Check className="w-4 h-4 text-[#FD5202]" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.descFa}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LIVE EXTERNAL ICONIFY API & GOOGLE FONTS */}
            {activeTab === 'external' && (
              <div className="space-y-7">
                {/* 1. Live Iconify External API Integration */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#FD5202]" />
                        <span>{isRtl ? 'مخزن زنده آیکون کلیدها (Iconify External REST API)' : 'Live Button Icons (Iconify External REST API)'}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isRtl
                          ? 'جستجو و انتخاب مستقیم آیکون از کتابخانه‌های جهانی Material Design، Phosphor، Tabler و Solar از api.iconify.design'
                          : 'Search & select vector icons live from api.iconify.design (Material, Phosphor, Tabler, Solar, Lucide)'}
                      </p>
                    </div>

                    {settings.externalCtaIcon && (
                      <button
                        type="button"
                        onClick={() => updatePartial({ externalCtaIcon: '' })}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        {isRtl ? 'حذف آیکون بیرونی (استفاده از پیش‌فرض)' : 'Clear Custom Icon'}
                      </button>
                    )}
                  </div>

                  {/* External Icon Pack Selector */}
                  <div className="flex flex-wrap gap-2">
                    {EXTERNAL_ICON_PACKS.map((pack) => {
                      const active = activeIconPack === pack.id;
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          onClick={() => handlePackSelect(pack.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            active
                              ? 'bg-[#144AE0] text-white border-[#144AE0] shadow-sm'
                              : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-800 hover:border-[#144AE0]'
                          }`}
                        >
                          <span>{isRtl ? pack.nameFa : pack.nameEn}</span>
                          <span className="text-[10px] font-mono opacity-75">({pack.prefix})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Box + Quick Suggestions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5" />
                      <input
                        type="text"
                        value={iconQuery}
                        onChange={(e) => setIconQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void fetchIcons(iconQuery, selectedPackMeta.prefix);
                          }
                        }}
                        placeholder={isRtl ? 'جستجوی انگلیسی نام آیکون (مثلاً rocket, gear, wrench)...' : 'Search icon name (e.g. rocket, gear, wrench)...'}
                        className="w-full bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 focus:border-[#FD5202] rounded-xl rtl:pr-10 rtl:pl-3.5 ltr:pl-10 ltr:pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void fetchIcons(iconQuery, selectedPackMeta.prefix)}
                      disabled={iconsLoading}
                      className="px-4 py-2.5 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {iconsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      <span>{isRtl ? 'دریافت از API' : 'Search API'}</span>
                    </button>
                  </div>

                  {/* Suggested Query Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'پیشنهادها:' : 'Suggestions:'}</span>
                    {selectedPackMeta.suggestedQueries.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setIconQuery(q);
                          void fetchIcons(q, selectedPackMeta.prefix);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono border cursor-pointer transition-colors ${
                          iconQuery === q
                            ? 'bg-orange-50 dark:bg-[#FD5202]/20 border-[#FD5202] text-[#FD5202]'
                            : 'bg-white dark:bg-[#091A42] border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 hover:border-[#144AE0]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Icons Result Grid */}
                  {iconsError ? (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{iconsError}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => void fetchIcons(iconQuery, selectedPackMeta.prefix)}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
                      >
                        {isRtl ? 'تلاش مجدد' : 'Retry'}
                      </button>
                    </div>
                  ) : iconsLoading ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-[#FD5202]" />
                      <span>{isRtl ? 'در حال دریافت آیکون‌ها از api.iconify.design...' : 'Fetching live icons from api.iconify.design...'}</span>
                    </div>
                  ) : iconResults.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                      {isRtl ? 'آیکونی با این کلیدواژه یافت نشد. کلیدواژه انگلیسی دیگری امتحان کنید.' : 'No icons matched that query.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {iconResults.map((item) => {
                        const isChosen = settings.externalCtaIcon === item.iconName;
                        return (
                          <button
                            key={item.iconName}
                            type="button"
                            onClick={() => updatePartial({ externalCtaIcon: item.iconName })}
                            title={item.iconName}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isChosen
                                ? 'border-[#FD5202] bg-orange-50 dark:bg-[#FD5202]/20 ring-2 ring-[#FD5202]/30'
                                : 'border-slate-200 dark:border-blue-900 bg-white dark:bg-[#091A42] hover:border-[#144AE0]'
                            }`}
                          >
                            <img
                              src={item.svgUrl}
                              alt={item.iconName}
                              className="w-6 h-6 dark:invert"
                            />
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-full">
                              {item.iconName.split(':')[1]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. External Google Fonts CDN Selector */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
                      <span>{isRtl ? 'تایپوگرافی لاتین از Google Fonts CDN' : 'External Google Fonts CDN (English & Badges)'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isRtl
                        ? 'فونت استاندارد فارسی (IRANYekan) حفظ می‌شود و فونت اعداد و نسخه انگلیسی مستقیماً از fonts.googleapis.com بارگذاری می‌گردد.'
                        : 'Loaded live from Google Fonts CDN for English typography while preserving IRANYekan for RTL Persian.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {EXTERNAL_GOOGLE_FONTS.map((f) => {
                      const active = activeFontEn === f.family;
                      return (
                        <button
                          key={f.family}
                          type="button"
                          onClick={() => updatePartial({ externalFontEn: f.family })}
                          className={`p-3.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            active
                              ? 'border-[#144AE0] bg-blue-50 dark:bg-blue-900/35'
                              : 'border-slate-200 dark:border-blue-800 bg-white dark:bg-[#091A42] hover:border-[#144AE0]'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-extrabold text-[#091A42] dark:text-white">{f.family}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{f.labelFa}</p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-blue-950 text-slate-600 dark:text-[#A6D6FE]">
                            {f.styleTag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="px-4 sm:px-7 py-3 sm:py-4 bg-slate-50 dark:bg-[#060F26] border-t border-slate-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <CloudUpload className={`w-4 h-4 shrink-0 ${canPublishCloud ? 'text-emerald-500' : 'text-[#144AE0] dark:text-[#A6D6FE]'}`} />
              <span className="leading-snug">
                {canPublishCloud
                  ? isRtl
                    ? 'تغییرات شما هم‌زمان در فضای ابری (Firestore) برای همه کاربران منتشر می‌شود.'
                    : 'Admin active: changes publish live to Firestore for all visitors.'
                  : isRtl
                  ? 'انتخاب شما به‌صورت زنده روی مرورگر اعمال و ذخیره می‌شود.'
                  : 'Applied live as your interactive browser UI preset.'}
              </span>
            </div>

            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold bg-white dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isRtl ? 'بازگردانی استاندارد' : 'Reset Default'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rcg-btn-primary flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 min-h-[42px] rounded-xl text-xs font-bold bg-[#FD5202] hover:bg-[#E04600] text-white shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span className="truncate">{isRtl ? 'تایید و مشاهده سایت' : 'Apply & View Site'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
