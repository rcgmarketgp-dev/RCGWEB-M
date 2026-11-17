import React, { useState, useEffect } from 'react';
import {
  HeroSlide,
  Product,
  MediaItem,
  SharpeningOrder,
  Inquiry,
  SiteSettings,
  Language,
  CampaignLanding,
  CampaignInquiry,
  BrandAsset,
  NavLinkItem,
} from '../types';
import { translations } from '../utils/i18n';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';
import { NavigationManager } from './NavigationManager';
import { RcgLogo } from './RcgLogo';
import {
  InstagramBrandIcon,
  LinkedInBrandIcon,
  TelegramBrandIcon,
  WhatsAppBrandIcon,
} from './SocialBrandIcons';
import {
  Shield,
  X,
  LayoutDashboard,
  Sliders,
  Package,
  Mail,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RotateCcw,
  Save,
  Phone,
  Search,
  Copy,
  Star,
  Award,
  Layers,
  Zap,
  SlidersHorizontal,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Flame,
  FolderDown,
  Upload,
  Sparkles,
  Download,
  GripVertical,
  Moon,
  Sun,
  MousePointerClick,
  Palette,
} from 'lucide-react';
import {
  Disc as PhosphorDisc,
  Toolbox as PhosphorToolbox,
  Megaphone as PhosphorMegaphone,
  Palette as PhosphorPalette,
} from '@phosphor-icons/react';

