import {
  ButtonThemeStyle,
  ExternalIconSet,
  ScrollSnapBehavior,
  SiteSettings,
  UiDesignPreset,
  UiInteractionMode,
} from '../types';

export interface DesignSystemPresetSpec {
  id: UiDesignPreset;
  nameFa: string;
  nameEn: string;
  sourceName: string;
  sourceUrl: string;
  descFa: string;
  descEn: string;
  buttonStyle: ButtonThemeStyle;
  uiInteraction: UiInteractionMode;
  scrollSnapMode: ScrollSnapBehavior;
  externalIconPack: ExternalIconSet;
  externalFontEn: string;
  previewPrimaryCls: string;
  previewSecondaryCls: string;
  badgeColor: string;
}

export const UI_DESIGN_PRESETS: DesignSystemPresetSpec[] = [
  {
    id: 'rcg-corporate',
    nameFa: 'استاندارد شرکتی آرسی (RCG)',
    nameEn: 'RCG Corporate Oxford',
    sourceName: 'RCG Brand Book + Tailwind UI',
    sourceUrl: 'https://tailwindcss.com',
    descFa: 'گوشه‌های مهندسی متوسط، گرادیانت نارنجی صنعتی و حرکت نرم شرکتی',
    descEn: 'Balanced corporate radius, industrial orange gradient & smooth ease transitions',
    buttonStyle: 'solid-gradient',
    uiInteraction: 'corporate-smooth',
    scrollSnapMode: 'proximity',
    externalIconPack: 'lucide-default',
    externalFontEn: 'Plus Jakarta Sans',
    previewPrimaryCls: 'rounded-xl bg-gradient-to-r from-[#FD5202] to-[#E04600] text-white shadow-md',
    previewSecondaryCls: 'rounded-xl bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-700 text-[#091A42] dark:text-white',
    badgeColor: '#FD5202',
  },
  {
    id: 'material-you',
    nameFa: 'متریال دیزاین ۳ (گوگل)',
    nameEn: 'Material Design 3 (M3)',
    sourceName: 'Google Material You 3',
    sourceUrl: 'https://m3.material.io',
    descFa: 'کلیدهای کپسولی تمام‌گرد (Pill)، سایه سطحی پویا و انیمیشن فنری لطیف',
    descEn: 'Full pill buttons, elevated tonal surfaces & Google spring micro-interactions',
    buttonStyle: 'pill-soft',
    uiInteraction: 'spring-playful',
    scrollSnapMode: 'proximity',
    externalIconPack: 'iconify-mdi',
    externalFontEn: 'Outfit',
    previewPrimaryCls: 'rounded-full bg-[#144AE0] hover:bg-[#0F3BB5] text-white shadow-lg shadow-blue-500/30',
    previewSecondaryCls: 'rounded-full bg-blue-50 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-700 text-[#144AE0] dark:text-[#A6D6FE]',
    badgeColor: '#144AE0',
  },
  {
    id: 'apple-glass',
    nameFa: 'شیشه‌ای شفاف (Apple HIG)',
    nameEn: 'Apple HIG Glassmorphism',
    sourceName: 'Apple Human Interface',
    sourceUrl: 'https://developer.apple.com/design/human-interface-guidelines',
    descFa: 'کلیدهای شیشه‌ای مات با تارشدگی پس‌زمینه (Backdrop Blur) و تعامل ابریشمی',
    descEn: 'Frosted translucent glass buttons, luminous borders & silky spring responsiveness',
    buttonStyle: 'glass-frost',
    uiInteraction: 'spring-playful',
    scrollSnapMode: 'proximity',
    externalIconPack: 'iconify-solar',
    externalFontEn: 'Manrope',
    previewPrimaryCls: 'rounded-2xl bg-[#FD5202]/85 backdrop-blur-md border border-white/40 text-white shadow-xl',
    previewSecondaryCls: 'rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-300/70 dark:border-white/25 text-slate-900 dark:text-white',
    badgeColor: '#0EA5E9',
  },
  {
    id: 'carbon-industrial',
    nameFa: 'صنعتی دقیق (IBM Carbon)',
    nameEn: 'IBM Carbon Industrial',
    sourceName: 'IBM Carbon Design System',
    sourceUrl: 'https://carbondesignsystem.com',
    descFa: 'لبه‌های تیز مهندسی، کلیدهای لمسی سه‌بعدی یا حاشیه‌دار و واکنش سریع خطی',
    descEn: 'Architectural sharp edges, tactile industrial depth & rapid linear technical response',
    buttonStyle: 'tactile-3d',
    uiInteraction: 'snappy-tech',
    scrollSnapMode: 'mandatory',
    externalIconPack: 'phosphor-duotone',
    externalFontEn: 'IBM Plex Sans',
    previewPrimaryCls: 'rounded-md bg-[#FD5202] text-white border-b-4 border-[#B83800]',
    previewSecondaryCls: 'rounded-md bg-slate-100 dark:bg-[#0B1E4D] border-2 border-[#091A42] dark:border-[#A6D6FE] text-[#091A42] dark:text-white',
    badgeColor: '#091A42',
  },
  {
    id: 'swiss-minimal',
    nameFa: 'مینیمال سوئیسی (Vercel / Geist)',
    nameEn: 'Vercel Swiss Minimal',
    sourceName: 'Vercel Geist + Radix UI',
    sourceUrl: 'https://vercel.com/geist',
    descFa: 'حاشیه‌های دقیق و مینیمال، کنتراست بالا و اسکرول آزاد بدون پرش اضافه',
    descEn: 'Sharp architectural outlines, high-contrast surfaces & crisp instant feedback',
    buttonStyle: 'sharp-outline',
    uiInteraction: 'snappy-tech',
    scrollSnapMode: 'off',
    externalIconPack: 'iconify-tabler',
    externalFontEn: 'Space Grotesk',
    previewPrimaryCls: 'rounded-lg bg-[#091A42] dark:bg-white text-white dark:text-[#091A42] border-2 border-[#091A42] dark:border-white',
    previewSecondaryCls: 'rounded-lg bg-transparent border-2 border-slate-900 dark:border-slate-200 text-slate-900 dark:text-white',
    badgeColor: '#334155',
  },
];

