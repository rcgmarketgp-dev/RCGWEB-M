import React, { useState, useEffect } from 'react';
import {
  BrandAsset,
  BrandAssetCategory,
  CampaignLanding,
  Department,
  HeroSlide,
  Language,
  MediaItem,
  SectionCustomization,
  SectionId,
  SiteSectionsConfig,
  SiteSettings,
} from '../types';
import { RcgLogo } from './RcgLogo';
import { GalleryPickerModal } from './GalleryPickerModal';
import { formatAssetBytes } from '../utils/assetCategories';
import {
  X,
  Save,
  Upload,
  SlidersHorizontal,
  Link2,
  Type,
  Image as ImageIcon,
  Palette,
  MousePointerClick,
  CheckCircle2,
  Sun,
  Moon,
  FolderOpen,
  Layers,
} from 'lucide-react';

interface SectionEditorModalProps {
  isOpen: boolean;
  sectionId: SectionId | null;
  language: Language;
  settings: SiteSettings;
  sectionsConfig: SiteSectionsConfig;
  heroSlides: HeroSlide[];
  departments: Department[];
  campaigns: CampaignLanding[];
  mediaItems?: MediaItem[];
  brandAssets: BrandAsset[];
  onUpdateSettings: (settings: SiteSettings) => void;
  onUpdateSectionsConfig: (config: SiteSectionsConfig) => void;
  onUpdateSlides: (slides: HeroSlide[]) => void;
  onUpdateDepartments: (depts: Department[]) => void;
  onUpdateCampaigns: (campaigns: CampaignLanding[]) => void;
  onUpdateMediaItems?: (items: MediaItem[]) => void;
  onArchiveAsset: (asset: Omit<BrandAsset, 'id' | 'uploadedAt'>) => void;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

const SECTION_META: Record<SectionId, { fa: string; en: string }> = {
  header: { fa: 'هدر سایت، لوگو (دارک/لایت) و دکمه فراخوان بالا', en: 'Header Logo (Light/Dark), Brand Colors & Top CTA' },
  hero: { fa: 'اسلایدر اصلی، پس‌زمینه و فراخوان‌های هیرو', en: 'Hero Carousel, Backdrop Imagery & CTA Buttons' },
  departments: { fa: 'بخش چهار رکن خدمات یکپارچه و زیرکارت‌ها', en: 'Four Pillars Departments & Sub-Card Photos' },
  catalog: { fa: 'کاتالوگ ماشین‌آلات و تجهیزات برشکاری', en: 'Machinery & Tooling Catalog Section' },
  campaigns: { fa: 'بخش کمپین‌ها و صفحات فرود فروش', en: 'Active Campaigns Showcase' },
  calculator: { fa: 'محاسبه‌گر آنلاین تیزکاری اره الماسه', en: 'Saw Blade Sharpening Calculator' },
  media: { fa: 'مرکز رسانه، مقالات فنی و تصاویر کاور', en: 'Media Center & Technical Insights' },
  about: { fa: 'معرفی گروه صنعتی آرسی و تصویر مجموعه', en: 'About RCG & Facility Showcase' },
  contact: { fa: 'بخش تماس با ما و درخواست کارشناسی', en: 'Contact & Inquiry Section' },
  footer: { fa: 'فوتر سایت، توضیحات برند و دسترسی‌ها', en: 'Footer Brand Summary & Actions' },
};

const QUICK_LINK_OPTIONS = [
  { value: '#default', fa: 'عملکرد پیش‌فرض بخش / مودال', en: 'Default Section / Modal Action' },
  { value: '#consultation-modal', fa: 'باز کردن فرم مشاوره و پیش‌فاکتور', en: 'Open Consultation Modal' },
  { value: '#hero', fa: 'اسکرول به ابتدای صفحه (#hero)', en: 'Scroll to Top (#hero)' },
  { value: '#departments', fa: 'اسکرول به دپارتمان‌ها (#departments)', en: 'Scroll to Departments (#departments)' },
  { value: '#catalog', fa: 'اسکرول به کاتالوگ دستگاه‌ها (#catalog)', en: 'Scroll to Catalog (#catalog)' },
  { value: '#campaigns', fa: 'اسکرول به کمپین‌ها (#campaigns)', en: 'Scroll to Campaigns (#campaigns)' },
  { value: '#calculator', fa: 'اسکرول به محاسبه‌گر تیزکاری (#calculator)', en: 'Scroll to Calculator (#calculator)' },
  { value: '#media', fa: 'اسکرول به مرکز رسانه (#media)', en: 'Scroll to Media Center (#media)' },
  { value: '#about', fa: 'اسکرول به درباره آرسی (#about)', en: 'Scroll to About RCG (#about)' },
  { value: '#contact', fa: 'اسکرول به تماس با ما (#contact)', en: 'Scroll to Contact (#contact)' },
];

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  isOpen,
  sectionId,
  language,
  settings,
  sectionsConfig,
  heroSlides,
  departments,
  campaigns,
  mediaItems = [],
  brandAssets,
  onUpdateSettings,
  onUpdateSectionsConfig,
  onUpdateSlides,
  onUpdateDepartments,
  onUpdateCampaigns,
  onUpdateMediaItems,
  onArchiveAsset,
  onClose,
  onNotify,
}) => {
  const [draftSettings, setDraftSettings] = useState<SiteSettings>({ ...settings });
  const [draftSection, setDraftSection] = useState<SectionCustomization>({});
  const [draftSlides, setDraftSlides] = useState<HeroSlide[]>(heroSlides);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [draftDepts, setDraftDepts] = useState<Department[]>(departments);
  const [activeDeptIdx, setActiveDeptIdx] = useState(0);
  const [draftCampaigns, setDraftCampaigns] = useState<CampaignLanding[]>(campaigns);
  const [activeCampIdx, setActiveCampIdx] = useState(0);
  const [draftMedia, setDraftMedia] = useState<MediaItem[]>(mediaItems);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [logoEditMode, setLogoEditMode] = useState<'light' | 'dark'>('light');
  const [galleryPicker, setGalleryPicker] = useState<{
    category: BrandAssetCategory | 'all';
    onPick: (url: string) => void;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !sectionId) return;
    setDraftSettings({ ...settings });
    if (sectionId !== 'header') {
      setDraftSection({ ...(sectionsConfig[sectionId] || {}) });
    }
    setDraftSlides(heroSlides.map((s) => ({ ...s })));
    setActiveSlideIdx(0);
    setDraftDepts(
      departments.map((d) => ({
        ...d,
        subCards: d.subCards.map((sc) => ({ ...sc })),
      }))
    );
    setActiveDeptIdx(0);
    setDraftCampaigns(campaigns.map((c) => ({ ...c })));
    setActiveCampIdx(0);
    setDraftMedia(mediaItems.map((m) => ({ ...m })));
    setActiveMediaIdx(0);
  }, [isOpen, sectionId, settings, sectionsConfig, heroSlides, departments, campaigns, mediaItems]);

  if (!isOpen || !sectionId) return null;

  const isRtl = language === 'fa';
  const meta = SECTION_META[sectionId];

  const handleFileUpload = (
    file: File | undefined,
    archiveCategory: BrandAssetCategory,
    archiveLabel: string,
    onLoaded: (dataUrl: string) => void
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        onLoaded(dataUrl);
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        onArchiveAsset({
          titleFa: `${archiveLabel} — ${cleanName}`,
          titleEn: `${cleanName} (${archiveCategory})`,
          category: archiveCategory,
          url: dataUrl,
          fileSize: formatAssetBytes(file.size),
          fileType: file.type
            ? `${file.type.replace('image/', '').toUpperCase()} Image`
            : 'Uploaded Image',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (sectionId === 'header') {
      onUpdateSettings(draftSettings);
    } else {
      onUpdateSectionsConfig({
        ...sectionsConfig,
        [sectionId]: draftSection,
      });

      if (sectionId === 'hero') {
        onUpdateSlides(draftSlides);
      } else if (sectionId === 'departments') {
        onUpdateDepartments(draftDepts);
      } else if (sectionId === 'campaigns') {
        onUpdateCampaigns(draftCampaigns);
      } else if (sectionId === 'media' && onUpdateMediaItems) {
        onUpdateMediaItems(draftMedia);
      }
    }

    onNotify(
      isRtl
        ? `تنظیمات بخش «${meta.fa}» با موفقیت ذخیره و اعمال شد`
        : `Updated "${meta.en}" settings`
    );
    onClose();
  };

  const inputClass =
    'w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-colors';

  const currentSlide = draftSlides[activeSlideIdx] || draftSlides[0];
  const currentDept = draftDepts[activeDeptIdx] || draftDepts[0];
  const currentCamp = draftCampaigns[activeCampIdx] || draftCampaigns[0];
  const currentMediaItem = draftMedia[activeMediaIdx] || draftMedia[0];

  const renderLinkPicker = (
    label: string,
    value: string | undefined,
    onChange: (val: string) => void
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
        <span>{label}</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={
            QUICK_LINK_OPTIONS.some((opt) => opt.value === (value || '#default'))
              ? value || '#default'
              : '__custom__'
          }
          onChange={(e) => {
            if (e.target.value !== '__custom__') {
              onChange(e.target.value);
            }
          }}
          className={inputClass}
        >
          {QUICK_LINK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {isRtl ? opt.fa : opt.en}
            </option>
          ))}
          <option value="__custom__">{isRtl ? 'لینک دلخواه (URL / شماره تماس)' : 'Custom URL'}</option>
        </select>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#departments or https://..."
          className={`${inputClass} font-mono`}
          dir="ltr"
        />
      </div>
    </div>
  );

  const renderImageEditor = (
    label: string,
    imageUrl: string | undefined,
    archiveCategory: BrandAssetCategory,
    onChange: (url: string) => void,
    compact = false
  ) => (
    <div
      className={`${
        compact ? 'p-3' : 'p-4'
      } rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-2.5`}
    >
      <label className="text-xs font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-[#FD5202]" />
        <span>{label}</span>
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div
          className={`${
            compact ? 'w-full sm:w-24 h-16' : 'w-full sm:w-32 h-22'
          } rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-blue-800 shrink-0`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={imageUrl || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/assets/... or https://..."
            className={`${inputClass} font-mono`}
            dir="ltr"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isRtl ? 'آپلود تصویر (بایگانی خودکار)' : 'Upload & Archive'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFileUpload(e.target.files?.[0], archiveCategory, label, onChange);
                  e.target.value = '';
                }}
              />
            </label>

            <button
              type="button"
              onClick={() =>
                setGalleryPicker({
                  category: archiveCategory,
                  onPick: onChange,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#091A42] hover:border-[#FD5202] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-blue-800 text-[11px] font-bold cursor-pointer transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
              <span>{isRtl ? 'انتخاب از گالری' : 'Pick from Gallery'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm">
      <form
        onSubmit={handleSave}
        className="w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-white"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FD5202] text-white shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#091A42] dark:text-white">
                {isRtl ? `تنظیمات بخش: ${meta.fa}` : `Edit Section: ${meta.en}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#A6D6FE]">
                {isRtl
                  ? 'تغییر مستقیم متن‌ها، لوگو (لایت و دارک)، تصاویر و لینک کلیدها'
                  : 'Customize bilingual texts, light/dark logos, photos, and button links'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-800 text-slate-500 hover:text-[#FD5202] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* HEADER & SITE-WIDE LIGHT/DARK LOGO SETTINGS */}
          {sectionId === 'header' && (
            <div className="space-y-5">
              {/* Dual Live Logo Preview (Light Surface + Dark Surface Side by Side) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#FD5202]" />
                  <span>
                    {isRtl
                      ? 'پیش‌نمایش همزمان لوگو روی پس‌زمینه روشن و تیره (قابل اعمال در کل سایت و ۴ رکن)'
                      : 'Live Dual Logo Preview (Light & Dark Surfaces — Applied Site-Wide)'}
                  </span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isRtl ? 'حالت روز / پس‌زمینه روشن' : 'Light Mode / Surface'}</span>
                      </span>
                    </div>
                    <RcgLogo
                      settings={draftSettings}
                      surface="light"
                      subtitleType={isRtl ? 'fa' : 'en'}
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#060F26] border border-blue-800 text-white space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-[#A6D6FE]" />
                        <span>{isRtl ? 'حالت شب / فوتر و پس‌زمینه تیره' : 'Dark Mode / Dark BG'}</span>
                      </span>
                    </div>
                    <RcgLogo
                      settings={draftSettings}
                      surface="dark"
                      subtitleType={isRtl ? 'fa' : 'en'}
                    />
                  </div>
                </div>
              </div>

              {/* Global Logo Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDraftSettings({ ...draftSettings, logoType: 'vector' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    (draftSettings.logoType || 'vector') === 'vector'
                      ? 'bg-[#144AE0] text-white border-[#144AE0]'
                      : 'bg-slate-50 dark:bg-[#060F26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRtl ? 'لوگوی برداری RCG (قابل رنگ‌آمیزی)' : 'RCG Vector Logo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDraftSettings({ ...draftSettings, logoType: 'custom' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    draftSettings.logoType === 'custom'
                      ? 'bg-[#144AE0] text-white border-[#144AE0]'
                      : 'bg-slate-50 dark:bg-[#060F26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{isRtl ? 'لوگوی تصویری سفارشی (لایت / دارک)' : 'Custom Image Logo (Light / Dark)'}</span>
                </button>
              </div>

              {/* Light Mode vs Dark Mode Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-blue-900/60 pb-2">
                <button
                  type="button"
                  onClick={() => setLogoEditMode('light')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    logoEditMode === 'light'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#060F26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تنظیمات پس‌زمینه روشن (Light)' : 'Light Theme / BG'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoEditMode('dark')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    logoEditMode === 'dark'
                      ? 'bg-[#091A42] text-[#A6D6FE] border-blue-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#060F26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تنظیمات پس‌زمینه تیره / دارک (Dark)' : 'Dark Theme / Footer BG'}</span>
                </button>
              </div>

              {logoEditMode === 'light' ? (
                draftSettings.logoType === 'custom' ? (
                  renderImageEditor(
                    isRtl ? 'تصویر لوگو برای حالت روشن (Light Mode)' : 'Custom Logo for Light Background',
                    draftSettings.customLogoUrl,
                    'logo',
                    (url) => setDraftSettings({ ...draftSettings, customLogoUrl: url, logoType: 'custom' })
                  )
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'رنگ اصلی (آبی لوگو)' : 'Primary'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={draftSettings.logoPrimaryColor || '#144AE0'}
                            onChange={(e) =>
                              setDraftSettings({ ...draftSettings, logoPrimaryColor: e.target.value })
                            }
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={draftSettings.logoPrimaryColor || '#144AE0'}
                            onChange={(e) =>
                              setDraftSettings({ ...draftSettings, logoPrimaryColor: e.target.value })
                            }
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'رنگ حروف C و G' : 'Secondary'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={draftSettings.logoSecondaryColor || '#091A42'}
                            onChange={(e) =>
                              setDraftSettings({ ...draftSettings, logoSecondaryColor: e.target.value })
                            }
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={draftSettings.logoSecondaryColor || '#091A42'}
                            onChange={(e) =>
                              setDraftSettings({ ...draftSettings, logoSecondaryColor: e.target.value })
                            }
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'رنگ مثلث تاکیدی' : 'Accent'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={draftSettings.logoAccentColor || '#FD5202'}
                            onChange={(e) =>
                              setDraftSettings({ ...draftSettings, logoAccentColor: e.target.value })
                            }
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={draftSettings.logoAccentColor || '#FD5202'}
                            onChange={(e) =>
                              setDraftSettings({ ...draftSettings, logoAccentColor: e.target.value })
                            }
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'نوع رنگ (Light)' : 'Light Variant'}
                        </label>
                        <select
                          value={draftSettings.logoVariant || 'color'}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              logoVariant: e.target.value as 'color' | 'dark' | 'light',
                            })
                          }
                          className={inputClass}
                        >
                          <option value="color">{isRtl ? 'تمام‌رنگی رسمی' : 'Brand Color'}</option>
                          <option value="dark">{isRtl ? 'تک‌رنگ تیره' : 'Mono Dark'}</option>
                          <option value="light">{isRtl ? 'تک‌رنگ سفید' : 'Mono Light'}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              ) : draftSettings.logoType === 'custom' ? (
                renderImageEditor(
                  isRtl ? 'تصویر لوگو برای حالت تاریک / فوتر (Dark Mode)' : 'Custom Logo for Dark Background',
                  draftSettings.customLogoDarkUrl,
                  'logo',
                  (url) =>
                    setDraftSettings({
                      ...draftSettings,
                      customLogoDarkUrl: url,
                      logoType: 'custom',
                    })
                )
              ) : (
                <div className="p-4 rounded-2xl bg-[#060F26] border border-blue-900/70 space-y-4 text-white">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">
                        {isRtl ? 'رنگ اصلی در دارک' : 'Dark Primary'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={draftSettings.logoDarkPrimaryColor || '#3B82F6'}
                          onChange={(e) =>
                            setDraftSettings({ ...draftSettings, logoDarkPrimaryColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-blue-800 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={draftSettings.logoDarkPrimaryColor || '#3B82F6'}
                          onChange={(e) =>
                            setDraftSettings({ ...draftSettings, logoDarkPrimaryColor: e.target.value })
                          }
                          className={`${inputClass} font-mono`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">
                        {isRtl ? 'رنگ حروف در دارک' : 'Dark Letters'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={draftSettings.logoDarkSecondaryColor || '#FFFFFF'}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              logoDarkSecondaryColor: e.target.value,
                            })
                          }
                          className="w-9 h-9 rounded-lg border border-blue-800 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={draftSettings.logoDarkSecondaryColor || '#FFFFFF'}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              logoDarkSecondaryColor: e.target.value,
                            })
                          }
                          className={`${inputClass} font-mono`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">
                        {isRtl ? 'رنگ تاکیدی در دارک' : 'Dark Accent'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={draftSettings.logoDarkAccentColor || '#FD5202'}
                          onChange={(e) =>
                            setDraftSettings({ ...draftSettings, logoDarkAccentColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-blue-800 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={draftSettings.logoDarkAccentColor || '#FD5202'}
                          onChange={(e) =>
                            setDraftSettings({ ...draftSettings, logoDarkAccentColor: e.target.value })
                          }
                          className={`${inputClass} font-mono`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">
                        {isRtl ? 'استایل در دارک' : 'Dark Variant'}
                      </label>
                      <select
                        value={draftSettings.logoDarkVariant || 'color'}
                        onChange={(e) =>
                          setDraftSettings({
                            ...draftSettings,
                            logoDarkVariant: e.target.value as 'color' | 'dark' | 'light',
                          })
                        }
                        className={inputClass}
                      >
                        <option value="color">{isRtl ? 'تمام‌رنگی رسمی' : 'Brand Color'}</option>
                        <option value="light">{isRtl ? 'تک‌رنگ سفید' : 'Mono White'}</option>
                        <option value="dark">{isRtl ? 'تک‌رنگ سفارشی' : 'Mono Custom'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Size & Subtitle Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl
                      ? `اندازه پایه لوگو (اعمال در هدر و کارت‌ها): ${draftSettings.logoHeight || 36}px`
                      : `Base Logo Size: ${draftSettings.logoHeight || 36}px`}
                  </label>
                  <input
                    type="range"
                    min={26}
                    max={56}
                    value={draftSettings.logoHeight || 36}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, logoHeight: Number(e.target.value) })
                    }
                    className="w-full accent-[#FD5202]"
                  />
                </div>

                <label className="flex items-center gap-2 pt-3 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={draftSettings.logoShowSubtitle !== false}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, logoShowSubtitle: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#FD5202] rounded"
                  />
                  <span>{isRtl ? 'نمایش نام و شعار زیر لوگو' : 'Show Brand Subtitle'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'نام برند زیر لوگو (فارسی)' : 'Company Name (Fa)'}
                  </label>
                  <input
                    type="text"
                    value={draftSettings.companyNameFa}
                    onChange={(e) => setDraftSettings({ ...draftSettings, companyNameFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'شعار زیر لوگو (فارسی)' : 'Brand Slogan (Fa)'}
                  </label>
                  <input
                    type="text"
                    value={draftSettings.sloganFa}
                    onChange={(e) => setDraftSettings({ ...draftSettings, sloganFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Header CTA Text & Link */}
              <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-blue-950/40 border border-orange-200 dark:border-blue-900 space-y-3">
                <p className="text-xs font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
                  <MousePointerClick className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? 'تنظیمات کلید فراخوان هدر (Header CTA)' : 'Header CTA Button & Link'}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={draftSettings.headerCtaTextFa || ''}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, headerCtaTextFa: e.target.value })
                    }
                    placeholder="متن فارسی دکمه هدر..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={draftSettings.headerCtaTextEn || ''}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, headerCtaTextEn: e.target.value })
                    }
                    placeholder="Header Button Text (En)"
                    className={inputClass}
                  />
                </div>
                {renderLinkPicker(
                  isRtl ? 'لینک مقصد دکمه هدر' : 'Header Button Link',
                  draftSettings.headerCtaLink || '#consultation-modal',
                  (val) => setDraftSettings({ ...draftSettings, headerCtaLink: val })
                )}
              </div>
            </div>
          )}

          {/* HERO SECTION EDITOR */}
          {sectionId === 'hero' && currentSlide && (
            <div className="space-y-5">
              {/* Hero Background Parallax Image */}
              {renderImageEditor(
                isRtl ? 'تصویر پس‌زمینه پارالاکس بخش هیرو' : 'Hero Parallax Background Backdrop',
                draftSection.image,
                'hero',
                (url) => setDraftSection({ ...draftSection, image: url })
              )}

              {/* Slide Selector Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {draftSlides.map((sl, idx) => (
                  <button
                    key={sl.id}
                    type="button"
                    onClick={() => setActiveSlideIdx(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      idx === activeSlideIdx
                        ? 'bg-[#144AE0] text-white border-[#144AE0]'
                        : 'bg-slate-100 dark:bg-[#060F26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                    }`}
                  >
                    {isRtl ? `اسلاید ${idx + 1}` : `Slide ${idx + 1}`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'نشان بالای بخش (فارسی)' : 'Section Kicker Badge (Fa)'}
                  </label>
                  <input
                    type="text"
                    value={draftSection.badgeFa || ''}
                    onChange={(e) => setDraftSection({ ...draftSection, badgeFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Section Kicker Badge (English)
                  </label>
                  <input
                    type="text"
                    value={draftSection.badgeEn || ''}
                    onChange={(e) => setDraftSection({ ...draftSection, badgeEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'تیتر اسلاید (فارسی)' : 'Slide Title (Fa)'}
                  </label>
                  <input
                    type="text"
                    value={currentSlide.titleFa}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) => (i === activeSlideIdx ? { ...s, titleFa: e.target.value } : s))
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Slide Title (English)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.titleEn}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) => (i === activeSlideIdx ? { ...s, titleEn: e.target.value } : s))
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'متن نارنجی تاکیدی (فارسی)' : 'Highlight Text (Fa)'}
                  </label>
                  <input
                    type="text"
                    value={currentSlide.highlightFa}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) =>
                          i === activeSlideIdx ? { ...s, highlightFa: e.target.value } : s
                        )
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Highlight Text (English)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.highlightEn}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) =>
                          i === activeSlideIdx ? { ...s, highlightEn: e.target.value } : s
                        )
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'زیرتیتر اسلاید (فارسی)' : 'Subtitle (Fa)'}
                  </label>
                  <textarea
                    rows={2}
                    value={currentSlide.subtitleFa}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) => (i === activeSlideIdx ? { ...s, subtitleFa: e.target.value } : s))
                      )
                    }
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subtitle (English)
                  </label>
                  <textarea
                    rows={2}
                    value={currentSlide.subtitleEn}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) => (i === activeSlideIdx ? { ...s, subtitleEn: e.target.value } : s))
                      )
                    }
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {renderImageEditor(
                isRtl ? `تصویر اصلی اسلاید ${activeSlideIdx + 1}` : `Slide ${activeSlideIdx + 1} Showcase Image`,
                currentSlide.image,
                'hero',
                (url) =>
                  setDraftSlides(
                    draftSlides.map((s, i) => (i === activeSlideIdx ? { ...s, image: url } : s))
                  )
              )}

              {/* Primary CTA Text & Link */}
              <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-blue-950/40 border border-orange-200 dark:border-blue-900 space-y-3">
                <p className="text-xs font-bold text-[#091A42] dark:text-white">
                  {isRtl ? 'کلید اول (Primary CTA)' : 'Primary CTA Button'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={currentSlide.primaryCtaFa}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) =>
                          i === activeSlideIdx ? { ...s, primaryCtaFa: e.target.value } : s
                        )
                      )
                    }
                    placeholder="متن فارسی کلید اول..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={currentSlide.primaryCtaEn}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) =>
                          i === activeSlideIdx ? { ...s, primaryCtaEn: e.target.value } : s
                        )
                      )
                    }
                    placeholder="Primary Button (En)"
                    className={inputClass}
                  />
                </div>
                {renderLinkPicker(
                  isRtl ? 'لینک مقصد کلید اول' : 'Primary Button Link',
                  currentSlide.primaryCtaLink || '#departments',
                  (val) =>
                    setDraftSlides(
                      draftSlides.map((s, i) =>
                        i === activeSlideIdx ? { ...s, primaryCtaLink: val } : s
                      )
                    )
                )}
              </div>

              {/* Secondary CTA Text & Link */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 space-y-3">
                <p className="text-xs font-bold text-[#091A42] dark:text-white">
                  {isRtl ? 'کلید دوم (Secondary CTA)' : 'Secondary CTA Button'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={currentSlide.secondaryCtaFa}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) =>
                          i === activeSlideIdx ? { ...s, secondaryCtaFa: e.target.value } : s
                        )
                      )
                    }
                    placeholder="متن فارسی کلید دوم..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={currentSlide.secondaryCtaEn}
                    onChange={(e) =>
                      setDraftSlides(
                        draftSlides.map((s, i) =>
                          i === activeSlideIdx ? { ...s, secondaryCtaEn: e.target.value } : s
                        )
                      )
                    }
                    placeholder="Secondary Button (En)"
                    className={inputClass}
                  />
                </div>
                {renderLinkPicker(
                  isRtl ? 'لینک مقصد کلید دوم' : 'Secondary Button Link',
                  currentSlide.secondaryCtaLink || '#calculator',
                  (val) =>
                    setDraftSlides(
                      draftSlides.map((s, i) =>
                        i === activeSlideIdx ? { ...s, secondaryCtaLink: val } : s
                      )
                    )
                )}
              </div>
            </div>
          )}

          {/* STANDARD SECTION FIELDS (Departments, Catalog, Campaigns, Calculator, Media, About, Contact, Footer) */}
          {sectionId !== 'header' && sectionId !== 'hero' && (
            <div className="space-y-5">
              {/* Text Headings Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-4">
                <p className="text-xs font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
                  <span>{isRtl ? 'عناوین و متن‌های بخش' : 'Section Copy & Headings'}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'متن برچسب / تگ (فارسی)' : 'Badge Label (Fa)'}
                    </label>
                    <input
                      type="text"
                      value={draftSection.badgeFa || ''}
                      onChange={(e) => setDraftSection({ ...draftSection, badgeFa: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Badge Label (English)
                    </label>
                    <input
                      type="text"
                      value={draftSection.badgeEn || ''}
                      onChange={(e) => setDraftSection({ ...draftSection, badgeEn: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {sectionId !== 'footer' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'تیتر اصلی بخش (فارسی)' : 'Section Title (Fa)'}
                        </label>
                        <input
                          type="text"
                          value={draftSection.titleFa || ''}
                          onChange={(e) =>
                            setDraftSection({ ...draftSection, titleFa: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Section Title (English)
                        </label>
                        <input
                          type="text"
                          value={draftSection.titleEn || ''}
                          onChange={(e) =>
                            setDraftSection({ ...draftSection, titleEn: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'زیرتیتر توضیحی (فارسی)' : 'Section Subtitle (Fa)'}
                        </label>
                        <textarea
                          rows={2}
                          value={draftSection.subtitleFa || ''}
                          onChange={(e) =>
                            setDraftSection({ ...draftSection, subtitleFa: e.target.value })
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Section Subtitle (English)
                        </label>
                        <textarea
                          rows={2}
                          value={draftSection.subtitleEn || ''}
                          onChange={(e) =>
                            setDraftSection({ ...draftSection, subtitleEn: e.target.value })
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* About & Footer Body Copy */}
                {(sectionId === 'about' || sectionId === 'footer') && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-blue-900">
                    {sectionId === 'about' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'عنوان تاریخچه (فارسی)' : 'History Heading (Fa)'}
                          </label>
                          <input
                            type="text"
                            value={draftSection.historyTitleFa || ''}
                            onChange={(e) =>
                              setDraftSection({ ...draftSection, historyTitleFa: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            History Heading (English)
                          </label>
                          <input
                            type="text"
                            value={draftSection.historyTitleEn || ''}
                            onChange={(e) =>
                              setDraftSection({ ...draftSection, historyTitleEn: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'متن اصلی / پاراگراف ۱ (فارسی)' : 'Body Paragraph (Fa)'}
                        </label>
                        <textarea
                          rows={3}
                          value={draftSection.bodyFa || ''}
                          onChange={(e) => setDraftSection({ ...draftSection, bodyFa: e.target.value })}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Body Paragraph (English)
                        </label>
                        <textarea
                          rows={3}
                          value={draftSection.bodyEn || ''}
                          onChange={(e) => setDraftSection({ ...draftSection, bodyEn: e.target.value })}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>

                    {sectionId === 'about' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'پاراگراف دوم (فارسی)' : 'Second Paragraph (Fa)'}
                          </label>
                          <textarea
                            rows={2}
                            value={draftSection.bodySecondaryFa || ''}
                            onChange={(e) =>
                              setDraftSection({ ...draftSection, bodySecondaryFa: e.target.value })
                            }
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Second Paragraph (English)
                          </label>
                          <textarea
                            rows={2}
                            value={draftSection.bodySecondaryEn || ''}
                            onChange={(e) =>
                              setDraftSection({ ...draftSection, bodySecondaryEn: e.target.value })
                            }
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section Photo Upload (About & Calculator) */}
              {(sectionId === 'about' || sectionId === 'calculator') &&
                renderImageEditor(
                  isRtl ? 'تصویر اختصاصی این بخش' : 'Section Showcase Image',
                  draftSection.image,
                  'photo',
                  (url) => setDraftSection({ ...draftSection, image: url })
                )}

              {/* Button Label & Link for Sections with Main CTA */}
              {sectionId !== 'departments' && (
                <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-blue-950/40 border border-orange-200 dark:border-blue-900 space-y-3">
                  <p className="text-xs font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
                    <MousePointerClick className="w-4 h-4 text-[#FD5202]" />
                    <span>{isRtl ? 'تنظیمات متن کلید و لینک فراخوان (CTA)' : 'Section CTA Button & Link'}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {isRtl ? 'متن فارسی کلید' : 'Button Text (Fa)'}
                      </label>
                      <input
                        type="text"
                        value={draftSection.ctaTextFa || ''}
                        onChange={(e) =>
                          setDraftSection({ ...draftSection, ctaTextFa: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Button Text (English)
                      </label>
                      <input
                        type="text"
                        value={draftSection.ctaTextEn || ''}
                        onChange={(e) =>
                          setDraftSection({ ...draftSection, ctaTextEn: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  {renderLinkPicker(
                    isRtl ? 'لینک مقصد کلید بخش' : 'CTA Button Target Link',
                    draftSection.ctaLink || '#default',
                    (val) => setDraftSection({ ...draftSection, ctaLink: val })
                  )}
                </div>
              )}

              {/* Contextual Item Editor for Departments (Main Card + All 3 Sub-Cards) */}
              {sectionId === 'departments' && currentDept && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-[#060F26] border border-blue-200 dark:border-blue-800 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {draftDepts.map((dept, idx) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setActiveDeptIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          idx === activeDeptIdx
                            ? 'bg-[#144AE0] text-white border-[#144AE0]'
                            : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                        }`}
                      >
                        {isRtl ? dept.titleFa : dept.titleEn}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentDept.titleFa}
                      onChange={(e) =>
                        setDraftDepts(
                          draftDepts.map((d, i) =>
                            i === activeDeptIdx ? { ...d, titleFa: e.target.value } : d
                          )
                        )
                      }
                      placeholder="عنوان دپارتمان..."
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={currentDept.titleEn}
                      onChange={(e) =>
                        setDraftDepts(
                          draftDepts.map((d, i) =>
                            i === activeDeptIdx ? { ...d, titleEn: e.target.value } : d
                          )
                        )
                      }
                      placeholder="Department Title (En)"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <textarea
                      rows={2}
                      value={currentDept.shortDescFa}
                      onChange={(e) =>
                        setDraftDepts(
                          draftDepts.map((d, i) =>
                            i === activeDeptIdx ? { ...d, shortDescFa: e.target.value } : d
                          )
                        )
                      }
                      placeholder="توضیح کوتاه فارسی..."
                      className={`${inputClass} resize-none`}
                    />
                    <textarea
                      rows={2}
                      value={currentDept.shortDescEn}
                      onChange={(e) =>
                        setDraftDepts(
                          draftDepts.map((d, i) =>
                            i === activeDeptIdx ? { ...d, shortDescEn: e.target.value } : d
                          )
                        )
                      }
                      placeholder="Short Description (En)"
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {renderImageEditor(
                    isRtl
                      ? `تصویر اصلی رکن «${currentDept.titleFa}»`
                      : `Main Photo for ${currentDept.titleEn}`,
                    currentDept.image,
                    'departments',
                    (url) =>
                      setDraftDepts(
                        draftDepts.map((d, i) => (i === activeDeptIdx ? { ...d, image: url } : d))
                      )
                  )}

                  {/* Sub-Section Title + 3 Mini Cards Photos & Titles */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#091A42] border border-blue-200 dark:border-blue-900 space-y-3">
                    <p className="text-xs font-black text-[#091A42] dark:text-[#A6D6FE] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#FD5202]" />
                      <span>
                        {isRtl
                          ? 'زیرکارت‌های ۳گانه و تصاویر آن‌ها'
                          : 'Nested Sub-Cards (Titles & Photos)'}
                      </span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={currentDept.subSectionTitleFa}
                        onChange={(e) =>
                          setDraftDepts(
                            draftDepts.map((d, i) =>
                              i === activeDeptIdx
                                ? { ...d, subSectionTitleFa: e.target.value }
                                : d
                            )
                          )
                        }
                        placeholder="عنوان بخش زیرکارت‌ها (فارسی)"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={currentDept.subSectionTitleEn}
                        onChange={(e) =>
                          setDraftDepts(
                            draftDepts.map((d, i) =>
                              i === activeDeptIdx
                                ? { ...d, subSectionTitleEn: e.target.value }
                                : d
                            )
                          )
                        }
                        placeholder="Sub-Cards Heading (English)"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-3">
                      {currentDept.subCards.map((sc, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-2.5"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={sc.titleFa}
                              onChange={(e) =>
                                setDraftDepts(
                                  draftDepts.map((d, i) =>
                                    i === activeDeptIdx
                                      ? {
                                          ...d,
                                          subCards: d.subCards.map((card, ci) =>
                                            ci === sIdx ? { ...card, titleFa: e.target.value } : card
                                          ),
                                        }
                                      : d
                                  )
                                )
                              }
                              placeholder={`عنوان کارت ${sIdx + 1} (فارسی)`}
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={sc.titleEn}
                              onChange={(e) =>
                                setDraftDepts(
                                  draftDepts.map((d, i) =>
                                    i === activeDeptIdx
                                      ? {
                                          ...d,
                                          subCards: d.subCards.map((card, ci) =>
                                            ci === sIdx ? { ...card, titleEn: e.target.value } : card
                                          ),
                                        }
                                      : d
                                  )
                                )
                              }
                              placeholder={`Sub-Card ${sIdx + 1} Title (En)`}
                              className={inputClass}
                            />
                          </div>

                          {renderImageEditor(
                            isRtl
                              ? `تصویر کارت شماره ${sIdx + 1} (${sc.titleFa})`
                              : `Sub-Card ${sIdx + 1} Photo`,
                            sc.image,
                            'departments',
                            (url) =>
                              setDraftDepts(
                                draftDepts.map((d, i) =>
                                  i === activeDeptIdx
                                    ? {
                                        ...d,
                                        subCards: d.subCards.map((card, ci) =>
                                          ci === sIdx ? { ...card, image: url } : card
                                        ),
                                      }
                                    : d
                                )
                              ),
                            true
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentDept.bottomBannerFa}
                      onChange={(e) =>
                        setDraftDepts(
                          draftDepts.map((d, i) =>
                            i === activeDeptIdx ? { ...d, bottomBannerFa: e.target.value } : d
                          )
                        )
                      }
                      placeholder="متن کلید بنر پایین کارت (فارسی)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={currentDept.bottomBannerEn}
                      onChange={(e) =>
                        setDraftDepts(
                          draftDepts.map((d, i) =>
                            i === activeDeptIdx ? { ...d, bottomBannerEn: e.target.value } : d
                          )
                        )
                      }
                      placeholder="Bottom Banner CTA (En)"
                      className={inputClass}
                    />
                  </div>

                  {renderLinkPicker(
                    isRtl ? 'لینک مقصد کلید بنر دپارتمان' : 'Department Banner CTA Link',
                    currentDept.bottomBannerLink || '#default',
                    (val) =>
                      setDraftDepts(
                        draftDepts.map((d, i) =>
                          i === activeDeptIdx ? { ...d, bottomBannerLink: val } : d
                        )
                      )
                  )}
                </div>
              )}

              {/* Contextual Quick Campaign Item Editor */}
              {sectionId === 'campaigns' && currentCamp && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-[#060F26] border border-blue-200 dark:border-blue-800 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {draftCampaigns.map((cmp, idx) => (
                      <button
                        key={cmp.id}
                        type="button"
                        onClick={() => setActiveCampIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          idx === activeCampIdx
                            ? 'bg-[#FD5202] text-white border-[#FD5202]'
                            : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                        }`}
                      >
                        {isRtl ? cmp.titleFa : cmp.titleEn}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={currentCamp.headlineFa}
                      onChange={(e) =>
                        setDraftCampaigns(
                          draftCampaigns.map((c, i) =>
                            i === activeCampIdx ? { ...c, headlineFa: e.target.value } : c
                          )
                        )
                      }
                      placeholder="تیتر کمپین (فارسی)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={currentCamp.ctaTextFa}
                      onChange={(e) =>
                        setDraftCampaigns(
                          draftCampaigns.map((c, i) =>
                            i === activeCampIdx ? { ...c, ctaTextFa: e.target.value } : c
                          )
                        )
                      }
                      placeholder="متن دکمه ثبت‌نام کمپین (فارسی)"
                      className={inputClass}
                    />
                  </div>

                  {renderImageEditor(
                    isRtl ? `تصویر کمپین «${currentCamp.titleFa}»` : `Hero Photo for ${currentCamp.titleEn}`,
                    currentCamp.heroImage,
                    'campaigns',
                    (url) =>
                      setDraftCampaigns(
                        draftCampaigns.map((c, i) =>
                          i === activeCampIdx ? { ...c, heroImage: url } : c
                        )
                      )
                  )}
                </div>
              )}

              {/* Contextual Quick Media Cover Photo Editor */}
              {sectionId === 'media' && currentMediaItem && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-[#060F26] border border-blue-200 dark:border-blue-800 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {draftMedia.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveMediaIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer max-w-[200px] truncate ${
                          idx === activeMediaIdx
                            ? 'bg-[#144AE0] text-white border-[#144AE0]'
                            : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                        }`}
                      >
                        {isRtl ? m.titleFa : m.titleEn}
                      </button>
                    ))}
                  </div>

                  {renderImageEditor(
                    isRtl
                      ? `تصویر کاور مطلب «${currentMediaItem.titleFa}»`
                      : `Cover Image for ${currentMediaItem.titleEn}`,
                    currentMediaItem.image,
                    'media',
                    (url) =>
                      setDraftMedia(
                        draftMedia.map((m, i) =>
                          i === activeMediaIdx ? { ...m, image: url } : m
                        )
                      )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#060F26] border-t border-slate-200 dark:border-blue-900/60 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {isRtl ? 'انصراف' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isRtl ? 'ذخیره و اعمال در سایت' : 'Save & Apply Changes'}</span>
          </button>
        </div>
      </form>

      {galleryPicker && (
        <GalleryPickerModal
          isOpen={!!galleryPicker}
          assets={brandAssets}
          language={language}
          defaultCategory={galleryPicker.category}
          onSelect={galleryPicker.onPick}
          onClose={() => setGalleryPicker(null)}
        />
      )}
    </div>
  );
};