export type AdminTab =
  | 'overview'
  | 'campaigns'
  | 'catalog'
  | 'sharpening'
  | 'inquiries'
  | 'media'
  | 'assets'
  | 'slides'
  | 'navigation'
  | 'settings';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isDark?: boolean;
  onThemeToggle?: () => void;
  isPageEditMode?: boolean;
  onEnterPageEditMode?: () => void;
  initialTab?: AdminTab;
  heroSlides: HeroSlide[];
  onUpdateSlides: (slides: HeroSlide[]) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  sharpeningOrders: SharpeningOrder[];
  onUpdateSharpeningOrders: (orders: SharpeningOrder[]) => void;
  inquiries: Inquiry[];
  onUpdateInquiries: (inquiries: Inquiry[]) => void;
  mediaItems: MediaItem[];
  onUpdateMediaItems: (items: MediaItem[]) => void;
  campaigns: CampaignLanding[];
  onUpdateCampaigns: (campaigns: CampaignLanding[]) => void;
  campaignInquiries: CampaignInquiry[];
  onUpdateCampaignInquiries: (inquiries: CampaignInquiry[]) => void;
  brandAssets: BrandAsset[];
  onUpdateBrandAssets: (assets: BrandAsset[]) => void;
  onPreviewCampaign: (campaign: CampaignLanding) => void;
  navLinks: NavLinkItem[];
  onUpdateNavLinks: (links: NavLinkItem[]) => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  onResetToDefaults: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  language,
  isDark = false,
  onThemeToggle,
  isPageEditMode = false,
  onEnterPageEditMode,
  initialTab = 'overview',
  heroSlides,
  onUpdateSlides,
  products,
  onUpdateProducts,
  sharpeningOrders,
  onUpdateSharpeningOrders,
  inquiries,
  onUpdateInquiries,
  mediaItems,
  onUpdateMediaItems,
  campaigns,
  onUpdateCampaigns,
  campaignInquiries,
  onUpdateCampaignInquiries,
  brandAssets,
  onUpdateBrandAssets,
  onPreviewCampaign,
  navLinks,
  onUpdateNavLinks,
  settings,
  onUpdateSettings,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Catalog filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'all' | 'active' | 'installment' | 'featured'>('all');

  // Campaign editing
  const [editingCampaign, setEditingCampaign] = useState<CampaignLanding | null>(null);
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [campaignInquiryFilter, setCampaignInquiryFilter] = useState<string>('all');

  // Brand Asset upload state
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAssetTitleFa, setNewAssetTitleFa] = useState('');
  const [newAssetTitleEn, setNewAssetTitleEn] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<BrandAsset['category']>('catalog');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetFileSize, setNewAssetFileSize] = useState('');
  const [newAssetFileType, setNewAssetFileType] = useState('');

  // Editing modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  // Settings draft
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  if (!isOpen) return null;

  const t = translations[language].admin;
  const isRtl = language === 'fa';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Shared Local File Reader helper ---
  const handleReadFileAsDataUrl = (
    file: File | undefined,
    onLoaded: (dataUrl: string, file: File) => void
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result, file);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Sharpening Status ---
  const handleUpdateOrderStatus = (orderId: string, newStatus: SharpeningOrder['status']) => {
    const updated = sharpeningOrders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    onUpdateSharpeningOrders(updated);
    showToast(isRtl ? 'وضعیت سفارش به‌روزرسانی شد' : 'Order status updated');
  };

  // --- Inquiries Status ---
  const handleUpdateInquiryStatus = (inqId: string, newStatus: Inquiry['status']) => {
    const updated = inquiries.map((i) =>
      i.id === inqId ? { ...i, status: newStatus } : i
    );
    onUpdateInquiries(updated);
    showToast(isRtl ? 'وضعیت پیام مشاوره به‌روزرسانی شد' : 'Inquiry status updated');
  };

  // --- Products ---
  const handleDeleteProduct = (prodId: string) => {
    const updated = products.filter((p) => p.id !== prodId);
    onUpdateProducts(updated);
    showToast(isRtl ? 'دستگاه با موفقیت حذف شد' : 'Machine deleted successfully');
  };

  const handleDuplicateProduct = (prod: Product) => {
    const clone: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      titleFa: `${prod.titleFa} (کپی)`,
      titleEn: `${prod.titleEn} (Copy)`,
      featuredPoster: false,
    };
    onUpdateProducts([clone, ...products]);
    showToast(isRtl ? 'دستگاه با موفقیت تکثیر شد' : 'Machine duplicated');
  };

  const handleToggleProductActive = (prodId: string) => {
    const updated = products.map((p) =>
      p.id === prodId ? { ...p, isActive: p.isActive === false ? true : false } : p
    );
    onUpdateProducts(updated);
    showToast(isRtl ? 'وضعیت نمایش دستگاه تغییر یافت' : 'Machine visibility updated');
  };

  const handleToggleProductFeatured = (prodId: string) => {
    const updated = products.map((p) =>
      p.id === prodId ? { ...p, featuredPoster: !p.featuredPoster } : p
    );
    onUpdateProducts(updated);
    showToast(isRtl ? 'وضعیت پوستر برگزیده تغییر یافت' : 'Featured poster status updated');
  };

  const handleSaveProduct = (prod: Product) => {
    if (isAddingProduct) {
      onUpdateProducts([prod, ...products]);
      setIsAddingProduct(false);
      setEditingProduct(null);
      showToast(isRtl ? 'دستگاه جدید با موفقیت اضافه شد' : 'New machine added');
    } else {
      const updated = products.map((p) => (p.id === prod.id ? prod : p));
      onUpdateProducts(updated);
      setEditingProduct(null);
      showToast(isRtl ? 'اطلاعات دستگاه به‌روزرسانی شد' : 'Machine updated');
    }
  };

  const handleCreateFromPreset = (
    presetKey: 'payon_edgebander' | 'saw_380' | 'cnc_wood' | 'refurb_line'
  ) => {
    let preset: Product;
    if (presetKey === 'payon_edgebander') {
      preset = {
        id: `prod-${Date.now()}`,
        titleFa: 'لبه‌چسبان ۶ ایستگاه پایون مدل NB5J Pro',
        titleEn: 'Payon NB5J Pro Heavy Duty 6-Station Edgebander',
        category: 'edgebanders',
        categoryFa: 'لبه‌چسبان PVC',
        categoryEn: 'PVC Edgebanders',
        brand: 'پایون | PAYON',
        model: 'NB5J Pro',
        year: '2025',
        condition: 'new',
        conditionFa: 'دستگاه نو | با گارانتی ۱۲ ماهه رسمی پایون و نصب رایگان آرسی',
        conditionEn: 'Brand New | 12-Month Official Warranty',
        power: '۱۰.۵ کیلووات سه فاز',
        priceFa: 'شرایط پرداخت: ۴۰٪ پیش‌پرداخت + ۱۶ فقره چک',
        priceEn: 'Terms: 40% Down Payment + 16 Checks',
        downPaymentFa: '۴۰٪ پیش‌پرداخت',
        downPaymentEn: '40% Down',
        installmentChecksFa: '۱۶ فقره چک',
        installmentChecksEn: '16 Checks',
        installmentAvailable: true,
        image: '/src/assets/images/payon_edgebander_nb4j_1793316520935.jpg',
        badgeFa: 'نمایندگی رسمی پایون',
        badgeEn: 'Official Payon Dealer',
        feedSpeed: '۱۸ الی ۲۴ متر بر دقیقه',
        precisionRating: 99,
        durabilityRating: 98,
        efficiencyRating: 96,
        isActive: true,
        featuredPoster: false,
        qualityBadgeFa: 'دستگاهی با کیفیت و قابل اعتماد',
        qualityBadgeEn: 'Certified High Reliability',
        specsFa: [
          { key: 'ایستگاه‌ها', value: 'پیش‌فرز، چسب، غلطک‌های فشار، سروته‌زن، فرز بالا/پایین، لیسه و پولیش' },
          { key: 'کنترلر', value: 'نمایشگر لمسی صنعتی PLC با عیب‌یابی هوشمند' },
          { key: 'ضخامت نوار', value: '۰.۴ الی ۳ میلی‌متر' },
        ],
        specsEn: [
          { key: 'Stations', value: 'Pre-milling, Glue, End trim, Fine trim, Scraper, Buffing' },
          { key: 'Controller', value: 'Industrial Touchscreen PLC' },
          { key: 'Tape Thickness', value: '0.4 to 3.0 mm' },
        ],
        stations: [
          { titleFa: 'ایستگاه پیش‌فرز الماسه', titleEn: 'Diamond Pre-milling', img: '/assets/aistudio/file_0000000045ac81f49bc5e19e902c864a_0796f548.png' },
          { titleFa: 'غلطک‌های فشار و چسب تفلونی', titleEn: 'Pressure Rollers & Glue Pot', img: '/assets/aistudio/file_000000002c78824384157c7938ba7f05_85caf837.png' },
          { titleFa: 'سروته‌زن دوبل زاویه‌پذیر', titleEn: 'Dual End Trimming Saws', img: '/assets/aistudio/file_0000000045ac81f49bc5e19e902c864a_0796f548.png' },
          { titleFa: 'فرز بالا/پایین و پولیش نهایی', titleEn: 'Fine Trim & Buffing', img: '/assets/aistudio/file_000000002c78824384157c7938ba7f05_85caf837.png' },
        ],
      };
    } else if (presetKey === 'saw_380') {
      preset = {
        id: `prod-${Date.now()}`,
        titleFa: 'دورکن ۳۸۰ واگنی اتوماتیک پایون - سری صنعتگران',
        titleEn: 'Payon 380 Precision Heavy-Duty Sliding Table Saw',
        category: 'saws',
        categoryFa: 'دورکن و پانل‌بر',
        categoryEn: 'Sliding Table Saws',
        brand: 'پایون | PAYON',
        model: 'MJ-380 Extra',
        year: '2025',
        condition: 'new',
        conditionFa: 'دستگاه نو | گارانتی رسمی پایون با نصب رایگان',
        conditionEn: 'Brand New | Warranty & Free Setup',
        power: '۷.۵ اسب بخار (۵.۵ کیلووات)',
        tableSize: '۳۸۰۰ × ۳۷۵ میلی‌متر',
        priceFa: 'شرایط پرداخت: ۳۵٪ پیش‌پرداخت + ۱۲ فقره چک',
        priceEn: 'Terms: 35% Down Payment + 12 Checks',
        downPaymentFa: '۳۵٪ پیش‌پرداخت',
        downPaymentEn: '35% Down',
        installmentChecksFa: '۱۲ فقره چک',
        installmentChecksEn: '12 Checks',
        installmentAvailable: true,
        image: '/src/assets/images/machinery_overhaul_facility_1793316523687.jpg',
        badgeFa: 'ریل استوانه‌ای ضدسایش',
        badgeEn: 'Cylindrical Guideway',
        precisionRating: 99,
        durabilityRating: 97,
        efficiencyRating: 94,
        isActive: true,
        featuredPoster: false,
        qualityBadgeFa: 'برش فوق‌دقیق بدون لب‌پریدگی',
        qualityBadgeEn: 'Zero-Chipping Precision',
        specsFa: [
          { key: 'طول ریل واگنی', value: '۳۸۰۰ میلی‌متر استوانه‌ای فوق‌دقیق' },
          { key: 'موتور خط‌زن', value: 'موتور مستقل ۱ اسب با تنظیم سریع' },
          { key: 'زاویه‌زن', value: 'تنظیم برقی دیجیتال زاویه تا ۴۵ درجه' },
        ],
        specsEn: [
          { key: 'Rail Length', value: '3800mm precision cylindrical track' },
          { key: 'Scoring Motor', value: 'Independent 1 HP motor' },
          { key: 'Tilt Adjustment', value: 'Motorized Digital 0° to 45°' },
        ],
      };
    } else if (presetKey === 'cnc_wood') {
      preset = {
        id: `prod-${Date.now()}`,
        titleFa: 'دستگاه فرز سی‌ان‌سی ۳ محوره صنایع چوب RCG مدل Pro-Master',
        titleEn: 'RCG Pro-Master 1325 ATC Woodworking CNC Router',
        category: 'cnc',
        categoryFa: 'سی‌ان‌سی روتور',
        categoryEn: 'CNC Routers',
        brand: 'آرسی | RCG Tech',
        model: 'Pro-Master 1325',
        year: '2025',
        condition: 'new',
        conditionFa: 'دستگاه نو فول آپشن | با آموزش رایگان اپراتوری',
        conditionEn: 'Brand New Full Options | Free Operator Training',
        power: '۹ کیلووات اسپیندل هوا خنک صنعتی',
        tableSize: '۱۳۰۰ × ۲۵۰۰ میلی‌متر وکیوم',
        priceFa: 'شرایط پرداخت: ۵۰٪ نقد + اقساط توافقی',
        priceEn: 'Terms: 50% Down + Flexible Checks',
        downPaymentFa: '۵۰٪ پیش‌پرداخت',
        downPaymentEn: '50% Down',
        installmentChecksFa: 'اقساط توافقی',
        installmentChecksEn: 'Agreed Checks',
        installmentAvailable: true,
        image: '/assets/aistudio/04_saw_blade_hero_crop_dffed999.jpg',
        badgeFa: 'تکنولوژی پیشرفته آلمان و ژاپن',
        badgeEn: 'German-Japanese Tech',
        precisionRating: 99,
        durabilityRating: 96,
        efficiencyRating: 95,
        isActive: true,
        featuredPoster: false,
        qualityBadgeFa: 'سروو موتورهای یاسکاوا ژاپن',
        qualityBadgeEn: 'Yaskawa Japan Servos',
        specsFa: [
          { key: 'میز کارگیر', value: '۱۳۰۰ × ۲۵۰۰ میلی‌متر ماتریسی با پمپ وکیوم ۲۵۰ مترمکعب' },
          { key: 'تعویض ابزار', value: 'سیستم اتوماتیک چرخشی ۸ ابزاره (Carousel ATC)' },
          { key: 'کنترلر', value: 'Syntec صنعتی بسیار پایدار با پورت شبکه' },
        ],
        specsEn: [
          { key: 'Working Area', value: '1300 × 2500 mm vacuum matrix bed' },
          { key: 'Tool Changer', value: '8-Slot Rotary Carousel ATC' },
          { key: 'Controller', value: 'Industrial Syntec CNC' },
        ],
      };
    } else {
      preset = {
        id: `prod-${Date.now()}`,
        titleFa: 'دستگاه اورهال‌شده و نوسازی‌شده کارگاهی RCG Certified',
        titleEn: 'RCG Certified Reconditioned Industrial Machine',
        category: 'refurbished',
        categoryFa: 'ماشین‌آلات اورهال شده',
        categoryEn: 'Refurbished Machinery',
        brand: 'آرسی اورهال | RCG Rebuild',
        model: 'Master-Rebuild 2026',
        year: '2021',
        condition: 'used',
        conditionFa: 'کارکرده در حد صفر | با ۱۲ ماه گارانتی کتبی دپارتمان بازسازی آرسی',
        conditionEn: 'Mint Condition Rebuild | 12-Month Official Warranty',
        power: '۸.۵ کیلووات سه فاز',
        priceFa: 'شرایط پرداخت: ۴۰٪ پیش‌پرداخت + ۱۰ فقره چک صیادی',
        priceEn: 'Terms: 40% Down Payment + 10 Checks',
        downPaymentFa: '۴۰٪ پیش‌پرداخت',
        downPaymentEn: '40% Down',
        installmentChecksFa: '۱۰ فقره چک',
        installmentChecksEn: '10 Checks',
        installmentAvailable: true,
        image: '/src/assets/images/machinery_overhaul_facility_1793316523687.jpg',
        badgeFa: 'اورهال رسمی با ضمانت ۱۲ ماهه آرسی',
        badgeEn: 'RCG Certified Rebuild',
        feedSpeed: '۱۸ متر بر دقیقه',
        precisionRating: 98,
        durabilityRating: 98,
        efficiencyRating: 96,
        isActive: true,
        featuredPoster: false,
        qualityBadgeFa: 'بازسازی کامل با قطعات ژاپنی و آلمانی',
        qualityBadgeEn: 'Rebuilt with Japanese & German Components',
        specsFa: [
          { key: 'سطح اورهال', value: 'تعویض کلیه بلبرینگ‌ها به NSK ژاپن، سنگ‌زنی ریل، تابلو برق PLC جدید' },
          { key: 'گارانتی', value: '۱۲ ماه گارانتی کتبی دپارتمان بازسازی آرسی' },
        ],
        specsEn: [
          { key: 'Overhaul Level', value: 'Replaced with NSK Japan bearings, precision ground bed, new PLC' },
          { key: 'Warranty', value: '12 Months Comprehensive RCG Warranty' },
        ],
      };
    }
    setEditingProduct(preset);
    setIsAddingProduct(true);
  };

  // --- Media ---
  const handleDeleteMedia = (mediaId: string) => {
    const updated = mediaItems.filter((m) => m.id !== mediaId);
    onUpdateMediaItems(updated);
    showToast(isRtl ? 'مطلب حذف شد' : 'Post deleted');
  };

  const handleSaveMedia = (item: MediaItem) => {
    if (isAddingMedia) {
      onUpdateMediaItems([item, ...mediaItems]);
      setIsAddingMedia(false);
      setEditingMedia(null);
      showToast(isRtl ? 'مطلب جدید منتشر شد' : 'New post published');
    } else {
      const updated = mediaItems.map((m) => (m.id === item.id ? item : m));
      onUpdateMediaItems(updated);
      setEditingMedia(null);
      showToast(isRtl ? 'مطلب با موفقیت ذخیره شد' : 'Post updated');
    }
  };

  // --- Campaigns ---
  const handleToggleCampaignActive = (campId: string) => {
    const updated = campaigns.map((c) =>
      c.id === campId ? { ...c, isActive: !c.isActive } : c
    );
    onUpdateCampaigns(updated);
    showToast(isRtl ? 'وضعیت فعال‌بودن کمپین به‌روزرسانی شد' : 'Campaign status updated');
  };

  const handleDeleteCampaign = (campId: string) => {
    const updated = campaigns.filter((c) => c.id !== campId);
    onUpdateCampaigns(updated);
    showToast(isRtl ? 'صفحه فرود کمپین حذف شد' : 'Campaign deleted');
  };

  const handleDuplicateCampaign = (camp: CampaignLanding) => {
    const clone: CampaignLanding = {
      ...camp,
      id: `camp-${Date.now()}`,
      slug: `${camp.slug}-copy`,
      titleFa: `${camp.titleFa} (کپی)`,
      titleEn: `${camp.titleEn} (Copy)`,
      viewsCount: 0,
      conversionsCount: 0,
    };
    onUpdateCampaigns([clone, ...campaigns]);
    showToast(isRtl ? 'کمپین با موفقیت کپی و ایجاد شد' : 'Campaign duplicated');
  };

  const handleSaveCampaign = (camp: CampaignLanding) => {
    if (isAddingCampaign) {
      onUpdateCampaigns([camp, ...campaigns]);
      setIsAddingCampaign(false);
      setEditingCampaign(null);
      showToast(isRtl ? 'کمپین جدید با موفقیت ایجاد و منتشر شد' : 'New campaign launched');
    } else {
      const updated = campaigns.map((c) => (c.id === camp.id ? camp : c));
      onUpdateCampaigns(updated);
      setEditingCampaign(null);
      showToast(isRtl ? 'تنظیمات کمپین به‌روزرسانی شد' : 'Campaign updated');
    }
  };

  const handleUpdateCampaignInquiryStatus = (inqId: string, newStatus: CampaignInquiry['status']) => {
    const updated = campaignInquiries.map((ci) =>
      ci.id === inqId ? { ...ci, status: newStatus } : ci
    );
    onUpdateCampaignInquiries(updated);
    showToast(isRtl ? 'وضعیت متقاضی کمپین تغییر یافت' : 'Campaign inquiry updated');
  };

  // --- Brand Assets ---
  const handleDeleteAsset = (assetId: string) => {
    const updated = brandAssets.filter((a) => a.id !== assetId);
    onUpdateBrandAssets(updated);
    showToast(isRtl ? 'فایل با موفقیت حذف شد' : 'Asset removed');
  };

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetTitleFa.trim() || !newAssetUrl.trim()) return;

    const detectedType =
      newAssetFileType ||
      (newAssetUrl.toLowerCase().endsWith('.pdf') || newAssetUrl.startsWith('data:application/pdf')
        ? 'PDF Document'
        : 'Image Asset');

    const asset: BrandAsset = {
      id: `asset-${Date.now()}`,
      titleFa: newAssetTitleFa.trim(),
      titleEn: newAssetTitleEn.trim() || newAssetTitleFa.trim(),
      category: newAssetCategory,
      url: newAssetUrl.trim(),
      fileSize: newAssetFileSize.trim() || '1.2 MB',
      fileType: detectedType,
      uploadedAt: new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    onUpdateBrandAssets([asset, ...brandAssets]);
    setIsAddingAsset(false);
    setNewAssetTitleFa('');
    setNewAssetTitleEn('');
    setNewAssetUrl('');
    setNewAssetFileSize('');
    setNewAssetFileType('');
    showToast(isRtl ? 'فایل با موفقیت به کتابخانه هویت بصری افزوده شد' : 'Asset added to brand library');
  };

  // --- Settings Save ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    showToast(isRtl ? 'تنظیمات کلی وب‌سایت ذخیره شد' : 'Site settings updated');
  };

  const navBtnClass = (tab: AdminTab) =>
    `w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-[#144AE0] text-white shadow-sm'
        : 'text-slate-600 dark:text-slate-300 hover:text-[#091A42] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/60'
    }`;

  const inputClass =
    'w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors';

  const cardClass =
    'bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 rounded-2xl shadow-sm';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-[#050C1F] text-slate-900 dark:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#091A42] dark:bg-[#FD5202] text-white px-6 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-white/15">
          <CheckCircle2 className="w-4 h-4 text-[#FD5202] dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-[#091A42] border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#091A42] dark:bg-[#FD5202] text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-[#091A42] dark:text-white">
              {t.panelTitle}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-[#A6D6FE]">
              {isRtl ? 'مدیریت آنلاین و دوزبانه کلیه بخش‌های وب‌سایت RCG' : 'Real-Time Bilingual CMS & Operations Console'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onEnterPageEditMode && (
            <button
              onClick={onEnterPageEditMode}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                isPageEditMode
                  ? 'bg-[#FD5202] border-[#FD5202] text-white'
                  : 'bg-orange-50 hover:bg-[#FD5202] text-[#FD5202] hover:text-white dark:bg-[#FD5202]/20 dark:hover:bg-[#FD5202] border-orange-200 dark:border-[#FD5202]/50'
              }`}
              title={isRtl ? 'فعال‌سازی حالت تنظیمات صفحه و ویرایش مستقیم روی سایت' : 'Enable Live Visual Page Edit Mode'}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isRtl ? 'حالت تنظیمات صفحه (روی سایت)' : 'Live Page Edit Mode'}
              </span>
            </button>
          )}

          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title={isDark ? (isRtl ? 'حالت روز' : 'Light Mode') : (isRtl ? 'حالت شب' : 'Dark Mode')}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#091A42]" />}
            </button>
          )}

          <button
            onClick={() => {
              onResetToDefaults();
              showToast(isRtl ? 'پیش‌فرض‌های برند با موفقیت بازیابی شدند' : 'Defaults restored');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-blue-950 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.resetDefaults}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#091A42] hover:bg-[#FD5202] dark:bg-slate-800 dark:hover:bg-[#FD5202] text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{t.closeBtn}</span>
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Clean Sidebar */}
        <aside className="w-56 sm:w-64 bg-white dark:bg-[#060F26] border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-blue-900/50 p-3.5 space-y-1 shrink-0 overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={navBtnClass('overview')}>
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{t.tabOverview}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-[#FD5202] to-[#E04600] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-blue-950/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PhosphorMegaphone weight="duotone" className={`w-4 h-4 shrink-0 ${activeTab === 'campaigns' ? 'text-white' : 'text-[#FD5202]'}`} />
              <span>{t.tabCampaigns}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {campaigns.length}
            </span>
          </button>

          <button onClick={() => setActiveTab('catalog')} className={navBtnClass('catalog')}>
            <div className="flex items-center gap-2.5">
              <PhosphorToolbox weight="duotone" className="w-4 h-4 shrink-0" />
              <span>{t.tabCatalog}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {products.length}
            </span>
          </button>

          <button onClick={() => setActiveTab('sharpening')} className={navBtnClass('sharpening')}>
            <div className="flex items-center gap-2.5">
              <PhosphorDisc weight="duotone" className={`w-4 h-4 shrink-0 ${activeTab === 'sharpening' ? 'text-white' : 'text-[#FD5202]'}`} />
              <span>{t.tabSharpening}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {sharpeningOrders.length}
            </span>
          </button>

          <button onClick={() => setActiveTab('inquiries')} className={navBtnClass('inquiries')}>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0" />
              <span>{t.tabInquiries}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {inquiries.length + campaignInquiries.length}
            </span>
          </button>

          <button onClick={() => setActiveTab('media')} className={navBtnClass('media')}>
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.tabMedia}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {mediaItems.length}
            </span>
          </button>

          <button onClick={() => setActiveTab('assets')} className={navBtnClass('assets')}>
            <div className="flex items-center gap-2.5">
              <PhosphorPalette weight="duotone" className="w-4 h-4 shrink-0" />
              <span>{t.tabAssets}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {brandAssets.length}
            </span>
          </button>

          <button onClick={() => setActiveTab('slides')} className={navBtnClass('slides')}>
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 shrink-0" />
              <span>{t.tabSlides}</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('navigation')} className={navBtnClass('navigation')}>
            <div className="flex items-center gap-2.5">
              <GripVertical className="w-4 h-4 shrink-0" />
              <span>{t.tabNavigation}</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('settings')} className={navBtnClass('settings')}>
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 shrink-0" />
              <span>{t.tabSettings}</span>
            </div>
          </button>
        </aside>

        {/* Tab Content Canvas */}
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto bg-slate-50 dark:bg-[#050C1F]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              <div>
                <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabOverview}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'خلاصه آمار سامانه، نمودارهای عملکرد، سفارش‌های تیزکاری و سرنخ‌های کمپین' : 'Executive overview, KPI trends, orders, and leads'}
                </p>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${cardClass} p-5 space-y-2`}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.tabSharpening}</span>
                  <p className="text-2xl font-black text-[#FD5202] font-mono tabular-nums">{sharpeningOrders.length}</p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {sharpeningOrders.filter((o) => o.status === 'new').length} {t.statusNew}
                  </p>
                </div>

                <div className={`${cardClass} p-5 space-y-2`}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.tabInquiries}</span>
                  <p className="text-2xl font-black text-[#144AE0] dark:text-[#A6D6FE] font-mono tabular-nums">
                    {inquiries.length + campaignInquiries.length}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {inquiries.filter((i) => i.status === 'new').length + campaignInquiries.filter((ci) => ci.status === 'new').length} {t.statusNew}
                  </p>
                </div>

                <div className={`${cardClass} p-5 space-y-2`}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.tabCatalog}</span>
                  <p className="text-2xl font-black text-[#091A42] dark:text-white font-mono tabular-nums">{products.length}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{isRtl ? 'دستگاه در کاتالوگ' : 'In catalog'}</p>
                </div>

                <div className={`${cardClass} p-5 space-y-2`}>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.tabCampaigns}</span>
                  <p className="text-2xl font-black text-[#091A42] dark:text-white font-mono tabular-nums">{campaigns.length}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {campaigns.filter((c) => c.isActive).length} {isRtl ? 'کمپین فعال' : 'Active'}
                  </p>
                </div>
              </div>

              {/* Recharts Analytics Section */}
              <AdminAnalyticsCharts
                language={language}
                products={products}
                sharpeningOrders={sharpeningOrders}
                inquiries={inquiries}
                campaignInquiries={campaignInquiries}
                isDark={isDark}
              />

              {/* Recent Sharpening Orders Quick Table */}
              <div className={`${cardClass} p-6 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#091A42] dark:text-white flex items-center gap-2">
                    <PhosphorDisc weight="duotone" className="w-4 h-4 text-[#FD5202]" />
                    <span>{isRtl ? 'جدیدترین سفارش‌های تیزکاری اره الماسه' : 'Recent Tool Sharpening Orders'}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('sharpening')}
                    className="text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE] hover:underline cursor-pointer"
                  >
                    {isRtl ? 'مشاهده همه' : 'View All'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 dark:border-blue-900 text-slate-500 dark:text-slate-400 text-right rtl:text-right ltr:text-left">
                      <tr>
                        <th className="py-2.5 px-3">{isRtl ? 'کد سفارش' : 'Order ID'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'مشتری' : 'Client'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'تلفن' : 'Phone'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'مشخصات تیغه' : 'Blade Specs'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'مبلغ تقریبی' : 'Estimate'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'وضعیت' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-blue-950">
                      {sharpeningOrders.slice(0, 4).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-blue-950/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#091A42] dark:text-white">{order.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{order.customerName}</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums">{order.phone}</td>
                          <td className="py-2.5 px-3">{order.bladeType} - {order.teethCount}</td>
                          <td className="py-2.5 px-3 font-bold text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">{order.estimatedPrice}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                order.status === 'new'
                                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  : order.status === 'in_progress'
                                  ? 'bg-blue-50 dark:bg-blue-950 text-[#144AE0] dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {order.status === 'new' ? t.statusNew : order.status === 'in_progress' ? t.statusInProgress : t.statusCompleted}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGN LANDING PAGES */}
          {activeTab === 'campaigns' && (
            <div className="space-y-8 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#FD5202] text-white">
                      <Flame className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabCampaigns}</h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    {isRtl
                      ? 'مدیریت لندینگ‌پیج‌های کمپین‌های فروش، شرایط اقساط و سرنخ‌های ثبت‌نام‌شده'
                      : 'Create & manage dedicated bilingual campaign landing pages and leads'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newCamp: CampaignLanding = {
                      id: `camp-${Date.now()}`,
                      slug: `campaign-${Date.now()}`,
                      titleFa: 'کمپین فروش ویژه ماشین‌آلات نجاری',
                      titleEn: 'Special Woodworking Equipment Promotion',
                      badgeFa: 'جشنواره رسمی RCG با تسهیلات ویژه',
                      badgeEn: 'Official RCG Machinery Festival',
                      headlineFa: 'طرح توسعه کارگاه‌های تولیدی چوب و ام‌دی‌اف',
                      headlineEn: 'Woodworking Workshop Expansion Program',
                      subheadlineFa: 'فرصت ویژه تجهیز کارگاه با اقساط بلندمدت و تحویل فوری در گیلان و مازندران.',
                      subheadlineEn: 'Exclusive workshop financing with rapid on-site delivery and warranty.',
                      heroImage: '/assets/aistudio/03_rcg_facility_hero_crop_20984afa.jpg',
                      ctaTextFa: 'ثبت‌نام و دریافت شرایط اقساطی',
                      ctaTextEn: 'Register & Inquire Financing',
                      secondaryCtaFa: 'دانلود کاتالوگ فنی',
                      secondaryCtaEn: 'Download Catalog',
                      specialOfferFa: 'شرایط پرداخت: ۴۰٪ پیش‌پرداخت + ۱۲ فقره چک صیادی',
                      specialOfferEn: 'Terms: 40% Down Payment + 12 Monthly Checks',
                      discountPercentage: 10,
                      downPaymentFa: '۴۰٪ پیش‌پرداخت',
                      downPaymentEn: '40% Down',
                      installmentsCountFa: '۱۲ فقره چک ماهانه',
                      installmentsCountEn: '12 Monthly Checks',
                      deliveryTermsFa: 'تحویل فوری در سراسر کشور',
                      deliveryTermsEn: 'Express Nationwide Delivery',
                      warrantyFa: '۱۲ ماه گارانتی شرکتی و پشتیبانی کامل',
                      warrantyEn: '12 Months Official Warranty',
                      highlightsFa: [
                        'تست حضوری دستگاه زیر بار در سالن نمایشگاه RCG',
                        'نصب و راه‌اندازی رایگان توسط تیم مهندسی فنی',
                        'تأمین ۱۰۰٪ تضمینی قطعات یدکی اصلی',
                        'آموزش کامل کار با کنترلر به اپراتور کارگاه',
                      ],
                      highlightsEn: [
                        'In-person live testing under load at RCG central showroom',
                        'Complimentary on-site installation by senior technicians',
                        '100% genuine spare parts availability guarantee',
                        'Full operator training on machine controller',
                      ],
                      registrationTitleFa: 'فرم ثبت‌نام و دریافت پیش‌فاکتور اقساطی',
                      registrationTitleEn: 'Priority Registration Form',
                      registrationSubtitleFa: 'پس از ثبت اطلاعات، کارشناس فروش ظرف حداکثر ۲ ساعت تماس می‌گیرد.',
                      registrationSubtitleEn: 'Our technical advisor will contact you within 2 hours.',
                      isActive: true,
                      viewsCount: 1,
                      conversionsCount: 0,
                    };
                    setEditingCampaign(newCamp);
                    setIsAddingCampaign(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FD5202] to-[#E04600] hover:from-[#E04600] hover:to-[#C03C00] shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'ایجاد کمپین لندینگ جدید' : 'New Campaign Page'}</span>
                </button>
              </div>

              {/* Campaigns List */}
              <div className="grid grid-cols-1 gap-4">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className={`${cardClass} p-5 sm:p-6 hover:border-[#FD5202]/50 transition-all space-y-4`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={camp.heroImage}
                          alt=""
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-200 dark:border-blue-800/50 shrink-0"
                        />
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                camp.isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {camp.isActive ? (isRtl ? 'فعال و در حال جذب' : 'Active') : (isRtl ? 'غیرفعال' : 'Inactive')}
                            </span>
                            <span className="text-xs text-[#144AE0] dark:text-[#A6D6FE] font-bold font-mono">
                              /{camp.slug}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-[#091A42] dark:text-white">
                            {isRtl ? camp.titleFa : camp.titleEn}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl">
                            {isRtl ? camp.headlineFa : camp.headlineEn}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 tabular-nums">
                            <span className="text-[#FD5202] font-bold">{isRtl ? camp.specialOfferFa : camp.specialOfferEn}</span>
                            <span>·</span>
                            <span className="font-mono">{isRtl ? `بازدید: ${camp.viewsCount ?? 120}` : `Views: ${camp.viewsCount ?? 120}`}</span>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                              {isRtl ? `ثبت‌نام‌ها: ${camp.conversionsCount ?? 18}` : `Leads: ${camp.conversionsCount ?? 18}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => onPreviewCampaign(camp)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FD5202] to-[#E04600] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'پیش‌نمایش لندینگ' : 'Preview Landing'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCampaign({ ...camp });
                              setIsAddingCampaign(false);
                            }}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-300 hover:text-[#144AE0] dark:hover:text-white transition-colors cursor-pointer"
                            title={t.edit}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateCampaign(camp)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-300 hover:text-[#144AE0] dark:hover:text-white transition-colors cursor-pointer"
                            title={t.duplicate}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCampaignActive(camp.id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            {camp.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Leads Table */}
              <div className={`${cardClass} p-6 space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#091A42] dark:text-white flex items-center gap-2">
                      <PhosphorMegaphone weight="duotone" className="w-4 h-4 text-[#FD5202]" />
                      <span>{isRtl ? 'متقاضیان صفحات فرود (Leads)' : 'Campaign Landing Leads'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {isRtl ? 'درخواست‌های ثبت‌نام‌شده از صفحات فرود کمپین‌ها' : 'Registered workshop leads requesting financing & demos'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'فیلتر:' : 'Filter:'}</span>
                    <select
                      value={campaignInquiryFilter}
                      onChange={(e) => setCampaignInquiryFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="all">{isRtl ? 'همه درخواست‌ها' : 'All Leads'}</option>
                      <option value="new">{isRtl ? 'جدید' : 'New'}</option>
                      <option value="contacted">{isRtl ? 'تماس گرفته شد' : 'Contacted'}</option>
                      <option value="contracted">{isRtl ? 'عقد قرارداد' : 'Contracted'}</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 dark:border-blue-900 text-slate-500 dark:text-slate-400 text-right rtl:text-right ltr:text-left">
                      <tr>
                        <th className="py-2.5 px-3">{isRtl ? 'کد' : 'ID'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'متقاضی' : 'Name'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'تلفن' : 'Phone'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'شهر / کارگاه' : 'City / Shop'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'کمپین' : 'Campaign'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'پرداخت' : 'Payment'}</th>
                        <th className="py-2.5 px-3">{isRtl ? 'وضعیت' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-blue-950">
                      {campaignInquiries
                        .filter((ci) => campaignInquiryFilter === 'all' || ci.status === campaignInquiryFilter)
                        .map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50 dark:hover:bg-blue-950/40">
                            <td className="py-3 px-3 font-mono font-bold text-[#091A42] dark:text-white">{inq.id}</td>
                            <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{inq.fullName}</td>
                            <td className="py-3 px-3 font-mono text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">{inq.phone}</td>
                            <td className="py-3 px-3">
                              <span className="font-medium text-slate-800 dark:text-slate-200">{inq.city}</span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">{inq.workshopType}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{inq.campaignTitle}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#144AE0] dark:text-[#A6D6FE] font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                                {inq.paymentPreference === 'installment'
                                  ? isRtl ? 'اقساط' : 'Installments'
                                  : inq.paymentPreference === 'cash'
                                  ? isRtl ? 'نقدی' : 'Cash'
                                  : isRtl ? 'تعویض' : 'Trade-in'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={inq.status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                  handleUpdateCampaignInquiryStatus(inq.id, e.target.value as CampaignInquiry['status'])
                                }
                                className="px-2 py-1 rounded text-[11px] font-bold bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-800 text-slate-800 dark:text-white focus:outline-none"
                              >
                                <option value="new">{isRtl ? 'جدید' : 'New'}</option>
                                <option value="contacted">{isRtl ? 'تماس گرفته شد' : 'Contacted'}</option>
                                <option value="contracted">{isRtl ? 'قرارداد / بازدید' : 'Contracted'}</option>
                                <option value="archived">{isRtl ? 'بایگانی' : 'Archived'}</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND ASSETS & FILE UPLOAD REPOSITORY */}
          {activeTab === 'assets' && (
            <div className="space-y-8 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#144AE0] text-white">
                      <FolderDown className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabAssets}</h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    {isRtl
                      ? 'آپلود مستقیم فایل‌های هویت بصری برند RCG، لوگوها، پوسترها و اسناد PDF'
                      : 'Upload and manage RCG brand identity files, logos, posters, and PDF manuals.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingAsset(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#144AE0] hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isRtl ? 'آپلود و ثبت فایل جدید' : 'Upload New Asset'}</span>
                </button>
              </div>

              {/* Brand Identity Quick Palette Reference */}
              <div className={`${cardClass} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FD5202]" />
                    <h4 className="text-sm font-extrabold text-[#091A42] dark:text-white">
                      {isRtl ? 'پالت رسمی رنگ‌ها و قوانین هویت بصری برند RCG' : 'Official RCG Brand Palette'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {isRtl
                      ? 'آبی آکسفورد (#091A42) · آبی تند (#144AE0) · نارنجی هویت (#FD5202) · آبی یخی (#A6D6FE)'
                      : 'Oxford Blue (#091A42) · Vivid Blue (#144AE0) · Brand Orange (#FD5202) · Ice Blue (#A6D6FE)'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#091A42] border border-slate-300 dark:border-white/20" title="#091A42" />
                  <span className="w-7 h-7 rounded-lg bg-[#144AE0] border border-slate-300 dark:border-white/20" title="#144AE0" />
                  <span className="w-7 h-7 rounded-lg bg-[#FD5202] border border-slate-300 dark:border-white/20" title="#FD5202" />
                  <span className="w-7 h-7 rounded-lg bg-[#A6D6FE] border border-slate-300 dark:border-white/20" title="#A6D6FE" />
                </div>
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandAssets.map((asset) => {
                  const isImageAsset =
                    asset.url.startsWith('data:image/') ||
                    !!asset.url.match(/\.(png|jpg|jpeg|webp|svg)$/i);

                  return (
                    <div
                      key={asset.id}
                      className={`${cardClass} p-5 hover:border-blue-400 dark:hover:border-blue-700/60 transition-all space-y-4 flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE]">
                            {asset.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {asset.fileSize}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#091A42] dark:text-white leading-snug">
                            {isRtl ? asset.titleFa : asset.titleEn}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                            {asset.fileType} · {asset.uploadedAt}
                          </p>
                        </div>

                        {isImageAsset ? (
                          <div className="h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-blue-900/40">
                            <img src={asset.url} alt="" className="w-full h-full object-contain p-2" />
                          </div>
                        ) : (
                          <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-blue-900/40 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                            <FileText className="w-8 h-8 text-[#FD5202]" />
                            <span className="text-xs font-mono">{asset.fileType}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-blue-900/50">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#144AE0] dark:bg-[#144AE0]/20 dark:hover:bg-[#144AE0] border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#144AE0] hover:text-white dark:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'دانلود فایل' : 'Download'}</span>
                        </a>

                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SHARPENING ORDERS */}
          {activeTab === 'sharpening' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabSharpening}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'مدیریت سفارش‌های تیزکاری اره الماسه ثبت شده از محاسبه‌گر آنلاین' : 'Manage diamond saw blade sharpening orders'}
                </p>
              </div>

              <div className="space-y-4">
                {sharpeningOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`${cardClass} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-[#FD5202] bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
                          {order.id}
                        </span>
                        <h4 className="font-bold text-base text-[#091A42] dark:text-white">{order.customerName}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({order.city})</span>
                        <span className="text-xs text-slate-400 font-mono">· {order.createdAt}</span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        <span className="font-mono text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">{isRtl ? 'تلفن:' : 'Phone:'} {order.phone}</span>
                        <span>{order.bladeType} ({order.diameter})</span>
                        <span>{order.teethCount}</span>
                        <span>{order.quantity} {isRtl ? 'عدد' : 'pcs'}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{order.estimatedPrice}</span>
                      </div>

                      {order.notes && (
                        <p className="text-xs text-amber-800 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 mt-1">
                          {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'new')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          order.status === 'new'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t.statusNew}
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          order.status === 'in_progress'
                            ? 'bg-[#144AE0] text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t.statusInProgress}
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          order.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t.statusCompleted}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabInquiries}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'پیام‌های دریافتی و درخواست‌های مشاوره کارگاهی' : 'Client consultation messages and inquiries'}
                </p>
              </div>

              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className={`${cardClass} p-5 space-y-3`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-xs text-[#144AE0] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {inq.id}
                        </span>
                        <h4 className="font-bold text-sm text-[#091A42] dark:text-white">{inq.name}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">({inq.phone})</span>
                        <span className="text-xs text-[#FD5202] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded font-semibold">
                          {inq.department}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{inq.createdAt}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      <p className="font-bold text-[#144AE0] dark:text-[#A6D6FE] mb-1">{inq.subject}</p>
                      <p>{inq.message}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-blue-950">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'new')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            inq.status === 'new' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t.statusNew}
                        </button>
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'contacted')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            inq.status === 'contacted' ? 'bg-[#144AE0] text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isRtl ? 'تماس گرفته شد' : 'Contacted'}
                        </button>
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'resolved')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            inq.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isRtl ? 'پاسخ داده شد' : 'Resolved'}
                        </button>
                      </div>

                      <a
                        href={`tel:${inq.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'تماس تلفنی' : 'Call'}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MACHINERY CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-blue-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#FD5202] text-white">
                      <Package className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">
                      {isRtl ? 'مدیریت دستگاه‌ها و ماشین‌آلات صنعتی RCG' : 'Machinery & Equipment Management'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl
                      ? 'مدیریت مشخصات فنی، شرایط اقساط، تصاویر ایستگاه‌ها و امتیازهای کیفیت'
                      : 'Configure machinery specifications, installment terms, station galleries, and ratings.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      titleFa: '',
                      titleEn: '',
                      category: 'edgebanders',
                      categoryFa: 'لبه‌چسبان PVC',
                      categoryEn: 'PVC Edgebanders',
                      brand: 'پایون | PAYON',
                      model: 'NB4J Pro',
                      year: '2024',
                      condition: 'new',
                      conditionFa: 'دستگاه نو (گارانتی)',
                      conditionEn: 'Brand New',
                      power: '9.5 kW',
                      priceFa: 'تماس برای قیمت روز / شرایط اقساط',
                      priceEn: 'Call for Price / Terms',
                      downPaymentFa: '۴۰٪ پیش‌پرداخت',
                      downPaymentEn: '40% Down',
                      installmentChecksFa: '۱۶ فقره چک',
                      installmentChecksEn: '16 Checks',
                      installmentAvailable: true,
                      precisionRating: 98,
                      durabilityRating: 97,
                      efficiencyRating: 95,
                      isActive: true,
                      featuredPoster: false,
                      qualityBadgeFa: 'دستگاهی با کیفیت و قابل اعتماد',
                      qualityBadgeEn: 'Certified High Reliability',
                      specsFa: [
                        { key: 'ایستگاه‌ها', value: 'پیش‌فرز، چسب، سروته‌زن، فرز بالا/پایین، لیسه و پولیش' },
                        { key: 'سرعت پیشروی', value: '۱۶ الی ۲۲ متر بر دقیقه' },
                      ],
                      specsEn: [
                        { key: 'Stations', value: 'Pre-milling, Glue, End trim, Fine trim, Scraper, Buffing' },
                        { key: 'Feed Speed', value: '16 to 22 m/min' },
                      ],
                      image: '/src/assets/images/payon_edgebander_nb4j_1793316520935.jpg',
                      stations: [
                        { titleFa: 'ایستگاه پیش‌فرز الماسه', titleEn: 'Diamond Pre-milling', img: '/assets/aistudio/file_0000000045ac81f49bc5e19e902c864a_0796f548.png' },
                        { titleFa: 'غلطک‌های فشار و چسب تفلونی', titleEn: 'Pressure Rollers & Glue Pot', img: '/assets/aistudio/file_000000002c78824384157c7938ba7f05_85caf837.png' },
                        { titleFa: 'سروته‌زن دوبل زاویه‌پذیر', titleEn: 'Dual End Trimming Saws', img: '/assets/aistudio/file_0000000045ac81f49bc5e19e902c864a_0796f548.png' },
                        { titleFa: 'فرز بالا/پایین و پولیش نهایی', titleEn: 'Fine Trim & Buffing', img: '/assets/aistudio/file_000000002c78824384157c7938ba7f05_85caf837.png' },
                      ],
                    });
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'افزودن دستگاه اختصاصی' : 'Add Custom Machine'}</span>
                </button>
              </div>

              {/* Quick Presets Bar */}
              <div className={`${cardClass} p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
                <span className="font-bold text-[#144AE0] dark:text-[#A6D6FE] flex items-center gap-1.5 shrink-0">
                  <Zap className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? 'قالب‌های آماده سریع:' : 'Quick Presets:'}</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleCreateFromPreset('payon_edgebander')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                  >
                    + {isRtl ? 'لبه‌چسبان ۶ ایستگاه پایون' : 'Payon Edgebander'}
                  </button>
                  <button
                    onClick={() => handleCreateFromPreset('saw_380')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                  >
                    + {isRtl ? 'دورکن ۳۸۰ واگنی پایون' : '380 Table Saw'}
                  </button>
                  <button
                    onClick={() => handleCreateFromPreset('cnc_wood')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                  >
                    + {isRtl ? 'فرز سی‌ان‌سی ۳ محوره' : '3-Axis CNC'}
                  </button>
                  <button
                    onClick={() => handleCreateFromPreset('refurb_line')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                  >
                    + {isRtl ? 'دستگاه اورهال‌شده آرسی' : 'RCG Rebuild'}
                  </button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className={`${cardClass} p-4 space-y-3`}>
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 text-slate-400" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder={isRtl ? 'جستجوی نام دستگاه، مدل، برند...' : 'Search by title, model, or brand...'}
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/80 rounded-xl rtl:pr-9 ltr:pl-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#FD5202] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
                    {(['all', 'active', 'installment', 'featured'] as const).map((statusKey) => (
                      <button
                        key={statusKey}
                        onClick={() => setCatalogStatusFilter(statusKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                          catalogStatusFilter === statusKey
                            ? 'bg-[#144AE0] text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {statusKey === 'all'
                          ? isRtl ? 'همه' : 'All'
                          : statusKey === 'active'
                          ? isRtl ? 'فعال' : 'Active'
                          : statusKey === 'installment'
                          ? isRtl ? 'اقساطی' : 'Installment'
                          : isRtl ? 'پوستر' : 'Poster'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {[
                    { id: 'all', label: isRtl ? 'همه دسته‌ها' : 'All Categories' },
                    { id: 'edgebanders', label: isRtl ? 'لبه‌چسبان' : 'Edgebanders' },
                    { id: 'saws', label: isRtl ? 'دورکن و پانل‌بر' : 'Table Saws' },
                    { id: 'cnc', label: isRtl ? 'سی‌ان‌سی' : 'CNC' },
                    { id: 'blades', label: isRtl ? 'اره الماسه' : 'Saw Blades' },
                    { id: 'refurbished', label: isRtl ? 'اورهال شده' : 'Refurbished' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCatalogCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                        catalogCategoryFilter === cat.id
                          ? 'bg-[#091A42] dark:bg-blue-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Products */}
              {(() => {
                const searchLower = catalogSearch.toLowerCase().trim();
                const filtered = products.filter((prod) => {
                  const matchesSearch =
                    !searchLower ||
                    prod.titleFa.toLowerCase().includes(searchLower) ||
                    prod.titleEn.toLowerCase().includes(searchLower) ||
                    prod.brand.toLowerCase().includes(searchLower) ||
                    prod.model.toLowerCase().includes(searchLower);
                  const matchesCategory = catalogCategoryFilter === 'all' || prod.category === catalogCategoryFilter;
                  const matchesStatus =
                    catalogStatusFilter === 'all' ||
                    (catalogStatusFilter === 'active' && prod.isActive !== false) ||
                    (catalogStatusFilter === 'installment' && prod.installmentAvailable) ||
                    (catalogStatusFilter === 'featured' && prod.featuredPoster);
                  return matchesSearch && matchesCategory && matchesStatus;
                });

                if (filtered.length === 0) {
                  return (
                    <div className={`${cardClass} p-12 text-center space-y-3`}>
                      <Package className="w-10 h-10 mx-auto text-slate-400" />
                      <p className="text-sm font-bold text-[#091A42] dark:text-white">
                        {isRtl ? 'هیچ دستگاهی با این مشخصات یافت نشد' : 'No equipment matched your filters'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((prod) => {
                      const isActive = prod.isActive !== false;
                      const isFeatured = !!prod.featuredPoster;
                      const precision = prod.precisionRating ?? 98;
                      const durability = prod.durabilityRating ?? 97;
                      const efficiency = prod.efficiencyRating ?? 95;

                      return (
                        <div key={prod.id} className={`${cardClass} p-5 space-y-4`}>
                          <div className="flex items-start gap-4">
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200 dark:border-blue-900/40">
                              <img src={prod.image} alt={prod.titleFa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <span
                                className={`absolute top-1.5 rtl:right-1.5 ltr:left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                                }`}
                              >
                                {isActive ? (isRtl ? 'فعال' : 'Active') : (isRtl ? 'مخفی' : 'Draft')}
                              </span>
                            </div>

                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-[#144AE0] dark:text-[#A6D6FE] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                  {isRtl ? prod.categoryFa : prod.categoryEn}
                                </span>
                                <span className="text-xs font-mono font-bold text-[#091A42] dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  {prod.model}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-[#091A42] dark:text-white truncate">
                                {isRtl ? prod.titleFa : prod.titleEn}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-300">{prod.brand}</p>
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                                {isRtl ? prod.priceFa : prod.priceEn}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-blue-950 text-[10px] tabular-nums">
                            <div className="space-y-1">
                              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{isRtl ? 'دقت' : 'Precision'}</span>
                                <span className="font-mono font-bold text-[#144AE0] dark:text-[#A6D6FE]">{precision}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-[#144AE0] rounded-full" style={{ width: `${precision}%` }} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{isRtl ? 'استقامت' : 'Durability'}</span>
                                <span className="font-mono font-bold text-[#FD5202]">{durability}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FD5202] rounded-full" style={{ width: `${durability}%` }} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{isRtl ? 'راندمان' : 'Efficiency'}</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{efficiency}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${efficiency}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-blue-950 gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleProductActive(prod.id)}
                                className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                              >
                                {isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                                <span className="text-[11px]">{isActive ? (isRtl ? 'فعال' : 'Active') : (isRtl ? 'مخفی' : 'Hidden')}</span>
                              </button>
                              <button
                                onClick={() => handleToggleProductFeatured(prod.id)}
                                className={`px-2 py-1 text-xs rounded-lg flex items-center gap-1 cursor-pointer ${
                                  isFeatured
                                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                                <span className="text-[11px]">{isRtl ? 'پوستر' : 'Poster'}</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDuplicateProduct(prod)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsAddingProduct(false);
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-[#144AE0] hover:bg-blue-700 text-white font-semibold cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>{t.edit}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 7: MEDIA & ARTICLES */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabMedia}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl ? 'انتشار مقالات فنی، اخبار رویدادها و پروژه‌های صنعتی به دو زبان' : 'Publish bilingual technical guides, exhibition news, and project stories'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingMedia({
                      id: `post-${Date.now()}`,
                      type: 'article',
                      typeFa: 'مقاله فنی',
                      typeEn: 'Technical Guide',
                      titleFa: '',
                      titleEn: '',
                      dateFa: 'امروز',
                      dateEn: 'Today',
                      readTimeFa: '۴ دقیقه',
                      readTimeEn: '4 min read',
                      summaryFa: '',
                      summaryEn: '',
                      contentFa: '',
                      contentEn: '',
                      image: '/assets/aistudio/04_saw_blade_hero_crop_dffed999.jpg',
                      authorFa: 'تیم فنی آرسی',
                      authorEn: 'RCG Technical Team',
                    });
                    setIsAddingMedia(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNew}</span>
                </button>
              </div>

              <div className="space-y-4">
                {mediaItems.map((item) => (
                  <div key={item.id} className={`${cardClass} p-4 flex items-start gap-4`}>
                    <img
                      src={item.image}
                      alt={item.titleFa}
                      className="w-24 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#FD5202] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded">
                          {isRtl ? item.typeFa : item.typeEn}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? item.dateFa : item.dateEn}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#091A42] dark:text-white">{isRtl ? item.titleFa : item.titleEn}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{isRtl ? item.summaryFa : item.summaryEn}</p>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            setEditingMedia(item);
                            setIsAddingMedia(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{t.edit}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/70 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.delete}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: HERO CAROUSEL */}
          {activeTab === 'slides' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabSlides}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'ویرایش تیترهای دوزبانه، شعارها و تصاویر اسلایدر صفحه نخست' : 'Edit bilingual hero headlines, subtitles, and imagery'}
                </p>
              </div>

              <div className="space-y-4">
                {heroSlides.map((slide, idx) => (
                  <div key={slide.id} className={`${cardClass} p-5 space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE]">
                        {isRtl ? `اسلاید ${idx + 1}` : `Slide ${idx + 1}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">تیتر فارسی</label>
                        <input
                          type="text"
                          value={slide.titleFa}
                          onChange={(e) =>
                            onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, titleFa: e.target.value } : s)))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Title (English)</label>
                        <input
                          type="text"
                          value={slide.titleEn}
                          onChange={(e) =>
                            onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, titleEn: e.target.value } : s)))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">بخش برجسته نارنجی (فارسی)</label>
                        <input
                          type="text"
                          value={slide.highlightFa}
                          onChange={(e) =>
                            onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, highlightFa: e.target.value } : s)))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Highlight (English)</label>
                        <input
                          type="text"
                          value={slide.highlightEn}
                          onChange={(e) =>
                            onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, highlightEn: e.target.value } : s)))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">توضیحات فارسی</label>
                        <textarea
                          rows={2}
                          value={slide.subtitleFa}
                          onChange={(e) =>
                            onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, subtitleFa: e.target.value } : s)))
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Subtitle (English)</label>
                        <textarea
                          rows={2}
                          value={slide.subtitleEn}
                          onChange={(e) =>
                            onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, subtitleEn: e.target.value } : s)))
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>

                    {/* Slide Image & CTA Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-blue-900/50">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">
                          {isRtl ? 'تصویر اسلاید (آدرس یا آپلود)' : 'Slide Image'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={slide.image}
                            onChange={(e) =>
                              onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, image: e.target.value } : s)))
                            }
                            className={`${inputClass} flex-1 font-mono`}
                            dir="ltr"
                          />
                          <label className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'آپلود' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleReadFileAsDataUrl(e.target.files?.[0], (dataUrl) =>
                                  onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, image: dataUrl } : s)))
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">
                          {isRtl ? 'متن کلید اول + لینک' : 'Primary CTA Text & Link'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={slide.primaryCtaFa}
                            onChange={(e) =>
                              onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, primaryCtaFa: e.target.value } : s)))
                            }
                            className={inputClass}
                          />
                          <input
                            type="text"
                            value={slide.primaryCtaLink || '#departments'}
                            onChange={(e) =>
                              onUpdateSlides(heroSlides.map((s) => (s.id === slide.id ? { ...s, primaryCtaLink: e.target.value } : s)))
                            }
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: DRAG-AND-DROP NAVIGATION LINKS (@dnd-kit) */}
          {activeTab === 'navigation' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabNavigation}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl
                    ? 'ویرایش ترتیب لینک‌های ناوبری با کشیدن و رها کردن (Drag & Drop) و مدیریت عناوین دوزبانه'
                    : 'Reorder header & footer navigation items via drag-and-drop and customize labels.'}
                </p>
              </div>

              <NavigationManager
                navLinks={navLinks}
                language={language}
                onUpdateNavLinks={onUpdateNavLinks}
                onNotify={showToast}
              />
            </div>
          )}

          {/* TAB 10: SITE SETTINGS & HEADER LOGO CUSTOMIZATION */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabSettings}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'تنظیمات لوگوی هدر، رنگ‌بندی برند، شماره تماس‌ها، نشانی دوزبانه و لینک شبکه‌های اجتماعی' : 'Customize header logo, brand colors, contact info, and official social links'}
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className={`${cardClass} p-6 space-y-6`}>
                {/* Header Logo & Brand Customization Block */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#FD5202]" />
                      <span>{isRtl ? 'تنظیمات لوگوی هدر سایت و رنگ‌بندی برند' : 'Header Logo & Brand Styling'}</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, logoType: 'vector' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border ${
                          (localSettings.logoType || 'vector') === 'vector'
                            ? 'bg-[#144AE0] text-white border-[#144AE0]'
                            : 'bg-white dark:bg-[#091A42] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-800'
                        }`}
                      >
                        {isRtl ? 'لوگوی برداری RCG' : 'RCG Vector Logo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, logoType: 'custom' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border ${
                          localSettings.logoType === 'custom'
                            ? 'bg-[#144AE0] text-white border-[#144AE0]'
                            : 'bg-white dark:bg-[#091A42] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-800'
                        }`}
                      >
                        {isRtl ? 'لوگوی تصویری دلخواه' : 'Custom Image Logo'}
                      </button>
                    </div>
                  </div>

                  {/* Live Logo Preview Strip */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 flex items-center justify-between gap-4">
                    <RcgLogo
                      variant={localSettings.logoVariant || 'color'}
                      height={localSettings.logoHeight || 36}
                      showSubtitle={localSettings.logoShowSubtitle !== false}
                      subtitleType={isRtl ? 'fa' : 'en'}
                      logoType={localSettings.logoType || 'vector'}
                      customLogoUrl={localSettings.customLogoUrl}
                      primaryColor={localSettings.logoPrimaryColor || '#144AE0'}
                      secondaryColor={localSettings.logoSecondaryColor || '#091A42'}
                      accentColor={localSettings.logoAccentColor || '#FD5202'}
                      companyNameFa={localSettings.companyNameFa}
                      sloganFa={localSettings.sloganFa}
                    />
                    <span className="px-3.5 py-2 rounded-xl bg-[#FD5202] text-white text-xs font-bold shrink-0">
                      {isRtl ? localSettings.headerCtaTextFa || 'درخواست مشاوره و قیمت' : localSettings.headerCtaTextEn || 'Request Quote'}
                    </span>
                  </div>

                  {localSettings.logoType === 'custom' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        value={localSettings.customLogoUrl || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, customLogoUrl: e.target.value })}
                        placeholder="URL یا تصویر لوگوی آپلود شده..."
                        className={`${inputClass} flex-1 font-mono`}
                        dir="ltr"
                      />
                      <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'آپلود تصویر لوگو' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleReadFileAsDataUrl(e.target.files?.[0], (dataUrl) =>
                              setLocalSettings({ ...localSettings, customLogoUrl: dataUrl, logoType: 'custom' })
                            )
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'رنگ اصلی لوگو' : 'Primary Logo Color'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={localSettings.logoPrimaryColor || '#144AE0'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoPrimaryColor: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={localSettings.logoPrimaryColor || '#144AE0'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoPrimaryColor: e.target.value })}
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'رنگ حروف لوگو' : 'Secondary Logo Color'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={localSettings.logoSecondaryColor || '#091A42'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoSecondaryColor: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={localSettings.logoSecondaryColor || '#091A42'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoSecondaryColor: e.target.value })}
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'رنگ مثلث تاکیدی' : 'Accent Triangle Color'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={localSettings.logoAccentColor || '#FD5202'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoAccentColor: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={localSettings.logoAccentColor || '#FD5202'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoAccentColor: e.target.value })}
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isRtl ? `ارتفاع لوگو در هدر: ${localSettings.logoHeight || 36}px` : `Logo Height: ${localSettings.logoHeight || 36}px`}
                      </label>
                      <input
                        type="range"
                        min={26}
                        max={56}
                        value={localSettings.logoHeight || 36}
                        onChange={(e) => setLocalSettings({ ...localSettings, logoHeight: Number(e.target.value) })}
                        className="w-full accent-[#FD5202]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isRtl ? 'استایل رنگ لوگو' : 'Logo Variant'}
                      </label>
                      <select
                        value={localSettings.logoVariant || 'color'}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            logoVariant: e.target.value as 'color' | 'dark' | 'light',
                          })
                        }
                        className={inputClass}
                      >
                        <option value="color">{isRtl ? 'رنگی رسمی برند (Color)' : 'Brand Color'}</option>
                        <option value="dark">{isRtl ? 'تک‌رنگ تیره (Dark)' : 'Monochrome Dark'}</option>
                        <option value="light">{isRtl ? 'تک‌رنگ سفید (Light)' : 'Monochrome Light'}</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 pt-3 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.logoShowSubtitle !== false}
                        onChange={(e) => setLocalSettings({ ...localSettings, logoShowSubtitle: e.target.checked })}
                        className="w-4 h-4 accent-[#FD5202] rounded"
                      />
                      <span>{isRtl ? 'نمایش نام و شعار زیر لوگو' : 'Show Brand Subtitle'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-blue-900">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'متن کلید هدر (فارسی)' : 'Header CTA (Fa)'}</label>
                      <input
                        type="text"
                        value={localSettings.headerCtaTextFa || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, headerCtaTextFa: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'متن کلید هدر (EN)' : 'Header CTA (En)'}</label>
                      <input
                        type="text"
                        value={localSettings.headerCtaTextEn || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, headerCtaTextEn: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'لینک مقصد کلید هدر' : 'Header CTA Link'}</label>
                      <input
                        type="text"
                        value={localSettings.headerCtaLink || '#consultation-modal'}
                        onChange={(e) => setLocalSettings({ ...localSettings, headerCtaLink: e.target.value })}
                        className={`${inputClass} font-mono`}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'تلفن ثابت ۱' : 'Primary Phone'}</label>
                    <input
                      type="text"
                      value={localSettings.phonePrimary}
                      onChange={(e) => setLocalSettings({ ...localSettings, phonePrimary: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'تلفن همراه / پشتیبانی' : 'Mobile / Support'}</label>
                    <input
                      type="text"
                      value={localSettings.phoneSecondary}
                      onChange={(e) => setLocalSettings({ ...localSettings, phoneSecondary: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <WhatsAppBrandIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>{isRtl ? 'شماره واتس‌اپ' : 'WhatsApp Number'}</span>
                    </label>
                    <input
                      type="text"
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'ایمیل رسمی' : 'Official Email'}</label>
                    <input
                      type="email"
                      value={localSettings.email}
                      onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* Official Social Networks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-blue-900/50">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <InstagramBrandIcon className="w-3.5 h-3.5 text-pink-500" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="url"
                      value={localSettings.instagramUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <LinkedInBrandIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>LinkedIn</span>
                    </label>
                    <input
                      type="url"
                      value={localSettings.linkedinUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, linkedinUrl: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <TelegramBrandIcon className="w-3.5 h-3.5 text-sky-500" />
                      <span>Telegram</span>
                    </label>
                    <input
                      type="url"
                      value={localSettings.telegramUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, telegramUrl: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'نشانی فارسی' : 'Persian Address'}</label>
                  <input
                    type="text"
                    value={localSettings.addressFa}
                    onChange={(e) => setLocalSettings({ ...localSettings, addressFa: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Address (English)</label>
                  <input
                    type="text"
                    value={localSettings.addressEn}
                    onChange={(e) => setLocalSettings({ ...localSettings, addressEn: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'ساعات کاری فارسی' : 'Working Hours (Fa)'}</label>
                    <input
                      type="text"
                      value={localSettings.workingHoursFa}
                      onChange={(e) => setLocalSettings({ ...localSettings, workingHoursFa: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Working Hours (English)</label>
                    <input
                      type="text"
                      value={localSettings.workingHoursEn}
                      onChange={(e) => setLocalSettings({ ...localSettings, workingHoursEn: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FD5202] hover:bg-[#E04600] shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.saveChanges}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Product Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-xs text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900/80 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#FD5202] text-white">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#091A42] dark:text-white">
                    {isAddingProduct
                      ? isRtl ? 'افزودن دستگاه صنعتی جدید' : 'Add New Industrial Machine'
                      : isRtl ? `ویرایش دستگاه: ${editingProduct.brand} ${editingProduct.model}` : `Edit Machine: ${editingProduct.model}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#A6D6FE]">
                    {isRtl ? 'مشخصات فنی، شرایط اقساط، ایستگاه‌های ۴گانه و شاخص‌های کیفیت' : 'Technical specs, installments, stations & ratings'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* 1. Identity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-2 text-[#144AE0] dark:text-[#A6D6FE]">
                  <Layers className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? '۱. هویت و برند دستگاه' : '1. Machine Identity & Category'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'عنوان فارسی' : 'Persian Title'}</label>
                    <input
                      type="text"
                      value={editingProduct.titleFa}
                      onChange={(e) => setEditingProduct({ ...editingProduct, titleFa: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'عنوان انگلیسی' : 'English Title'}</label>
                    <input
                      type="text"
                      value={editingProduct.titleEn}
                      onChange={(e) => setEditingProduct({ ...editingProduct, titleEn: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'دسته‌بندی' : 'Category'}</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const val = e.target.value as Product['category'];
                        setEditingProduct({
                          ...editingProduct,
                          category: val,
                          categoryFa:
                            val === 'saws'
                              ? 'دورکن و پانل‌بر'
                              : val === 'edgebanders'
                              ? 'لبه‌چسبان PVC'
                              : val === 'cnc'
                              ? 'سی‌ان‌سی و فرز'
                              : val === 'blades'
                              ? 'اره الماسه و ابزار'
                              : 'ماشین‌آلات اورهال شده',
                          categoryEn:
                            val === 'saws'
                              ? 'Sliding Table Saws'
                              : val === 'edgebanders'
                              ? 'PVC Edgebanders'
                              : val === 'cnc'
                              ? 'CNC Routers'
                              : val === 'blades'
                              ? 'Saw Blades'
                              : 'Refurbished Machinery',
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="edgebanders">لبه‌چسبان PVC</option>
                      <option value="saws">دورکن و پانل‌بر</option>
                      <option value="cnc">سی‌ان‌سی و فرز</option>
                      <option value="blades">اره الماسه و ابزار</option>
                      <option value="refurbished">اورهال شده</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'برند' : 'Brand'}</label>
                    <input
                      type="text"
                      value={editingProduct.brand}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'مدل' : 'Model'}</label>
                    <input
                      type="text"
                      value={editingProduct.model}
                      onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'سال ساخت' : 'Year'}</label>
                    <input
                      type="text"
                      value={editingProduct.year || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Pricing */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-2 text-[#144AE0] dark:text-[#A6D6FE]">
                  <Award className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? '۲. قیمت‌گذاری و شرایط پرداخت اقساطی' : '2. Pricing & Financing'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'متن شرایط (فارسی)' : 'Terms (Fa)'}</label>
                    <input
                      type="text"
                      value={editingProduct.priceFa}
                      onChange={(e) => setEditingProduct({ ...editingProduct, priceFa: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'Terms (English)' : 'Terms (En)'}</label>
                    <input
                      type="text"
                      value={editingProduct.priceEn}
                      onChange={(e) => setEditingProduct({ ...editingProduct, priceEn: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'پیش‌پرداخت' : 'Down Payment'}</label>
                    <input
                      type="text"
                      value={editingProduct.downPaymentFa || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, downPaymentFa: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'تعداد چک‌ها' : 'Checks'}</label>
                    <input
                      type="text"
                      value={editingProduct.installmentChecksFa || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, installmentChecksFa: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Ratings */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-2 text-[#144AE0] dark:text-[#A6D6FE]">
                  <SlidersHorizontal className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? '۳. شاخص‌های فنی (٪)' : '3. Engineering Ratings (%)'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
                  <div className={`${cardClass} p-3 space-y-1.5`}>
                    <div className="flex justify-between">
                      <span>{isRtl ? 'دقت' : 'Precision'}</span>
                      <span className="font-mono font-bold text-[#144AE0] dark:text-[#A6D6FE]">{editingProduct.precisionRating ?? 98}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={editingProduct.precisionRating ?? 98}
                      onChange={(e) => setEditingProduct({ ...editingProduct, precisionRating: Number(e.target.value) })}
                      className="w-full accent-[#144AE0]"
                    />
                  </div>
                  <div className={`${cardClass} p-3 space-y-1.5`}>
                    <div className="flex justify-between">
                      <span>{isRtl ? 'استقامت' : 'Durability'}</span>
                      <span className="font-mono font-bold text-[#FD5202]">{editingProduct.durabilityRating ?? 97}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={editingProduct.durabilityRating ?? 97}
                      onChange={(e) => setEditingProduct({ ...editingProduct, durabilityRating: Number(e.target.value) })}
                      className="w-full accent-[#FD5202]"
                    />
                  </div>
                  <div className={`${cardClass} p-3 space-y-1.5`}>
                    <div className="flex justify-between">
                      <span>{isRtl ? 'راندمان' : 'Efficiency'}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{editingProduct.efficiencyRating ?? 95}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={editingProduct.efficiencyRating ?? 95}
                      onChange={(e) => setEditingProduct({ ...editingProduct, efficiencyRating: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Image Upload & URL */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-2 text-[#144AE0] dark:text-[#A6D6FE]">
                  <ImageIcon className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? '۴. تصویر اصلی دستگاه' : '4. Machine Image'}</span>
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'آپلود عکس' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleReadFileAsDataUrl(e.target.files?.[0], (dataUrl) =>
                          setEditingProduct({ ...editingProduct, image: dataUrl })
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-blue-900 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(editingProduct)}
                className="flex items-center gap-1.5 px-7 py-2.5 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isRtl ? 'ذخیره مشخصات دستگاه' : 'Save Machine'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Edit / Add Modal (Full Bilingual) */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900 pb-3">
              <h3 className="font-bold text-base text-[#091A42] dark:text-white">
                {isAddingMedia ? (isRtl ? 'انتشار مطلب جدید' : 'New Article') : (isRtl ? 'ویرایش مطلب' : 'Edit Article')}
              </h3>
              <button onClick={() => setEditingMedia(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">عنوان مطلب (فارسی)</label>
                  <input
                    type="text"
                    value={editingMedia.titleFa}
                    onChange={(e) => setEditingMedia({ ...editingMedia, titleFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Title (English)</label>
                  <input
                    type="text"
                    value={editingMedia.titleEn}
                    onChange={(e) => setEditingMedia({ ...editingMedia, titleEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'نوع مطلب' : 'Type'}</label>
                  <select
                    value={editingMedia.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const val = e.target.value as MediaItem['type'];
                      setEditingMedia({
                        ...editingMedia,
                        type: val,
                        typeFa: val === 'article' ? 'مقاله فنی' : val === 'news' ? 'اخبار' : 'پروژه شاخص',
                        typeEn: val === 'article' ? 'Technical Guide' : val === 'news' ? 'News' : 'Project',
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="article">مقاله فنی</option>
                    <option value="news">اخبار و رویداد</option>
                    <option value="project">پروژه صنعتی</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">نویسنده (فارسی)</label>
                  <input
                    type="text"
                    value={editingMedia.authorFa}
                    onChange={(e) => setEditingMedia({ ...editingMedia, authorFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Author (English)</label>
                  <input
                    type="text"
                    value={editingMedia.authorEn}
                    onChange={(e) => setEditingMedia({ ...editingMedia, authorEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">خلاصه کوتاه (فارسی)</label>
                  <textarea
                    rows={2}
                    value={editingMedia.summaryFa}
                    onChange={(e) => setEditingMedia({ ...editingMedia, summaryFa: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Summary (English)</label>
                  <textarea
                    rows={2}
                    value={editingMedia.summaryEn}
                    onChange={(e) => setEditingMedia({ ...editingMedia, summaryEn: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">متن کامل مقاله (فارسی)</label>
                  <textarea
                    rows={4}
                    value={editingMedia.contentFa}
                    onChange={(e) => setEditingMedia({ ...editingMedia, contentFa: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Full Content (English)</label>
                  <textarea
                    rows={4}
                    value={editingMedia.contentEn}
                    onChange={(e) => setEditingMedia({ ...editingMedia, contentEn: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'تصویر کاور مقاله' : 'Article Cover Image'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingMedia.image}
                    onChange={(e) => setEditingMedia({ ...editingMedia, image: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'آپلود' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleReadFileAsDataUrl(e.target.files?.[0], (dataUrl) =>
                          setEditingMedia({ ...editingMedia, image: dataUrl })
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-blue-900 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveMedia(editingMedia)}
                className="px-6 py-2 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white font-bold cursor-pointer"
              >
                {isRtl ? 'انتشار مطلب' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Edit / Create Modal (Full Bilingual) */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-xs text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#FD5202] text-white">
                  <Flame className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#091A42] dark:text-white">
                    {isAddingCampaign
                      ? isRtl ? 'ایجاد صفحه فرود کمپین جدید' : 'Create New Campaign Landing'
                      : isRtl ? `ویرایش کمپین: ${editingCampaign.titleFa}` : `Edit Campaign: ${editingCampaign.titleEn}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#A6D6FE]">
                    {isRtl ? 'تنظیمات دوزبانه CTA، پیشنهاد ویژه و شرایط اقساط' : 'Bilingual CTA, special offer & installment configuration'}
                  </p>
                </div>
              </div>

              <button onClick={() => setEditingCampaign(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'نام کمپین (فارسی)' : 'Campaign Title (Fa)'}</label>
                  <input
                    type="text"
                    value={editingCampaign.titleFa}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, titleFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Campaign Title (English)</label>
                  <input
                    type="text"
                    value={editingCampaign.titleEn}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, titleEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">تیتر اصلی لندینگ (Headline Fa)</label>
                  <input
                    type="text"
                    value={editingCampaign.headlineFa}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, headlineFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Main Headline (English)</label>
                  <input
                    type="text"
                    value={editingCampaign.headlineEn}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, headlineEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">شعار ترغیبی (Subheadline Fa)</label>
                  <textarea
                    rows={2}
                    value={editingCampaign.subheadlineFa}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, subheadlineFa: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Subheadline (English)</label>
                  <textarea
                    rows={2}
                    value={editingCampaign.subheadlineEn}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, subheadlineEn: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">متن دکمه CTA (فارسی)</label>
                  <input
                    type="text"
                    value={editingCampaign.ctaTextFa}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, ctaTextFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">CTA Button (English)</label>
                  <input
                    type="text"
                    value={editingCampaign.ctaTextEn}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, ctaTextEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">پیشنهاد ویژه (فارسی)</label>
                  <input
                    type="text"
                    value={editingCampaign.specialOfferFa}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, specialOfferFa: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Special Offer (English)</label>
                  <input
                    type="text"
                    value={editingCampaign.specialOfferEn}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, specialOfferEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'تصویر هدر کمپین' : 'Campaign Hero Image'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCampaign.heroImage}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, heroImage: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'آپلود تصویر' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleReadFileAsDataUrl(e.target.files?.[0], (dataUrl) =>
                          setEditingCampaign({ ...editingCampaign, heroImage: dataUrl })
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="campIsActive"
                  checked={editingCampaign.isActive}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#FD5202]"
                />
                <label htmlFor="campIsActive" className="text-slate-800 dark:text-white cursor-pointer font-semibold">
                  {isRtl ? 'کمپین فعال باشد و در وب‌سایت نمایش داده شود' : 'Campaign active & visible on website'}
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-blue-900 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveCampaign(editingCampaign)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isRtl ? 'ذخیره و انتشار کمپین' : 'Save Campaign'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Asset Upload Modal (with real File Upload + Preview) */}
      {isAddingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleAddAssetSubmit}
            className="w-full max-w-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#FD5202]" />
                <h3 className="font-bold text-base text-[#091A42] dark:text-white">
                  {isRtl ? 'آپلود و ثبت فایل هویت بصری' : 'Upload Brand Asset'}
                </h3>
              </div>
              <button type="button" onClick={() => setIsAddingAsset(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Real Local File Picker */}
              <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-[#060F26] text-center space-y-2">
                <Upload className="w-6 h-6 mx-auto text-[#144AE0] dark:text-[#A6D6FE]" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {isRtl ? 'انتخاب فایل لوگو، تصویر صنعتی یا PDF هویت برند از سیستم' : 'Choose an image or BrandBook PDF from your computer'}
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer">
                  <span>{isRtl ? 'انتخاب فایل...' : 'Browse File...'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleReadFileAsDataUrl(file, (dataUrl, f) => {
                        setNewAssetUrl(dataUrl);
                        setNewAssetFileSize(formatBytes(f.size));
                        setNewAssetFileType(
                          f.type === 'application/pdf' ? 'PDF Document' : `${f.type.replace('image/', '').toUpperCase()} Image`
                        );
                        if (!newAssetTitleFa) {
                          setNewAssetTitleFa(f.name.replace(/\.[^/.]+$/, ''));
                        }
                        if (!newAssetTitleEn) {
                          setNewAssetTitleEn(f.name.replace(/\.[^/.]+$/, ''));
                        }
                      });
                    }}
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'عنوان فایل (فارسی)' : 'Asset Title (Fa)'}</label>
                <input
                  type="text"
                  required
                  value={newAssetTitleFa}
                  onChange={(e) => setNewAssetTitleFa(e.target.value)}
                  placeholder="لوگوی اصلی RCG..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">Title (English)</label>
                <input
                  type="text"
                  value={newAssetTitleEn}
                  onChange={(e) => setNewAssetTitleEn(e.target.value)}
                  placeholder="Official RCG Brand Logo..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'دسته‌بندی فایل' : 'Category'}</label>
                  <select
                    value={newAssetCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setNewAssetCategory(e.target.value as BrandAsset['category'])
                    }
                    className={inputClass}
                  >
                    <option value="catalog">{isRtl ? 'کاتالوگ و مشخصات' : 'Catalog / Manual'}</option>
                    <option value="logo">{isRtl ? 'لوگو و آرم رسمی' : 'Official Logo'}</option>
                    <option value="brandbook">{isRtl ? 'سند هویت برند' : 'BrandBook'}</option>
                    <option value="photo">{isRtl ? 'تصاویر صنعتی' : 'Industrial Photo'}</option>
                    <option value="certificate">{isRtl ? 'گواهی نمایندگی' : 'Certificate'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'حجم فایل' : 'File Size'}</label>
                  <input
                    type="text"
                    value={newAssetFileSize}
                    onChange={(e) => setNewAssetFileSize(e.target.value)}
                    placeholder="2.4 MB"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{isRtl ? 'آدرس فایل (URL یا داده آپلودشده)' : 'File URL / Uploaded Data'}</label>
                <input
                  type="text"
                  required
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  placeholder="/assets/aistudio/..."
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-blue-900 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAsset(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                {isRtl ? 'ذخیره در کتابخانه' : 'Save Asset'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