export const BUTTON_THEME_OPTIONS: {
  id: ButtonThemeStyle;
  labelFa: string;
  labelEn: string;
  descFa: string;
}[] = [
  { id: 'solid-gradient', labelFa: 'گرادیانت شرکتی استاندارد', labelEn: 'Corporate Gradient', descFa: 'گردی متعادل و سایه نرم' },
  { id: 'pill-soft', labelFa: 'کپسولی تمام‌گرد (Pill)', labelEn: 'Soft Full Pill', descFa: 'الهام از متریال ۳ گوگل' },
  { id: 'tactile-3d', labelFa: 'لمسی سه‌بعدی کارگاهی', labelEn: '3D Tactile Press', descFa: 'حس فشرده‌شدن مکانیکی' },
  { id: 'glass-frost', labelFa: 'شیشه‌ای مات (Glass)', labelEn: 'Frosted Glass', descFa: 'شفافیت با Blur مدرن' },
  { id: 'sharp-outline', labelFa: 'لبه تیز مهندسی (Sharp)', labelEn: 'Sharp Architectural', descFa: 'کادر تیز مینیمال و فنی' },
];

export const UI_INTERACTION_OPTIONS: {
  id: UiInteractionMode;
  labelFa: string;
  labelEn: string;
  descFa: string;
}[] = [
  { id: 'corporate-smooth', labelFa: 'نرم و موقر شرکتی', labelEn: 'Corporate Ease', descFa: 'حرکت متین و حرفه‌ای' },
  { id: 'spring-playful', labelFa: 'فنری و پویا (Spring)', labelEn: 'Spring Physics', descFa: 'جهش و بالاآمدن ظریف' },
  { id: 'snappy-tech', labelFa: 'سریع و فنی (Snappy)', labelEn: 'Snappy Tech', descFa: 'واکنش فوری در ۱۴۰ میلی‌ثانیه' },
  { id: 'reduced-instant', labelFa: 'ساده بدون انیمیشن', labelEn: 'Instant / Reduced', descFa: 'حداقل حرکت برای سرعت بالا' },
];

export const SCROLL_SNAP_OPTIONS: {
  id: ScrollSnapBehavior;
  labelFa: string;
  labelEn: string;
  descFa: string;
}[] = [
  { id: 'proximity', labelFa: 'اسنپ مغناطیسی نرم', labelEn: 'Soft Proximity Snap', descFa: 'تنظیم خودکار در نزدیکی مرز بخش‌ها' },
  { id: 'mandatory', labelFa: 'اسنپ قفل‌شونده هر بخش', labelEn: 'Mandatory Section Snap', descFa: 'توقف دقیق روی ابتدای هر بخش' },
  { id: 'off', labelFa: 'اسکرول آزاد کلاسیک', labelEn: 'Free Smooth Scroll', descFa: 'بدون اسنپ خودکار صفحه' },
];

export const EXTERNAL_ICON_PACKS: {
  id: ExternalIconSet;
  prefix: string;
  nameFa: string;
  nameEn: string;
  source: string;
  suggestedQueries: string[];
}[] = [
  {
    id: 'lucide-default',
    prefix: 'lucide',
    nameFa: 'آیکون‌های Lucide',
    nameEn: 'Lucide Icons',
    source: 'lucide.dev (via Iconify CDN)',
    suggestedQueries: ['arrow', 'settings', 'sparkles', 'phone', 'wrench', 'shield'],
  },
  {
    id: 'phosphor-duotone',
    prefix: 'ph',
    nameFa: 'آیکون‌های Phosphor',
    nameEn: 'Phosphor Icons',
    source: 'phosphoricons.com (via Iconify CDN)',
    suggestedQueries: ['gear', 'lightning', 'rocket', 'wrench', 'phone', 'star'],
  },
  {
    id: 'iconify-mdi',
    prefix: 'mdi',
    nameFa: 'Material Design (گوگل)',
    nameEn: 'Material Design Icons',
    source: 'pictogrammers.com / Google M3',
    suggestedQueries: ['saw-blade', 'cog', 'rocket-launch', 'phone', 'tools', 'check-decagram'],
  },
  {
    id: 'iconify-tabler',
    prefix: 'tabler',
    nameFa: 'آیکون‌های Tabler UI',
    nameEn: 'Tabler Icons',
    source: 'tabler.io (Open Source UI)',
    suggestedQueries: ['bolt', 'settings', 'tool', 'brand-speedtest', 'phone-call', 'layers'],
  },
  {
    id: 'iconify-solar',
    prefix: 'solar',
    nameFa: 'پک مدرن Solar',
    nameEn: 'Solar Bold/Linear',
    source: 'Iconify Solar Collection',
    suggestedQueries: ['settings', 'bolt', 'rocket', 'phone', 'shield-check', 'widget'],
  },
];

export const EXTERNAL_GOOGLE_FONTS: {
  family: string;
  labelFa: string;
  styleTag: string;
}[] = [
  { family: 'Plus Jakarta Sans', labelFa: 'Plus Jakarta Sans (پیش‌فرض شرکتی)', styleTag: 'Modern Sans' },
  { family: 'Outfit', labelFa: 'Outfit (متریال ۳ و مدرن)', styleTag: 'Geometric' },
  { family: 'Manrope', labelFa: 'Manrope (تکنولوژیک و خوانا)', styleTag: 'Clean Tech' },
  { family: 'IBM Plex Sans', labelFa: 'IBM Plex Sans (مهندسی و صنعتی)', styleTag: 'Industrial' },
  { family: 'Space Grotesk', labelFa: 'Space Grotesk (مینیمال سوئیسی)', styleTag: 'Architectural' },
];

export interface IconifySearchResult {
  iconName: string; // e.g., "mdi:rocket-launch"
  svgUrl: string;
}

export async function searchIconifyIcons(
  queryText: string,
  prefix?: string,
  limit = 18
): Promise<IconifySearchResult[]> {
  const cleanQuery = queryText.trim() || 'settings';
  const params = new URLSearchParams({
    query: cleanQuery,
    limit: String(limit),
  });
  if (prefix) {
    params.set('prefix', prefix);
  }
  const response = await fetch(`https://api.iconify.design/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Iconify API error: ${response.status}`);
  }
  const data = (await response.json()) as { icons?: string[] };
  const list = Array.isArray(data.icons) ? data.icons : [];
  return list.map((fullName) => {
    const [p, n] = fullName.split(':');
    return {
      iconName: fullName,
      svgUrl: `https://api.iconify.design/${encodeURIComponent(p)}/${encodeURIComponent(n)}.svg`,
    };
  });
}

export function getIconifySvgUrl(iconName: string): string | null {
  if (!iconName || !iconName.includes(':')) return null;
  const [prefix, name] = iconName.split(':');
  if (!prefix || !name) return null;
  return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg`;
}

export function applyUiThemeToDocument(settings: SiteSettings, language: 'fa' | 'en'): void {
  const root = document.documentElement;
  const preset = settings.uiPreset || 'rcg-corporate';
  const buttonStyle = settings.buttonStyle || 'solid-gradient';
  const interaction = settings.uiInteraction || 'corporate-smooth';
  const scrollSnap = settings.scrollSnapMode || 'proximity';
  const enFont = settings.externalFontEn || 'Plus Jakarta Sans';

  root.setAttribute('data-ui-preset', preset);
  root.setAttribute('data-btn-style', buttonStyle);
  root.setAttribute('data-ui-motion', interaction);
  root.setAttribute('data-scroll-snap', scrollSnap);

  // Dynamically load external Google Font for LTR / Latin numbers & badges (IRANYekan remains active for RTL Persian)
  const existingLink = document.getElementById('rcg-external-google-font') as HTMLLinkElement | null;
  const googleFamilyParam = encodeURIComponent(enFont).replace(/%20/g, '+');
  const href = `https://fonts.googleapis.com/css2?family=${googleFamilyParam}:wght@400;500;600;700;800&display=swap`;
  if (existingLink) {
    if (existingLink.href !== href) {
      existingLink.href = href;
    }
  } else {
    const link = document.createElement('link');
    link.id = 'rcg-external-google-font';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Expose Latin font variable cleanly without overriding IRANYekan in RTL
  if (language === 'en') {
    root.style.setProperty(
      '--font-sans',
      `"${enFont}", "IranYekan", "iranyekan", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    );
  } else {
    root.style.setProperty(
      '--font-sans',
      `"${enFont}", "IranYekan", "iranyekan", "Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    );
  }
}
