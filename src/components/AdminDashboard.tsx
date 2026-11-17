import React, { useState, useEffect } from 'react';
import {
  HeroSlide,
  Product,
  MediaItem,
  SharpeningOrder,
  SharpeningPricingConfig,
  DiscountCode,
  Inquiry,
  SiteSettings,
  Language,
  CampaignLanding,
  CampaignInquiry,
  BrandAsset,
  BrandAssetCategory,
  NavLinkItem,
  Department,
  SiteSectionsConfig,
} from '../types';
import { defaultSharpeningPricing } from '../data/initialData';
import { normalizeDiscountCodeKey } from '../services/firestoreSync';
import { translations } from '../utils/i18n';
import {
  ASSET_CATEGORIES,
  getAssetCategoryLabel,
  isImageAssetUrl,
  formatAssetBytes,
} from '../utils/assetCategories';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';
import { NavigationManager } from './NavigationManager';
import { RcgLogo } from './RcgLogo';
import { GalleryPickerModal } from './GalleryPickerModal';
import { GoogleBrandIcon } from './GoogleBrandIcon';
import { GmailWorkspacePanel, GmailComposeSeed } from './GmailWorkspacePanel';
import { useFirebase } from '../context/FirebaseContext';
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
  FolderOpen,
  CloudUpload,
  CheckSquare,
  Square,
  Tag,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Home,
  Calculator,
  Ticket,
  Percent,
  RefreshCw,
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
  | 'departments'
  | 'catalog'
  | 'sharpening'
  | 'inquiries'
  | 'gmail'
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
  departments: Department[];
  onUpdateDepartments: (depts: Department[]) => void;
  sectionsConfig: SiteSectionsConfig;
  onUpdateSectionsConfig: (config: SiteSectionsConfig) => void;
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
  onArchiveAsset: (asset: Omit<BrandAsset, 'id' | 'uploadedAt'>) => void;
  onPreviewCampaign: (campaign: CampaignLanding) => void;
  navLinks: NavLinkItem[];
  onUpdateNavLinks: (links: NavLinkItem[]) => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  discountCodes: DiscountCode[];
  onUpsertDiscountCode: (code: DiscountCode) => void;
  onDeleteDiscountCode: (codeId: string) => void;
  onOpenUiThemePicker?: () => void;
  onPublishAllToCloud?: () => Promise<void>;
  cloudSyncing?: boolean;
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
  departments,
  onUpdateDepartments,
  sectionsConfig,
  onUpdateSectionsConfig,
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
  onArchiveAsset,
  onPreviewCampaign,
  navLinks,
  onUpdateNavLinks,
  settings,
  onUpdateSettings,
  discountCodes,
  onUpsertDiscountCode,
  onDeleteDiscountCode,
  onOpenUiThemePicker,
  onPublishAllToCloud,
  cloudSyncing = false,
  onResetToDefaults,
}) => {
  const { user, isAdmin, gmailAccessToken, signInWithGoogle } = useFirebase();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [gmailComposeDraft, setGmailComposeDraft] = useState<GmailComposeSeed | null>(null);

  // Catalog filters & batch selection
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'all' | 'active' | 'hidden' | 'installment' | 'featured'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showProductBulkTagPanel, setShowProductBulkTagPanel] = useState(false);
  const [productBulkTagInput, setProductBulkTagInput] = useState('');
  const [productBulkTagMode, setProductBulkTagMode] = useState<'add' | 'remove' | 'clear'>('add');
  const [productBulkBadgeFa, setProductBulkBadgeFa] = useState('');
  const [productBulkBadgeEn, setProductBulkBadgeEn] = useState('');
  const [confirmBulkDeleteProducts, setConfirmBulkDeleteProducts] = useState(false);

  // Media filters & batch selection
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | MediaItem['type']>('all');
  const [mediaVisibilityFilter, setMediaVisibilityFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [showMediaBulkTagPanel, setShowMediaBulkTagPanel] = useState(false);
  const [mediaBulkTagInput, setMediaBulkTagInput] = useState('');
  const [mediaBulkTagMode, setMediaBulkTagMode] = useState<'add' | 'remove' | 'clear'>('add');
  const [confirmBulkDeleteMedia, setConfirmBulkDeleteMedia] = useState(false);

  // Campaign editing
  const [editingCampaign, setEditingCampaign] = useState<CampaignLanding | null>(null);
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [campaignInquiryFilter, setCampaignInquiryFilter] = useState<string>('all');

  // Departments & Section Photos tab
  const [activeDeptTabIdx, setActiveDeptTabIdx] = useState(0);

  // Brand Asset upload & Gallery archive filter state
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<BrandAssetCategory | 'all'>('all');
  const [assetSearch, setAssetSearch] = useState('');
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAssetTitleFa, setNewAssetTitleFa] = useState('');
  const [newAssetTitleEn, setNewAssetTitleEn] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<BrandAssetCategory>('catalog');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetFileSize, setNewAssetFileSize] = useState('');
  const [newAssetFileType, setNewAssetFileType] = useState('');

  // Shared Gallery Picker modal state
  const [galleryPicker, setGalleryPicker] = useState<{
    category: BrandAssetCategory | 'all';
    onPick: (url: string) => void;
  } | null>(null);

  // Editing modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  // Settings draft
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });
  const [settingsLogoMode, setSettingsLogoMode] = useState<'light' | 'dark'>('light');

  // Sharpening Pricing Config & Discount Codes state
  const [sharpeningSubTab, setSharpeningSubTab] = useState<'orders' | 'pricing' | 'discounts'>('orders');
  const [pricingDraft, setPricingDraft] = useState<SharpeningPricingConfig>({
    ...defaultSharpeningPricing,
    ...(settings.sharpeningPricing || {}),
    bladeTypeSurchargePercent: {
      ...defaultSharpeningPricing.bladeTypeSurchargePercent,
      ...(settings.sharpeningPricing?.bladeTypeSurchargePercent || {}),
    },
  });
  const [discountFilter, setDiscountFilter] = useState<'unused' | 'used' | 'all'>('unused');
  const [newCodeStr, setNewCodeStr] = useState('');
  const [newCodeType, setNewCodeType] = useState<'percent' | 'fixed'>('percent');
  const [newCodeValue, setNewCodeValue] = useState('15');
  const [newCodeNote, setNewCodeNote] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    setLocalSettings({ ...settings });
    setPricingDraft({
      ...defaultSharpeningPricing,
      ...(settings.sharpeningPricing || {}),
      bladeTypeSurchargePercent: {
        ...defaultSharpeningPricing.bladeTypeSurchargePercent,
        ...(settings.sharpeningPricing?.bladeTypeSurchargePercent || {}),
      },
    });
  }, [settings]);

  useEffect(() => {
    const validIds = new Set(products.map((p) => p.id));
    setSelectedProductIds((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [products]);

  useEffect(() => {
    const validIds = new Set(mediaItems.map((m) => m.id));
    setSelectedMediaIds((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [mediaItems]);

  useEffect(() => {
    if (selectedProductIds.length === 0) {
      setConfirmBulkDeleteProducts(false);
      setShowProductBulkTagPanel(false);
    }
  }, [selectedProductIds.length]);

  useEffect(() => {
    if (selectedMediaIds.length === 0) {
      setConfirmBulkDeleteMedia(false);
      setShowMediaBulkTagPanel(false);
    }
  }, [selectedMediaIds.length]);

  if (!isOpen) return null;

  const t = translations[language].admin;
  const isRtl = language === 'fa';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Shared Local File Reader + Auto-Archiving into Categorized Gallery ---
  const handleReadFileAsDataUrl = (
    file: File | undefined,
    onLoaded: (dataUrl: string, file: File) => void,
    archiveMeta?: { category: BrandAssetCategory; label: string }
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        onLoaded(dataUrl, file);
        if (archiveMeta) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          onArchiveAsset({
            titleFa: `${archiveMeta.label} — ${cleanName}`,
            titleEn: `${cleanName} (${archiveMeta.category})`,
            category: archiveMeta.category,
            url: dataUrl,
            fileSize: formatAssetBytes(file.size),
            fileType: file.type
              ? `${file.type.replace('image/', '').toUpperCase()} Image`
              : 'Uploaded Image',
          });
        }
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

  const parseBulkTags = (raw: string): string[] =>
    Array.from(
      new Set(
        raw
          .split(/[,\n،]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    ).slice(0, 12);

  const handleToggleSelectProduct = (prodId: string) => {
    setConfirmBulkDeleteProducts(false);
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleToggleSelectAllProducts = (filteredIds: string[]) => {
    setConfirmBulkDeleteProducts(false);
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      const removeSet = new Set(filteredIds);
      setSelectedProductIds((prev) => prev.filter((id) => !removeSet.has(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBulkProductVisibility = (visible: boolean) => {
    if (selectedProductIds.length === 0) return;
    const selectedSet = new Set(selectedProductIds);
    const updated = products.map((p) =>
      selectedSet.has(p.id) ? { ...p, isActive: visible } : p
    );
    onUpdateProducts(updated);
    showToast(
      isRtl
        ? `وضعیت نمایش ${selectedSet.size} دستگاه به «${visible ? 'نمایش در سایت' : 'مخفی'}» تغییر یافت`
        : `Updated visibility for ${selectedSet.size} machine(s) to ${visible ? 'Visible' : 'Hidden'}`
    );
  };

  const handleBulkDeleteProducts = () => {
    if (selectedProductIds.length === 0) return;
    const selectedSet = new Set(selectedProductIds);
    const updated = products.filter((p) => !selectedSet.has(p.id));
    onUpdateProducts(updated);
    setSelectedProductIds([]);
    setConfirmBulkDeleteProducts(false);
    showToast(
      isRtl
        ? `${selectedSet.size} دستگاه به‌صورت گروهی حذف شد`
        : `${selectedSet.size} machine(s) deleted`
    );
  };

  const handleBulkTagProducts = (presetTags?: string[]) => {
    if (selectedProductIds.length === 0) return;
    const selectedSet = new Set(selectedProductIds);
    const parsedTags = presetTags ?? parseBulkTags(productBulkTagInput);
    const hasBadgeUpdate =
      productBulkBadgeFa.trim().length > 0 || productBulkBadgeEn.trim().length > 0;

    if (productBulkTagMode !== 'clear' && parsedTags.length === 0 && !hasBadgeUpdate) {
      showToast(
        isRtl
          ? 'لطفاً حداقل یک برچسب یا نشان کارت وارد کنید'
          : 'Please enter at least one tag or badge label'
      );
      return;
    }

    const updated = products.map((p) => {
      if (!selectedSet.has(p.id)) return p;
      const existingTags = p.tags || [];
      let nextTags = existingTags;

      if (productBulkTagMode === 'clear') {
        nextTags = [];
      } else if (productBulkTagMode === 'remove') {
        const removeSet = new Set(parsedTags.map((t) => t.toLowerCase()));
        nextTags = existingTags.filter((t) => !removeSet.has(t.toLowerCase()));
      } else if (parsedTags.length > 0) {
        nextTags = Array.from(new Set([...existingTags, ...parsedTags])).slice(0, 12);
      }

      return {
        ...p,
        tags: nextTags,
        ...(productBulkBadgeFa.trim() ? { badgeFa: productBulkBadgeFa.trim() } : {}),
        ...(productBulkBadgeEn.trim() ? { badgeEn: productBulkBadgeEn.trim() } : {}),
      };
    });

    onUpdateProducts(updated);
    if (!presetTags) {
      setProductBulkTagInput('');
      setProductBulkBadgeFa('');
      setProductBulkBadgeEn('');
    }
    showToast(
      isRtl
        ? `برچسب‌های ${selectedSet.size} دستگاه با موفقیت به‌روزرسانی شد`
        : `Tags updated for ${selectedSet.size} machine(s)`
    );
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

  const handleToggleMediaActive = (mediaId: string) => {
    const updated = mediaItems.map((m) =>
      m.id === mediaId ? { ...m, isActive: m.isActive === false ? true : false } : m
    );
    onUpdateMediaItems(updated);
    showToast(isRtl ? 'وضعیت نمایش مطلب تغییر یافت' : 'Post visibility updated');
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

  const handleToggleSelectMedia = (mediaId: string) => {
    setConfirmBulkDeleteMedia(false);
    setSelectedMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const handleToggleSelectAllMedia = (filteredIds: string[]) => {
    setConfirmBulkDeleteMedia(false);
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedMediaIds.includes(id));
    if (allSelected) {
      const removeSet = new Set(filteredIds);
      setSelectedMediaIds((prev) => prev.filter((id) => !removeSet.has(id)));
    } else {
      setSelectedMediaIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBulkMediaVisibility = (visible: boolean) => {
    if (selectedMediaIds.length === 0) return;
    const selectedSet = new Set(selectedMediaIds);
    const updated = mediaItems.map((m) =>
      selectedSet.has(m.id) ? { ...m, isActive: visible } : m
    );
    onUpdateMediaItems(updated);
    showToast(
      isRtl
        ? `وضعیت انتشار ${selectedSet.size} مطلب به «${visible ? 'منتشر شده' : 'مخفی'}» تغییر یافت`
        : `Updated visibility for ${selectedSet.size} media item(s) to ${visible ? 'Visible' : 'Hidden'}`
    );
  };

  const handleBulkDeleteMedia = () => {
    if (selectedMediaIds.length === 0) return;
    const selectedSet = new Set(selectedMediaIds);
    const updated = mediaItems.filter((m) => !selectedSet.has(m.id));
    onUpdateMediaItems(updated);
    setSelectedMediaIds([]);
    setConfirmBulkDeleteMedia(false);
    showToast(
      isRtl
        ? `${selectedSet.size} مطلب به‌صورت گروهی حذف شد`
        : `${selectedSet.size} media item(s) deleted`
    );
  };

  const handleBulkTagMedia = (presetTags?: string[]) => {
    if (selectedMediaIds.length === 0) return;
    const selectedSet = new Set(selectedMediaIds);
    const parsedTags = presetTags ?? parseBulkTags(mediaBulkTagInput);

    if (mediaBulkTagMode !== 'clear' && parsedTags.length === 0) {
      showToast(
        isRtl ? 'لطفاً حداقل یک برچسب وارد کنید' : 'Please enter at least one tag'
      );
      return;
    }

    const updated = mediaItems.map((m) => {
      if (!selectedSet.has(m.id)) return m;
      const existingTags = m.tags || [];
      let nextTags = existingTags;

      if (mediaBulkTagMode === 'clear') {
        nextTags = [];
      } else if (mediaBulkTagMode === 'remove') {
        const removeSet = new Set(parsedTags.map((t) => t.toLowerCase()));
        nextTags = existingTags.filter((t) => !removeSet.has(t.toLowerCase()));
      } else {
        nextTags = Array.from(new Set([...existingTags, ...parsedTags])).slice(0, 12);
      }

      return { ...m, tags: nextTags };
    });

    onUpdateMediaItems(updated);
    if (!presetTags) {
      setMediaBulkTagInput('');
    }
    showToast(
      isRtl
        ? `برچسب‌های ${selectedSet.size} مطلب به‌روزرسانی شد`
        : `Tags updated for ${selectedSet.size} media item(s)`
    );
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
    'w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2 min-h-[40px] text-xs text-slate-900 dark:text-white focus:outline-none transition-colors';

  const cardClass =
    'bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 rounded-2xl shadow-sm';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-[#050C1F] text-slate-900 dark:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md justify-center bg-[#091A42] dark:bg-[#FD5202] text-white px-4 sm:px-6 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-white/15">
          <CheckCircle2 className="w-4 h-4 text-[#FD5202] dark:text-white shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-16 px-3 sm:px-6 bg-white dark:bg-[#091A42] border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between gap-2 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-[#091A42] dark:bg-[#FD5202] text-white shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-extrabold text-[#091A42] dark:text-white truncate">
              {t.panelTitle}
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-[#A6D6FE] truncate">
              {isRtl ? 'مدیریت آنلاین و دوزبانه کلیه بخش‌های وب‌سایت RCG' : 'Real-Time Bilingual CMS & Operations Console'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {isAdmin ? (
            onPublishAllToCloud && (
              <button
                onClick={async () => {
                  await onPublishAllToCloud();
                  showToast(isRtl ? 'کلیه تنظیمات با موفقیت در Firestore منتشر شد' : 'Published all data to Firestore');
                }}
                disabled={cloudSyncing}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer disabled:opacity-60"
                title={isRtl ? 'انتشار کامل و همگام‌سازی پایگاه داده ابری' : 'Publish & Sync All to Cloud'}
              >
                <CloudUpload className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">
                  {cloudSyncing
                    ? isRtl
                      ? 'در حال همگام‌سازی...'
                      : 'Syncing...'
                    : isRtl
                    ? 'همگام‌سازی ابری فعال'
                    : 'Cloud Sync'}
                </span>
              </button>
            )
          ) : (
            <button
              onClick={() => void signInWithGoogle()}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-[#091A42] dark:bg-blue-950 dark:text-white border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              title={
                user
                  ? isRtl
                    ? `کاربر فعلی (${user.email}) دسترسی ادمین کلود ندارد`
                    : `Signed in as ${user.email} (not admin)`
                  : isRtl
                  ? 'ورود با ایمیل مدیر کل جهت همگام‌سازی Firestore'
                  : 'Sign in as Admin for Cloud Sync'
              }
            >
              <GoogleBrandIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">
                {user
                  ? isRtl
                    ? 'تغییر به حساب ادمین'
                    : 'Switch to Admin'
                  : isRtl
                  ? 'اتصال ادمین گوگل'
                  : 'Admin Sign-In'}
              </span>
            </button>
          )}

          {onOpenUiThemePicker && (
            <button
              onClick={onOpenUiThemePicker}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 min-h-[38px] text-xs font-bold rounded-xl bg-blue-50 hover:bg-[#144AE0] text-[#144AE0] hover:text-white dark:bg-blue-950/70 dark:text-[#A6D6FE] dark:hover:bg-[#144AE0] dark:hover:text-white border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              title={isRtl ? 'انتخاب تم کلیدها و استایل رابط کاربری' : 'UI & Button Theme Studio'}
            >
              <Palette className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">
                {isRtl ? 'تم کلیدها' : 'UI Theme'}
              </span>
            </button>
          )}

          {onEnterPageEditMode && (
            <button
              onClick={onEnterPageEditMode}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 min-h-[38px] text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                isPageEditMode
                  ? 'bg-[#FD5202] border-[#FD5202] text-white'
                  : 'bg-orange-50 hover:bg-[#FD5202] text-[#FD5202] hover:text-white dark:bg-[#FD5202]/20 dark:hover:bg-[#FD5202] border-orange-200 dark:border-[#FD5202]/50'
              }`}
              title={isRtl ? 'فعال‌سازی حالت تنظیمات صفحه و ویرایش مستقیم روی سایت' : 'Enable Live Visual Page Edit Mode'}
            >
              <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">
                {isRtl ? 'تنظیمات صفحه' : 'Page Settings'}
              </span>
            </button>
          )}

          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-blue-950 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={t.resetDefaults}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">{t.resetDefaults}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 min-h-[38px] text-xs font-bold rounded-xl bg-[#091A42] hover:bg-[#FD5202] dark:bg-[#FD5202] dark:hover:bg-[#E04600] text-white transition-colors cursor-pointer shadow-sm"
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'بازگشت به سایت' : 'Back to Site'}</span>
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-60 lg:w-64 bg-white dark:bg-[#060F26] border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-blue-900/50 p-3.5 space-y-1 shrink-0 overflow-y-auto">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-between px-3.5 py-2.5 mb-2 text-xs font-extrabold rounded-xl bg-slate-100 hover:bg-[#FD5202] text-[#091A42] hover:text-white dark:bg-blue-950/70 dark:text-white dark:hover:bg-[#FD5202] border border-slate-200 dark:border-blue-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 shrink-0" />
              <span>{isRtl ? 'بازگشت به سایت اصلی' : 'Back to Website'}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

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

          <button onClick={() => setActiveTab('departments')} className={navBtnClass('departments')}>
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 shrink-0 text-[#144AE0] dark:text-[#A6D6FE]" />
              <span>{isRtl ? '۴ رکن و تصاویر بخش‌ها' : '4 Pillars & Photos'}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">
              {departments.length}
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

          <button onClick={() => setActiveTab('gmail')} className={navBtnClass('gmail')}>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0 text-[#FD5202]" />
              <span>{isRtl ? 'صندوق جیمیل' : 'Gmail Inbox'}</span>
            </div>
            {gmailAccessToken && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            )}
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

          {/* Visual Customization Shortcuts inside Admin Sidebar */}
          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-blue-900/50 space-y-1.5">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isRtl ? 'ابزارهای ظاهری و صفحه‌آرایی' : 'Visual & Page Controls'}
            </span>
            {onEnterPageEditMode && (
              <button
                onClick={onEnterPageEditMode}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl bg-orange-50/80 hover:bg-[#FD5202] text-[#FD5202] hover:text-white dark:bg-[#FD5202]/15 dark:hover:bg-[#FD5202] border border-orange-200/80 dark:border-[#FD5202]/40 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span>{isRtl ? 'تنظیمات صفحه (روی سایت)' : 'Page Settings Mode'}</span>
                </span>
              </button>
            )}
            {onOpenUiThemePicker && (
              <button
                onClick={onOpenUiThemePicker}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl bg-blue-50/80 hover:bg-[#144AE0] text-[#144AE0] hover:text-white dark:bg-blue-950/60 dark:text-[#A6D6FE] dark:hover:bg-[#144AE0] dark:hover:text-white border border-blue-200/80 dark:border-blue-800/60 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>{isRtl ? 'تم کلیدها و رابط کاربری' : 'UI & Button Themes'}</span>
                </span>
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Horizontal Tab Navigation Bar */}
        <nav className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 bg-white dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/50 shrink-0">
          {[
            { id: 'overview', label: t.tabOverview },
            { id: 'campaigns', label: t.tabCampaigns, count: campaigns.length, highlight: true },
            { id: 'departments', label: isRtl ? '۴ رکن' : '4 Pillars', count: departments.length },
            { id: 'catalog', label: t.tabCatalog, count: products.length },
            { id: 'sharpening', label: t.tabSharpening, count: sharpeningOrders.length },
            { id: 'inquiries', label: t.tabInquiries, count: inquiries.length + campaignInquiries.length },
            { id: 'gmail', label: isRtl ? 'جیمیل' : 'Gmail' },
            { id: 'media', label: t.tabMedia, count: mediaItems.length },
            { id: 'assets', label: t.tabAssets, count: brandAssets.length },
            { id: 'slides', label: t.tabSlides },
            { id: 'navigation', label: t.tabNavigation },
            { id: 'settings', label: t.tabSettings },
          ].map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`whitespace-nowrap shrink-0 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  active
                    ? item.highlight
                      ? 'bg-[#FD5202] text-white border-[#FD5202] shadow-xs'
                      : 'bg-[#144AE0] text-white border-[#144AE0] shadow-xs'
                    : 'bg-slate-50 dark:bg-blue-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900/50'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-blue-900/60'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Content Canvas */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto bg-slate-50 dark:bg-[#050C1F]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8 max-w-6xl">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabOverview}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'خلاصه آمار سامانه، نمودارهای عملکرد، سفارش‌های تیزکاری و سرنخ‌های کمپین' : 'Executive overview, KPI trends, orders, and leads'}
                </p>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={`${cardClass} p-3.5 sm:p-5 space-y-1.5 sm:space-y-2`}>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">{t.tabSharpening}</span>
                  <p className="text-xl sm:text-2xl font-black text-[#FD5202] font-mono tabular-nums">{sharpeningOrders.length}</p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {sharpeningOrders.filter((o) => o.status === 'new').length} {t.statusNew}
                  </p>
                </div>

                <div className={`${cardClass} p-3.5 sm:p-5 space-y-1.5 sm:space-y-2`}>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">{t.tabInquiries}</span>
                  <p className="text-xl sm:text-2xl font-black text-[#144AE0] dark:text-[#A6D6FE] font-mono tabular-nums">
                    {inquiries.length + campaignInquiries.length}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {inquiries.filter((i) => i.status === 'new').length + campaignInquiries.filter((ci) => ci.status === 'new').length} {t.statusNew}
                  </p>
                </div>

                <div className={`${cardClass} p-3.5 sm:p-5 space-y-1.5 sm:space-y-2`}>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">{t.tabCatalog}</span>
                  <p className="text-xl sm:text-2xl font-black text-[#091A42] dark:text-white font-mono tabular-nums">{products.length}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{isRtl ? 'دستگاه در کاتالوگ' : 'In catalog'}</p>
                </div>

                <div className={`${cardClass} p-3.5 sm:p-5 space-y-1.5 sm:space-y-2`}>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">{t.tabCampaigns}</span>
                  <p className="text-xl sm:text-2xl font-black text-[#091A42] dark:text-white font-mono tabular-nums">{campaigns.length}</p>
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

              {/* Recent Sharpening Orders Quick View */}
              <div className={`${cardClass} p-4 sm:p-6 space-y-4`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-[#091A42] dark:text-white flex items-center gap-2">
                    <PhosphorDisc weight="duotone" className="w-4 h-4 text-[#FD5202] shrink-0" />
                    <span>{isRtl ? 'جدیدترین سفارش‌های تیزکاری اره الماسه' : 'Recent Tool Sharpening Orders'}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('sharpening')}
                    className="text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE] hover:underline cursor-pointer shrink-0"
                  >
                    {isRtl ? 'مشاهده همه' : 'View All'}
                  </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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

                {/* Mobile Stacked Order Cards */}
                <div className="md:hidden space-y-2.5">
                  {sharpeningOrders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#FD5202]">#{order.id}</span>
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
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#091A42] dark:text-white">{order.customerName}</span>
                        <a href={`tel:${order.phone}`} className="font-mono text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">
                          {order.phone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <span>{order.bladeType} - {order.teethCount}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{order.estimatedPrice}</span>
                      </div>
                    </div>
                  ))}
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
                    className={`${cardClass} p-4 sm:p-6 hover:border-[#FD5202]/50 transition-all space-y-4`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <img
                          src={camp.heroImage}
                          alt=""
                          className="w-full sm:w-28 h-40 sm:h-28 rounded-xl object-cover border border-slate-200 dark:border-blue-800/50 shrink-0"
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

                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 tabular-nums">
                            <span className="text-[#FD5202] font-bold">{isRtl ? camp.specialOfferFa : camp.specialOfferEn}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="font-mono">{isRtl ? `بازدید: ${camp.viewsCount ?? 120}` : `Views: ${camp.viewsCount ?? 120}`}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                              {isRtl ? `ثبت‌نام‌ها: ${camp.conversionsCount ?? 18}` : `Leads: ${camp.conversionsCount ?? 18}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex flex-wrap sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <button
                          onClick={() => onPreviewCampaign(camp)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FD5202] to-[#E04600] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
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
              <div className={`${cardClass} p-4 sm:p-6 space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#091A42] dark:text-white flex items-center gap-2">
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
                      className="bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 rounded-lg px-2.5 py-1.5 min-h-[38px] text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="all">{isRtl ? 'همه درخواست‌ها' : 'All Leads'}</option>
                      <option value="new">{isRtl ? 'جدید' : 'New'}</option>
                      <option value="contacted">{isRtl ? 'تماس گرفته شد' : 'Contacted'}</option>
                      <option value="contracted">{isRtl ? 'عقد قرارداد' : 'Contracted'}</option>
                    </select>
                  </div>
                </div>

                {/* Desktop Leads Table */}
                <div className="hidden md:block overflow-x-auto">
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

                {/* Mobile Stacked Lead Cards */}
                <div className="md:hidden space-y-2.5">
                  {campaignInquiries
                    .filter((ci) => campaignInquiryFilter === 'all' || ci.status === campaignInquiryFilter)
                    .map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-[#091A42] dark:text-white">#{inq.id}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#144AE0] dark:text-[#A6D6FE] font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                            {inq.paymentPreference === 'installment'
                              ? isRtl ? 'اقساط' : 'Installments'
                              : inq.paymentPreference === 'cash'
                              ? isRtl ? 'نقدی' : 'Cash'
                              : isRtl ? 'تعویض' : 'Trade-in'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{inq.fullName}</span>
                          <a href={`tel:${inq.phone}`} className="font-mono text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">
                            {inq.phone}
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          {inq.city} ({inq.workshopType}) — <span className="font-semibold">{inq.campaignTitle}</span>
                        </div>
                        <div className="pt-1">
                          <select
                            value={inq.status}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              handleUpdateCampaignInquiryStatus(inq.id, e.target.value as CampaignInquiry['status'])
                            }
                            className="w-full px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-slate-800 dark:text-white focus:outline-none"
                          >
                            <option value="new">{isRtl ? 'جدید' : 'New'}</option>
                            <option value="contacted">{isRtl ? 'تماس گرفته شد' : 'Contacted'}</option>
                            <option value="contracted">{isRtl ? 'قرارداد / بازدید' : 'Contracted'}</option>
                            <option value="archived">{isRtl ? 'بایگانی' : 'Archived'}</option>
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FOUR PILLARS DEPARTMENTS & SECTION IMAGES */}
          {activeTab === 'departments' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#091A42] dark:text-white">
                  {isRtl ? 'مدیریت چهار رکن خدمات یکپارچه و تصاویر بخش‌ها' : '4 Service Pillars & Section Media Management'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl
                    ? 'ویرایش کامل ۴ کارت اصلی رکن‌ها، تصاویر ۳ کارت زیرمجموعه هر رکن، بنر انتهایی و تصاویر بخش‌های محاسبه‌گر و درباره آرسی'
                    : 'Customize all 4 service pillars, their 3 nested sub-card photos/titles, bottom callouts, and section photos.'}
                </p>
              </div>

              {/* Pillar Selector */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {departments.map((dept, idx) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setActiveDeptTabIdx(idx)}
                    className={`px-3.5 sm:px-4 py-2 min-h-[38px] whitespace-nowrap shrink-0 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      activeDeptTabIdx === idx
                        ? 'bg-[#144AE0] text-white border-[#144AE0] shadow-sm'
                        : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-blue-900'
                    }`}
                  >
                    0{idx + 1} · {isRtl ? dept.titleFa : dept.titleEn}
                  </button>
                ))}
              </div>

              {(() => {
                const currentDept = departments[activeDeptTabIdx] || departments[0];
                if (!currentDept) return null;

                const updateCurrentDept = (patch: Partial<Department>) => {
                  onUpdateDepartments(
                    departments.map((d, i) => (i === activeDeptTabIdx ? { ...d, ...patch } : d))
                  );
                };

                return (
                  <div className={`${cardClass} p-4 sm:p-6 space-y-5 sm:space-y-6`}>
                    {/* Live Header Preview strip of Pillar Card (showing synchronized RcgLogo) */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <RcgLogo
                        settings={localSettings}
                        isDark={isDark}
                        surface="auto"
                        heightScale={0.78}
                        showSubtitle={false}
                      />
                      <span className="text-[11px] font-bold text-[#144AE0] dark:text-[#A6D6FE]">
                        {isRtl
                          ? 'لوگوی این ۴ کارت به صورت خودکار با تنظیمات لوگوی سایت هماهنگ است'
                          : 'Pillar logo syncs automatically with global Light/Dark logo settings'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'عنوان رکن (فارسی)' : 'Pillar Title (Fa)'}
                        </label>
                        <input
                          type="text"
                          value={currentDept.titleFa}
                          onChange={(e) => updateCurrentDept({ titleFa: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'عنوان رکن (انگلیسی)' : 'Pillar Title (En)'}
                        </label>
                        <input
                          type="text"
                          value={currentDept.titleEn}
                          onChange={(e) => updateCurrentDept({ titleEn: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Main Department Banner Image */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                      <label className="text-xs font-bold text-[#091A42] dark:text-white block">
                        {isRtl ? 'تصویر اصلی کارت رکن' : 'Main Pillar Banner Image'}
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <img
                          src={currentDept.image}
                          alt=""
                          className="w-full sm:w-36 h-24 rounded-xl object-cover border border-slate-200 dark:border-blue-800 shrink-0"
                        />
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="text"
                            value={currentDept.image}
                            onChange={(e) => updateCurrentDept({ image: e.target.value })}
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'آپلود تصویر (بایگانی خودکار)' : 'Upload & Archive'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleReadFileAsDataUrl(
                                    e.target.files?.[0],
                                    (dataUrl) => updateCurrentDept({ image: dataUrl }),
                                    { category: 'departments', label: currentDept.titleFa }
                                  );
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryPicker({
                                  category: 'departments',
                                  onPick: (url) => updateCurrentDept({ image: url }),
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#091A42] border border-slate-300 dark:border-blue-800 text-xs font-bold cursor-pointer"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                              <span>{isRtl ? 'انتخاب از گالری' : 'Pick from Gallery'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Nested Sub-Cards Editor */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-[#144AE0] dark:text-[#A6D6FE]">
                        {isRtl ? 'زیرکارت‌های ۳گانه این رکن (تصویر و عنوان)' : '3 Nested Sub-Cards (Title & Photo)'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentDept.subCards.map((sc, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3"
                          >
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-blue-800">
                              <img
                                src={sc.image}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <input
                              type="text"
                              value={sc.titleFa}
                              onChange={(e) =>
                                updateCurrentDept({
                                  subCards: currentDept.subCards.map((c, ci) =>
                                    ci === sIdx ? { ...c, titleFa: e.target.value } : c
                                  ),
                                })
                              }
                              placeholder="عنوان فارسی زیرکارت..."
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={sc.titleEn}
                              onChange={(e) =>
                                updateCurrentDept({
                                  subCards: currentDept.subCards.map((c, ci) =>
                                    ci === sIdx ? { ...c, titleEn: e.target.value } : c
                                  ),
                                })
                              }
                              placeholder="English Title..."
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={sc.image}
                              onChange={(e) =>
                                updateCurrentDept({
                                  subCards: currentDept.subCards.map((c, ci) =>
                                    ci === sIdx ? { ...c, image: e.target.value } : c
                                  ),
                                })
                              }
                              className={`${inputClass} font-mono`}
                              dir="ltr"
                            />
                            <div className="flex items-center gap-1.5">
                              <label className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#144AE0] hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer">
                                <Upload className="w-3 h-3" />
                                <span>{isRtl ? 'آپلود' : 'Upload'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleReadFileAsDataUrl(
                                      e.target.files?.[0],
                                      (dataUrl) =>
                                        updateCurrentDept({
                                          subCards: currentDept.subCards.map((c, ci) =>
                                            ci === sIdx ? { ...c, image: dataUrl } : c
                                          ),
                                        }),
                                      { category: 'departments', label: sc.titleFa }
                                    );
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setGalleryPicker({
                                    category: 'departments',
                                    onPick: (url) =>
                                      updateCurrentDept({
                                        subCards: currentDept.subCards.map((c, ci) =>
                                          ci === sIdx ? { ...c, image: url } : c
                                        ),
                                      }),
                                  })
                                }
                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#091A42] border border-slate-300 dark:border-blue-800 text-[11px] font-bold cursor-pointer"
                              >
                                <FolderOpen className="w-3 h-3 text-[#FD5202]" />
                                <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Showcase Images (Calculator + About + Hero Backdrop) */}
                    <div className="pt-4 border-t border-slate-200 dark:border-blue-900/60 space-y-3">
                      <h4 className="text-xs font-black text-[#091A42] dark:text-white">
                        {isRtl
                          ? 'سایر تصاویر کلیدی بخش‌های سایت (محاسبه‌گر تیزکاری و درباره آرسی)'
                          : 'Other Site Section Showcase Images (Calculator & About)'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(['calculator', 'about'] as const).map((secKey) => (
                          <div
                            key={secKey}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-2.5"
                          >
                            <span className="text-xs font-bold block text-[#144AE0] dark:text-[#A6D6FE]">
                              {secKey === 'calculator'
                                ? isRtl
                                  ? 'تصویر بخش محاسبه‌گر تیزکاری'
                                  : 'Calculator Section Photo'
                                : isRtl
                                ? 'تصویر بخش درباره گروه صنعتی آرسی'
                                : 'About RCG Section Photo'}
                            </span>
                            <div className="flex items-center gap-3">
                              <img
                                src={sectionsConfig[secKey]?.image || ''}
                                alt=""
                                className="w-20 h-14 rounded-lg object-cover border border-slate-300 dark:border-blue-800 shrink-0"
                              />
                              <div className="flex-1 space-y-1.5">
                                <input
                                  type="text"
                                  value={sectionsConfig[secKey]?.image || ''}
                                  onChange={(e) =>
                                    onUpdateSectionsConfig({
                                      ...sectionsConfig,
                                      [secKey]: {
                                        ...sectionsConfig[secKey],
                                        image: e.target.value,
                                      },
                                    })
                                  }
                                  className={`${inputClass} font-mono`}
                                  dir="ltr"
                                />
                                <div className="flex items-center gap-1.5">
                                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#144AE0] text-white text-[11px] font-bold cursor-pointer">
                                    <Upload className="w-3 h-3" />
                                    <span>{isRtl ? 'آپلود' : 'Upload'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        handleReadFileAsDataUrl(
                                          e.target.files?.[0],
                                          (dataUrl) =>
                                            onUpdateSectionsConfig({
                                              ...sectionsConfig,
                                              [secKey]: {
                                                ...sectionsConfig[secKey],
                                                image: dataUrl,
                                              },
                                            }),
                                          {
                                            category: 'photo',
                                            label: secKey === 'calculator' ? 'تصویر بخش تیزکاری' : 'تصویر درباره آرسی',
                                          }
                                        );
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setGalleryPicker({
                                        category: 'photo',
                                        onPick: (url) =>
                                          onUpdateSectionsConfig({
                                            ...sectionsConfig,
                                            [secKey]: {
                                              ...sectionsConfig[secKey],
                                              image: url,
                                            },
                                          }),
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#091A42] border border-slate-300 dark:border-blue-800 text-[11px] font-bold cursor-pointer"
                                  >
                                    <FolderOpen className="w-3 h-3 text-[#FD5202]" />
                                    <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: BRAND ASSETS & CATEGORIZED GALLERY ARCHIVE */}
          {activeTab === 'assets' && (() => {
            const q = assetSearch.trim().toLowerCase();
            const filteredAssets = brandAssets.filter((a) => {
              const matchesCategory = assetCategoryFilter === 'all' || a.category === assetCategoryFilter;
              const matchesSearch =
                !q ||
                a.titleFa.toLowerCase().includes(q) ||
                a.titleEn.toLowerCase().includes(q) ||
                a.fileType.toLowerCase().includes(q);
              return matchesCategory && matchesSearch;
            });

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#144AE0] text-white">
                        <FolderDown className="w-5 h-5" />
                      </span>
                      <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">
                        {isRtl ? 'گالری دسته‌بندی‌شده و بایگانی هویت بصری برند' : t.tabAssets}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                      {isRtl
                        ? 'تمامی تصاویر آپلودشده در هر بخش سایت به صورت خودکار بر اساس دسته‌بندی در این گالری بایگانی و قابل انتخاب مجدد هستند'
                        : 'All uploaded logos, pillar cards, machinery, campaign banners, and PDFs are archived by category.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingAsset(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#144AE0] hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isRtl ? 'آپلود و ثبت در گالری' : 'Upload New Asset'}</span>
                  </button>
                </div>

                {/* Search + Category Filter Tabs */}
                <div className={`${cardClass} p-4 space-y-3`}>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 text-slate-400" />
                      <input
                        type="text"
                        value={assetSearch}
                        onChange={(e) => setAssetSearch(e.target.value)}
                        placeholder={isRtl ? 'جستجو در گالری تصاویر و فایل‌ها...' : 'Search gallery titles or file types...'}
                        className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/80 rounded-xl rtl:pr-9 ltr:pl-9 py-2 text-xs text-slate-900 dark:text-white focus:border-[#FD5202] focus:outline-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE] tabular-nums shrink-0">
                      {isRtl ? `${filteredAssets.length} فایل در دسترس` : `${filteredAssets.length} items`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setAssetCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer border ${
                        assetCategoryFilter === 'all'
                          ? 'bg-[#144AE0] text-white border-[#144AE0]'
                          : 'bg-slate-100 dark:bg-[#060F26] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                      }`}
                    >
                      {isRtl ? `همه دسته‌ها (${brandAssets.length})` : `All (${brandAssets.length})`}
                    </button>

                    {ASSET_CATEGORIES.map((cat) => {
                      const count = brandAssets.filter((a) => a.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAssetCategoryFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer border ${
                            assetCategoryFilter === cat.id
                              ? 'bg-[#FD5202] text-white border-[#FD5202]'
                              : 'bg-slate-100 dark:bg-[#060F26] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-900'
                          }`}
                        >
                          {isRtl ? cat.labelFa : cat.labelEn} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assets Grid */}
                {filteredAssets.length === 0 ? (
                  <div className={`${cardClass} p-10 text-center text-xs text-slate-500 dark:text-slate-400`}>
                    {isRtl ? 'هیچ تصویری در این دسته‌بندی یافت نشد.' : 'No assets found in this category.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAssets.map((asset) => {
                      const isImage = isImageAssetUrl(asset.url);

                      return (
                        <div
                          key={asset.id}
                          className={`${cardClass} p-5 hover:border-blue-400 dark:hover:border-blue-700/60 transition-all space-y-4 flex flex-col justify-between`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <select
                                value={asset.category}
                                onChange={(e) => {
                                  const nextCat = e.target.value as BrandAssetCategory;
                                  onUpdateBrandAssets(
                                    brandAssets.map((a) =>
                                      a.id === asset.id ? { ...a, category: nextCat } : a
                                    )
                                  );
                                  showToast(isRtl ? 'دسته‌بندی تصویر تغییر یافت' : 'Category updated');
                                }}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE] cursor-pointer focus:outline-none"
                              >
                                {ASSET_CATEGORIES.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {isRtl ? c.labelFa : c.labelEn}
                                  </option>
                                ))}
                              </select>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                                {asset.fileSize}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-[#091A42] dark:text-white leading-snug line-clamp-2">
                                {isRtl ? asset.titleFa : asset.titleEn}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                                {asset.fileType} · {asset.uploadedAt}
                              </p>
                            </div>

                            {isImage ? (
                              <div className="h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-blue-900/40">
                                <img src={asset.url} alt="" className="w-full h-full object-contain p-1.5" />
                              </div>
                            ) : (
                              <div className="h-36 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-blue-900/40 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
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
                              <span>{isRtl ? 'دانلود' : 'Download'}</span>
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
                )}
              </div>
            );
          })()}

          {/* TAB 4: SHARPENING ORDERS, PRICING FORMULA & DISCOUNT CODES */}
          {activeTab === 'sharpening' && (() => {
            const unusedCodes = discountCodes.filter((c) => !c.isUsed);
            const usedCodes = discountCodes.filter((c) => c.isUsed);
            const filteredCodes =
              discountFilter === 'unused'
                ? unusedCodes
                : discountFilter === 'used'
                ? usedCodes
                : discountCodes;

            const samplePerTooth = Number(pricingDraft.basePricePerTooth) || 0;
            const sampleSetup = Number(pricingDraft.fixedSetupFeePerBlade) || 0;
            const sampleTotal96Mdf = Math.round(
              (96 * samplePerTooth + sampleSetup) *
                (1 + (Number(pricingDraft.bladeTypeSurchargePercent.mdf) || 0) / 100)
            );

            const handleSavePricing = (e: React.FormEvent) => {
              e.preventDefault();
              const updatedSettings: SiteSettings = {
                ...settings,
                sharpeningPricing: pricingDraft,
              };
              setLocalSettings(updatedSettings);
              onUpdateSettings(updatedSettings);
              showToast(
                isRtl
                  ? 'تعرفه و فرمول محاسبه هزینه تیغ اره ذخیره و روی سایت اعمال شد'
                  : 'Sharpening pricing formula saved'
              );
            };

            const handleGenerateRandomCode = () => {
              const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
              let suffix = '';
              for (let i = 0; i < 6; i++) {
                suffix += chars[Math.floor(Math.random() * chars.length)];
              }
              setNewCodeStr(`RCG-${suffix}`);
            };

            const handleAddDiscountCode = (e: React.FormEvent) => {
              e.preventDefault();
              const cleanCode = normalizeDiscountCodeKey(newCodeStr);
              if (cleanCode.length < 2) {
                showToast(
                  isRtl
                    ? 'کد تخفیف باید حداقل ۲ کاراکتر انگلیسی یا عدد باشد'
                    : 'Code must be at least 2 alphanumeric chars'
                );
                return;
              }
              if (discountCodes.some((c) => normalizeDiscountCodeKey(c.code) === cleanCode)) {
                showToast(
                  isRtl
                    ? `کد «${cleanCode}» قبلاً در لیست ثبت شده است`
                    : `Code "${cleanCode}" already exists`
                );
                return;
              }
              const parsedVal = Math.round(Number(newCodeValue) || 0);
              if (parsedVal <= 0 || (newCodeType === 'percent' && parsedVal > 100)) {
                showToast(
                  isRtl
                    ? newCodeType === 'percent'
                      ? 'درصد تخفیف باید بین ۱ تا ۱۰۰ باشد'
                      : 'مبلغ تخفیف باید بزرگتر از صفر باشد'
                    : 'Enter a valid discount value'
                );
                return;
              }

              const created: DiscountCode = {
                id: cleanCode,
                code: cleanCode,
                discountType: newCodeType,
                discountValue: parsedVal,
                note: newCodeNote.trim() || undefined,
                isUsed: false,
                createdAt: new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
              };
              onUpsertDiscountCode(created);
              setNewCodeStr('');
              setNewCodeNote('');
              setDiscountFilter('unused');
              showToast(
                isRtl
                  ? `کد تخفیف استفاده نشده «${cleanCode}» ثبت شد`
                  : `Unused discount code "${cleanCode}" registered`
              );
            };

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-blue-900/40">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabSharpening}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isRtl
                        ? 'مدیریت سفارش‌ها، تنظیم فرمول تعرفه برآورد هزینه تیغ اره و ثبت کدهای تخفیف یک‌بارمصرف'
                        : 'Manage sharpening orders, configurable cost formula & single-use discount codes'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSharpeningSubTab('orders')}
                      className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                        sharpeningSubTab === 'orders'
                          ? 'bg-[#144AE0] text-white border-[#144AE0] shadow-xs'
                          : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-blue-800'
                      }`}
                    >
                      <PhosphorDisc weight="duotone" className="w-4 h-4" />
                      <span>{isRtl ? 'سفارش‌ها' : 'Orders'}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/15 tabular-nums">
                        {sharpeningOrders.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharpeningSubTab('pricing')}
                      className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                        sharpeningSubTab === 'pricing'
                          ? 'bg-[#FD5202] text-white border-[#FD5202] shadow-xs'
                          : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-blue-800'
                      }`}
                    >
                      <Calculator className="w-4 h-4" />
                      <span>{isRtl ? 'تنظیمات برآورد هزینه تیغ اره' : 'Pricing Formula'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharpeningSubTab('discounts')}
                      className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                        sharpeningSubTab === 'discounts'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-blue-800'
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{isRtl ? 'کدهای تخفیف' : 'Discount Codes'}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/15 tabular-nums">
                        {unusedCodes.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* SUB-TAB 1: SHARPENING ORDERS */}
                {sharpeningSubTab === 'orders' && (
                  <div className="space-y-4">
                    {sharpeningOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`${cardClass} p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#FD5202] bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
                              {order.id}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-[#091A42] dark:text-white">{order.customerName}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({order.city})</span>
                            <span className="text-xs text-slate-400 font-mono">· {order.createdAt}</span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                            <span className="font-mono text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">{isRtl ? 'تلفن:' : 'Phone:'} {order.phone}</span>
                            <span>{order.bladeType} ({order.diameter})</span>
                            <span>{order.teethCount}</span>
                            <span>{order.quantity} {isRtl ? 'عدد' : 'pcs'}</span>
                            {order.originalPrice && (
                              <span className="line-through text-slate-400 tabular-nums">{order.originalPrice}</span>
                            )}
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{order.estimatedPrice}</span>
                            {order.discountCode && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px]">
                                <Tag className="w-3 h-3" />
                                {order.discountCode}
                                {order.discountAmount ? ` (-${order.discountAmount})` : ''}
                              </span>
                            )}
                          </div>

                          {order.notes && (
                            <p className="text-xs text-amber-800 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 mt-1">
                              {order.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'new')}
                            className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              order.status === 'new'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t.statusNew}
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                            className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              order.status === 'in_progress'
                                ? 'bg-[#144AE0] text-white'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {t.statusInProgress}
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
                )}

                {/* SUB-TAB 2: CONFIGURABLE SHARPENING PRICING FORMULA */}
                {sharpeningSubTab === 'pricing' && (
                  <form onSubmit={handleSavePricing} className={`${cardClass} p-4 sm:p-6 space-y-6`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-blue-900/50 pb-4">
                      <div>
                        <h3 className="text-base font-black text-[#091A42] dark:text-white flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-[#FD5202]" />
                          <span>{isRtl ? 'تنظیم تعرفه و پارامترهای برآورد هزینه تیغ اره' : 'Saw Blade Sharpening Tariff Configuration'}</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {isRtl
                            ? 'تغییرات بلافاصله در محاسبه‌گر آنلاین صفحه اصلی اعمال می‌شوند.'
                            : 'Changes take effect immediately in the public online sharpening calculator.'}
                        </p>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs">
                        <span className="text-slate-500 dark:text-slate-300 block text-[10px]">
                          {isRtl ? 'نمونه برآورد فعلی (تیغ MDF 96 دندانه، استاندارد):' : 'Sample 96T MDF Standard:'}
                        </span>
                        <strong className="text-sm font-black text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">
                          {sampleTotal96Mdf.toLocaleString(isRtl ? 'fa-IR' : 'en-US')} {isRtl ? 'تومان' : 'Toman'}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'نرخ پایه هر دندانه (تومان)' : 'Base Price Per Tooth (Toman)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={pricingDraft.basePricePerTooth}
                          onChange={(e) =>
                            setPricingDraft({ ...pricingDraft, basePricePerTooth: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'هزینه ثابت هر تیغه (تومان)' : 'Fixed Setup Fee / Blade (Toman)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={pricingDraft.fixedSetupFeePerBlade}
                          onChange={(e) =>
                            setPricingDraft({ ...pricingDraft, fixedSetupFeePerBlade: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'مابه‌التفاوت تعویض دندانه (تومان/دندانه)' : 'Tooth Replacement Extra / Tooth'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={pricingDraft.teethRepairExtraPerTooth}
                          onChange={(e) =>
                            setPricingDraft({ ...pricingDraft, teethRepairExtraPerTooth: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className={`${inputClass} font-mono`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'مابه‌التفاوت بالانس و رفع تاب (تومان/دندانه)' : 'Balancing Extra / Tooth'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={pricingDraft.balanceExtraPerTooth}
                          onChange={(e) =>
                            setPricingDraft({ ...pricingDraft, balanceExtraPerTooth: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
                      <h4 className="text-xs font-extrabold text-[#091A42] dark:text-white">
                        {isRtl ? 'ضریب تغییر قیمت بر اساس نوع تیغ اره (درصد ٪)' : 'Blade Type Surcharge / Adjustment (%)'}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {isRtl ? 'ام‌دی‌اف و نئوپان (MDF)' : 'MDF / Laminated (%)'}
                          </label>
                          <input
                            type="number"
                            min={-50}
                            max={300}
                            value={pricingDraft.bladeTypeSurchargePercent.mdf}
                            onChange={(e) =>
                              setPricingDraft({
                                ...pricingDraft,
                                bladeTypeSurchargePercent: {
                                  ...pricingDraft.bladeTypeSurchargePercent,
                                  mdf: Number(e.target.value) || 0,
                                },
                              })
                            }
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {isRtl ? 'تیغ خط‌زن (Scoring)' : 'Scoring Blade (%)'}
                          </label>
                          <input
                            type="number"
                            min={-50}
                            max={300}
                            value={pricingDraft.bladeTypeSurchargePercent.scoring}
                            onChange={(e) =>
                              setPricingDraft({
                                ...pricingDraft,
                                bladeTypeSurchargePercent: {
                                  ...pricingDraft.bladeTypeSurchargePercent,
                                  scoring: Number(e.target.value) || 0,
                                },
                              })
                            }
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {isRtl ? 'چوب طبیعی (Solid Wood)' : 'Solid Wood (%)'}
                          </label>
                          <input
                            type="number"
                            min={-50}
                            max={300}
                            value={pricingDraft.bladeTypeSurchargePercent.solid}
                            onChange={(e) =>
                              setPricingDraft({
                                ...pricingDraft,
                                bladeTypeSurchargePercent: {
                                  ...pricingDraft.bladeTypeSurchargePercent,
                                  solid: Number(e.target.value) || 0,
                                },
                              })
                            }
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {isRtl ? 'آلومینیوم / کامپوزیت (Alu)' : 'Aluminum / Composite (%)'}
                          </label>
                          <input
                            type="number"
                            min={-50}
                            max={300}
                            value={pricingDraft.bladeTypeSurchargePercent.alu}
                            onChange={(e) =>
                              setPricingDraft({
                                ...pricingDraft,
                                bladeTypeSurchargePercent: {
                                  ...pricingDraft.bladeTypeSurchargePercent,
                                  alu: Number(e.target.value) || 0,
                                },
                              })
                            }
                            className={`${inputClass} font-mono`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'زمان تحویل تخمینی (فارسی)' : 'Estimated Turnaround (Fa)'}
                        </label>
                        <input
                          type="text"
                          value={pricingDraft.turnaroundFa}
                          onChange={(e) => setPricingDraft({ ...pricingDraft, turnaroundFa: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'زمان تحویل تخمینی (انگلیسی)' : 'Estimated Turnaround (En)'}
                        </label>
                        <input
                          type="text"
                          value={pricingDraft.turnaroundEn}
                          onChange={(e) => setPricingDraft({ ...pricingDraft, turnaroundEn: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'نرخ دلار نمایش انگلیسی (تومان)' : 'USD Display Rate (Toman)'}
                        </label>
                        <input
                          type="number"
                          min={10000}
                          value={pricingDraft.usdExchangeRate}
                          onChange={(e) =>
                            setPricingDraft({ ...pricingDraft, usdExchangeRate: Math.max(1000, Number(e.target.value) || 600000) })
                          }
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'یادداشت زیر مبلغ برآورد (فارسی)' : 'Pricing Footnote (Fa)'}
                        </label>
                        <input
                          type="text"
                          value={pricingDraft.pricingNoteFa}
                          onChange={(e) => setPricingDraft({ ...pricingDraft, pricingNoteFa: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isRtl ? 'یادداشت زیر مبلغ برآورد (انگلیسی)' : 'Pricing Footnote (En)'}
                        </label>
                        <input
                          type="text"
                          value={pricingDraft.pricingNoteEn}
                          onChange={(e) => setPricingDraft({ ...pricingDraft, pricingNoteEn: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-blue-900/50">
                      <button
                        type="button"
                        onClick={() => {
                          setPricingDraft(defaultSharpeningPricing);
                          showToast(isRtl ? 'فرمول تعرفه به مقادیر پیش‌فرض بازنشانی شد' : 'Formula reset to defaults');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'بازگردانی تعرفه پیش‌فرض' : 'Reset Default Tariff'}</span>
                      </button>

                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 min-h-[42px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isRtl ? 'ذخیره و اعمال تعرفه تیزکاری' : 'Save Sharpening Pricing'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* SUB-TAB 3: UNUSED / USED DISCOUNT CODES MANAGER */}
                {sharpeningSubTab === 'discounts' && (
                  <div className="space-y-6">
                    {/* Register New Unused Discount Code Form */}
                    <form onSubmit={handleAddDiscountCode} className={`${cardClass} p-4 sm:p-6 space-y-4`}>
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-blue-900/50 pb-3">
                        <div>
                          <h3 className="text-base font-black text-[#091A42] dark:text-white flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>{isRtl ? 'ثبت کد تخفیف استفاده نشده جدید' : 'Register New Unused Discount Code'}</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {isRtl
                              ? 'کدهای ثبت‌شده در این لیست پس از وارد شدن توسط مشتری در بخش برآورد هزینه تیغ اره بررسی و پس از تایید از مبلغ فاکتور کسر می‌شوند.'
                              : 'Registered unused codes are verified against this list when entered by customers and automatically deducted from sharpening totals.'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'کد تخفیف (حروف انگلیسی و عدد)' : 'Discount Code'}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newCodeStr}
                              onChange={(e) => setNewCodeStr(e.target.value.toUpperCase())}
                              dir="ltr"
                              placeholder="RCG-OFF25"
                              className={`${inputClass} font-mono uppercase`}
                            />
                            <button
                              type="button"
                              onClick={handleGenerateRandomCode}
                              className="px-2.5 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-xs font-bold cursor-pointer shrink-0"
                              title={isRtl ? 'تولید کد تصادفی' : 'Generate random code'}
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'نوع تخفیف' : 'Discount Type'}
                          </label>
                          <select
                            value={newCodeType}
                            onChange={(e) => setNewCodeType(e.target.value as 'percent' | 'fixed')}
                            className={inputClass}
                          >
                            <option value="percent">{isRtl ? 'درصدی (٪ از مبلغ کل)' : 'Percentage (%)'}</option>
                            <option value="fixed">{isRtl ? 'مبلغ ثابت (تومان)' : 'Fixed Amount (Toman)'}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {newCodeType === 'percent'
                              ? isRtl
                                ? 'میزان درصد تخفیف (۱ تا ۱۰۰)'
                                : 'Percentage (1-100)'
                              : isRtl
                              ? 'مبلغ تخفیف (تومان)'
                              : 'Amount (Toman)'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={newCodeType === 'percent' ? 100 : 1000000000}
                            value={newCodeValue}
                            onChange={(e) => setNewCodeValue(e.target.value)}
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'توضیحات / نام مشتری (اختیاری)' : 'Note / Recipient (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={newCodeNote}
                            onChange={(e) => setNewCodeNote(e.target.value)}
                            placeholder={isRtl ? 'مثال: ویژه کارگاه‌های عضو' : 'e.g. VIP workshop promo'}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isRtl ? 'ثبت در لیست کدهای استفاده نشده' : 'Add Unused Discount Code'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Discount Codes List & Status Filter */}
                    <div className={`${cardClass} p-4 sm:p-6 space-y-4`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-black text-[#091A42] dark:text-white">
                          {isRtl ? 'فهرست کدهای تخفیف ثبت‌شده در پنل مدیریت' : 'Registered Discount Codes'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDiscountFilter('unused')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              discountFilter === 'unused'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-blue-950 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isRtl ? `استفاده نشده (${unusedCodes.length})` : `Unused (${unusedCodes.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDiscountFilter('used')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              discountFilter === 'used'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 dark:bg-blue-950 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isRtl ? `استفاده شده (${usedCodes.length})` : `Used (${usedCodes.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDiscountFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              discountFilter === 'all'
                                ? 'bg-[#144AE0] text-white'
                                : 'bg-slate-100 dark:bg-blue-950 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isRtl ? `همه (${discountCodes.length})` : `All (${discountCodes.length})`}
                          </button>
                        </div>
                      </div>

                      {filteredCodes.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                          {isRtl
                            ? 'کد تخفیفی در این دسته وجود ندارد.'
                            : 'No discount codes found in this category.'}
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {filteredCodes.map((dc) => (
                            <div
                              key={dc.id}
                              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-[#091A42] dark:text-white tracking-wider">
                                    {dc.code}
                                  </span>

                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE] text-xs font-bold tabular-nums">
                                    {dc.discountType === 'percent' ? (
                                      <>
                                        <Percent className="w-3 h-3" />
                                        <span>
                                          {dc.discountValue.toLocaleString(isRtl ? 'fa-IR' : 'en-US')}٪ {isRtl ? 'تخفیف' : 'Off'}
                                        </span>
                                      </>
                                    ) : (
                                      <span>
                                        {dc.discountValue.toLocaleString(isRtl ? 'fa-IR' : 'en-US')} {isRtl ? 'تومان کسر مبلغ' : 'Toman Off'}
                                      </span>
                                    )}
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                      dc.isUsed
                                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    }`}
                                  >
                                    {dc.isUsed
                                      ? isRtl
                                        ? 'استفاده شده'
                                        : 'Used'
                                      : isRtl
                                      ? 'استفاده نشده (معتبر)'
                                      : 'Unused (Valid)'}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  {dc.note && <span>{dc.note}</span>}
                                  {dc.createdAt && (
                                    <span>
                                      {isRtl ? 'تاریخ ثبت:' : 'Created:'} {dc.createdAt}
                                    </span>
                                  )}
                                  {dc.isUsed && (dc.usedByName || dc.usedByOrderId) && (
                                    <span className="text-amber-700 dark:text-amber-300 font-semibold">
                                      {isRtl ? 'مصرف‌شده توسط:' : 'Redeemed by:'} {dc.usedByName || '-'}
                                      {dc.usedByOrderId ? ` (${dc.usedByOrderId})` : ''}
                                      {dc.usedAt ? ` · ${dc.usedAt}` : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void navigator.clipboard?.writeText(dc.code);
                                    showToast(isRtl ? `کد «${dc.code}» کپی شد` : `Copied ${dc.code}`);
                                  }}
                                  className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 hover:text-[#144AE0] cursor-pointer"
                                  title={isRtl ? 'کپی کد' : 'Copy Code'}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {dc.isUsed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpsertDiscountCode({
                                        ...dc,
                                        isUsed: false,
                                        usedByUid: undefined,
                                        usedByName: undefined,
                                        usedByOrderId: undefined,
                                        usedAt: undefined,
                                      });
                                      showToast(
                                        isRtl
                                          ? `کد «${dc.code}» مجدداً به لیست استفاده نشده بازگشت`
                                          : `Code "${dc.code}" reactivated`
                                      );
                                    }}
                                    className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold cursor-pointer"
                                  >
                                    {isRtl ? 'فعال‌سازی مجدد' : 'Reactivate'}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteDiscountCode(dc.id || dc.code);
                                    showToast(isRtl ? `کد «${dc.code}» حذف شد` : `Deleted ${dc.code}`);
                                  }}
                                  className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 cursor-pointer"
                                  title={isRtl ? 'حذف کد' : 'Delete Code'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 5: CLIENT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabInquiries}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl ? 'پیام‌های دریافتی و درخواست‌های مشاوره کارگاهی' : 'Client consultation messages and inquiries'}
                </p>
              </div>

              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className={`${cardClass} p-4 sm:p-5 space-y-3`}>
                    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
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

                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      <p className="font-bold text-[#144AE0] dark:text-[#A6D6FE] mb-1">{inq.subject}</p>
                      <p>{inq.message}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-blue-950">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'new')}
                          className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                            inq.status === 'new' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t.statusNew}
                        </button>
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'contacted')}
                          className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                            inq.status === 'contacted' ? 'bg-[#144AE0] text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isRtl ? 'تماس گرفته شد' : 'Contacted'}
                        </button>
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'resolved')}
                          className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                            inq.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isRtl ? 'پاسخ داده شد' : 'Resolved'}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGmailComposeDraft({
                              to: inq.email || '',
                              subject: isRtl ? `پاسخ: ${inq.subject}` : `Re: ${inq.subject}`,
                              body: isRtl
                                ? `سلام ${inq.name} گرامی،\n\nدر پاسخ به درخواست شما در دپارتمان «${inq.department}»:\n\n`
                                : `Dear ${inq.name},\n\nThank you for contacting RCG (${inq.department}) regarding "${inq.subject}".\n\n`,
                            });
                            setActiveTab('gmail');
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'پاسخ با جیمیل' : 'Reply via Gmail'}</span>
                        </button>

                        <a
                          href={`tel:${inq.phone}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'تماس تلفنی' : 'Call'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5B: GMAIL WORKSPACE */}
          {activeTab === 'gmail' && (
            <div className="space-y-4 max-w-6xl">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#091A42] dark:text-white">
                  {isRtl ? 'مدیریت صندوق جیمیل (Gmail)' : 'Gmail Mailbox & Client Correspondence'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRtl
                    ? 'خواندن پیام‌ها، جستجو، مدیریت برچسب‌ها و پاسخ مستقیم به مشتریان از طریق جیمیل'
                    : 'Read inbox messages, search threads, manage labels, and reply to inquiries directly via Gmail'}
                </p>
              </div>
              <GmailWorkspacePanel
                language={language}
                initialCompose={gmailComposeDraft}
                onClearInitialCompose={() => setGmailComposeDraft(null)}
              />
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

                  <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {(['all', 'active', 'hidden', 'installment', 'featured'] as const).map((statusKey) => (
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
                          : statusKey === 'hidden'
                          ? isRtl ? 'مخفی' : 'Hidden'
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

              {/* Filtered Products + Batch Selection Bar */}
              {(() => {
                const searchLower = catalogSearch.toLowerCase().trim();
                const filtered = products.filter((prod) => {
                  const matchesSearch =
                    !searchLower ||
                    prod.titleFa.toLowerCase().includes(searchLower) ||
                    prod.titleEn.toLowerCase().includes(searchLower) ||
                    prod.brand.toLowerCase().includes(searchLower) ||
                    prod.model.toLowerCase().includes(searchLower) ||
                    (prod.tags || []).some((tag) => tag.toLowerCase().includes(searchLower));
                  const matchesCategory = catalogCategoryFilter === 'all' || prod.category === catalogCategoryFilter;
                  const matchesStatus =
                    catalogStatusFilter === 'all' ||
                    (catalogStatusFilter === 'active' && prod.isActive !== false) ||
                    (catalogStatusFilter === 'hidden' && prod.isActive === false) ||
                    (catalogStatusFilter === 'installment' && prod.installmentAvailable) ||
                    (catalogStatusFilter === 'featured' && prod.featuredPoster);
                  return matchesSearch && matchesCategory && matchesStatus;
                });

                const filteredIds = filtered.map((p) => p.id);
                const allFilteredSelected =
                  filteredIds.length > 0 && filteredIds.every((id) => selectedProductIds.includes(id));

                const quickProductTags = isRtl
                  ? ['پرفروش', 'اقساط ویژه', 'نصب رایگان', 'گارانتی رسمی', 'ارسال فوری', 'اورهال‌شده']
                  : ['Best Seller', 'Special Terms', 'Free Setup', 'Official Warranty', 'Fast Delivery', 'Rebuilt'];

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
                  <div className="space-y-4">
                    {/* Selection Bar */}
                    <div className={`${cardClass} px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectAllProducts(filteredIds)}
                          className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-[#060F26] dark:hover:bg-blue-950 border border-slate-200 dark:border-blue-800 text-xs font-bold text-[#091A42] dark:text-white cursor-pointer"
                        >
                          {allFilteredSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#FD5202]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                          <span>
                            {allFilteredSelected
                              ? isRtl ? 'لغو انتخاب لیست فعلی' : 'Deselect Visible'
                              : isRtl ? `انتخاب همه (${filtered.length})` : `Select All (${filtered.length})`}
                          </span>
                        </button>

                        {selectedProductIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedProductIds([])}
                            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'پاک کردن انتخاب' : 'Clear'}</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                          {isRtl ? `${filtered.length} دستگاه نمایش داده شده` : `${filtered.length} showing`}
                        </span>
                        {selectedProductIds.length > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-[#FD5202] text-white font-bold tabular-nums">
                            {isRtl ? `${selectedProductIds.length} مورد انتخاب‌شده` : `${selectedProductIds.length} selected`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sticky Bulk Action Toolbar */}
                    {selectedProductIds.length > 0 && (
                      <div className="sticky top-2 z-20 rounded-2xl bg-[#091A42] dark:bg-[#0D2150] text-white border border-blue-500/40 shadow-xl p-3.5 sm:p-4 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[#FD5202] flex items-center justify-center font-mono text-xs font-extrabold tabular-nums shrink-0">
                              {selectedProductIds.length}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-extrabold">
                                {isRtl ? 'عملیات گروهی روی دستگاه‌های انتخاب‌شده' : 'Bulk Actions on Selected Machines'}
                              </p>
                              <p className="text-[11px] text-[#A6D6FE]">
                                {isRtl
                                  ? 'تغییر وضعیت نمایش، برچسب‌گذاری یا حذف یکجای موارد انتخاب‌شده'
                                  : 'Update visibility, apply tags, or delete selected items in one batch'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleBulkProductVisibility(true)}
                              className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'نمایش در سایت' : 'Show'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBulkProductVisibility(false)}
                              className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'مخفی‌سازی' : 'Hide'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowProductBulkTagPanel((v) => !v)}
                              className={`flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold cursor-pointer border ${
                                showProductBulkTagPanel
                                  ? 'bg-[#144AE0] border-blue-400 text-white'
                                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                              }`}
                            >
                              <Tag className="w-3.5 h-3.5 text-[#FD5202]" />
                              <span>{isRtl ? 'برچسب‌گذاری گروهی' : 'Bulk Tag'}</span>
                            </button>

                            {!confirmBulkDeleteProducts ? (
                              <button
                                type="button"
                                onClick={() => setConfirmBulkDeleteProducts(true)}
                                className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'حذف گروهی' : 'Delete'}</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/60 px-2.5 py-1 rounded-xl">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <button
                                  type="button"
                                  onClick={handleBulkDeleteProducts}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                                >
                                  {isRtl ? `تایید حذف (${selectedProductIds.length})` : `Confirm (${selectedProductIds.length})`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmBulkDeleteProducts(false)}
                                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs cursor-pointer"
                                >
                                  {isRtl ? 'انصراف' : 'Cancel'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expandable Bulk Tag Panel */}
                        {showProductBulkTagPanel && (
                          <div className="pt-3 border-t border-white/15 space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {(['add', 'remove', 'clear'] as const).map((mode) => (
                                  <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setProductBulkTagMode(mode)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                                      productBulkTagMode === mode
                                        ? 'bg-[#FD5202] text-white'
                                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                                    }`}
                                  >
                                    {mode === 'add'
                                      ? isRtl ? 'افزودن برچسب' : 'Add Tags'
                                      : mode === 'remove'
                                      ? isRtl ? 'حذف برچسب مشخص' : 'Remove Tag(s)'
                                      : isRtl ? 'پاک‌سازی همه برچسب‌ها' : 'Clear All Tags'}
                                  </button>
                                ))}
                              </div>

                              <span className="text-[11px] text-[#A6D6FE]">
                                {isRtl ? 'برچسب‌های متعدد را با ویرگول (،) جدا کنید' : 'Separate multiple tags with commas'}
                              </span>
                            </div>

                            {productBulkTagMode !== 'clear' && (
                              <>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] text-slate-300 font-semibold">
                                    {isRtl ? 'برچسب‌های پیشنهادی:' : 'Quick presets:'}
                                  </span>
                                  {quickProductTags.map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => handleBulkTagProducts([preset])}
                                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#144AE0] text-[11px] font-semibold border border-white/15 cursor-pointer transition-colors"
                                    >
                                      {productBulkTagMode === 'remove' ? '−' : '+'} {preset}
                                    </button>
                                  ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    value={productBulkTagInput}
                                    onChange={(e) => setProductBulkTagInput(e.target.value)}
                                    placeholder={isRtl ? 'مثلاً: پرفروش، اقساط ویژه...' : 'e.g. Best Seller, Featured...'}
                                    className="sm:col-span-1 bg-[#060F26] border border-blue-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FD5202] focus:outline-none"
                                  />
                                  {productBulkTagMode === 'add' && (
                                    <>
                                      <input
                                        type="text"
                                        value={productBulkBadgeFa}
                                        onChange={(e) => setProductBulkBadgeFa(e.target.value)}
                                        placeholder={isRtl ? 'نشان کارت فارسی (اختیاری)' : 'Badge Fa (optional)'}
                                        className="bg-[#060F26] border border-blue-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FD5202] focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={productBulkBadgeEn}
                                        onChange={(e) => setProductBulkBadgeEn(e.target.value)}
                                        placeholder={isRtl ? 'Badge English (اختیاری)' : 'Card Badge En (optional)'}
                                        className="bg-[#060F26] border border-blue-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FD5202] focus:outline-none"
                                        dir="ltr"
                                      />
                                    </>
                                  )}
                                </div>
                              </>
                            )}

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleBulkTagProducts()}
                                className="flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>
                                  {productBulkTagMode === 'clear'
                                    ? isRtl ? 'پاک کردن همه برچسب‌های انتخاب‌شده' : 'Clear Tags on Selected'
                                    : productBulkTagMode === 'remove'
                                    ? isRtl ? 'حذف برچسب‌های واردشده' : 'Remove Entered Tags'
                                    : isRtl ? 'اعمال برچسب و نشان روی موارد انتخاب‌شده' : 'Apply Tags to Selected'}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtered.map((prod) => {
                        const isActive = prod.isActive !== false;
                        const isFeatured = !!prod.featuredPoster;
                        const isSelected = selectedProductIds.includes(prod.id);
                        const precision = prod.precisionRating ?? 98;
                        const durability = prod.durabilityRating ?? 97;
                        const efficiency = prod.efficiencyRating ?? 95;

                        return (
                          <div
                            key={prod.id}
                            className={`${cardClass} p-4 sm:p-5 space-y-4 transition-all ${
                              isSelected
                                ? 'ring-2 ring-[#FD5202] border-[#FD5202] bg-orange-50/30 dark:bg-[#0D2150]'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-3 sm:gap-4">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectProduct(prod.id)}
                                aria-pressed={isSelected}
                                title={isRtl ? 'انتخاب دستگاه برای عملیات گروهی' : 'Select machine for batch action'}
                                className={`mt-1 w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#FD5202] border-[#FD5202] text-white'
                                    : 'bg-slate-50 dark:bg-[#060F26] border-slate-300 dark:border-blue-800 text-slate-400 hover:border-[#FD5202]'
                                }`}
                              >
                                {isSelected ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </button>

                              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200 dark:border-blue-900/40">
                                <img src={prod.image} alt={prod.titleFa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <span
                                  className={`absolute top-1.5 rtl:right-1.5 ltr:left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                                  }`}
                                >
                                  {isActive ? (isRtl ? 'فعال' : 'Active') : (isRtl ? 'مخفی' : 'Hidden')}
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
                                  {(isRtl ? prod.badgeFa : prod.badgeEn) && (
                                    <span className="text-[10px] font-bold text-[#FD5202] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900/50">
                                      {isRtl ? prod.badgeFa : prod.badgeEn}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-sm text-[#091A42] dark:text-white truncate">
                                  {isRtl ? prod.titleFa : prod.titleEn}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-300">{prod.brand}</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                                  {isRtl ? prod.priceFa : prod.priceEn}
                                </p>

                                {prod.tags && prod.tags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1 pt-1">
                                    {prod.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800 text-[10px] font-semibold text-[#144AE0] dark:text-[#A6D6FE]"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
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
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 7: MEDIA & ARTICLES */}
          {activeTab === 'media' && (() => {
            const mediaSearchLower = mediaSearch.toLowerCase().trim();
            const filteredMedia = mediaItems.filter((item) => {
              const matchesSearch =
                !mediaSearchLower ||
                item.titleFa.toLowerCase().includes(mediaSearchLower) ||
                item.titleEn.toLowerCase().includes(mediaSearchLower) ||
                item.summaryFa.toLowerCase().includes(mediaSearchLower) ||
                item.summaryEn.toLowerCase().includes(mediaSearchLower) ||
                (item.tags || []).some((tag) => tag.toLowerCase().includes(mediaSearchLower));
              const matchesType = mediaTypeFilter === 'all' || item.type === mediaTypeFilter;
              const isItemVisible = item.isActive !== false;
              const matchesVis =
                mediaVisibilityFilter === 'all' ||
                (mediaVisibilityFilter === 'active' && isItemVisible) ||
                (mediaVisibilityFilter === 'hidden' && !isItemVisible);
              return matchesSearch && matchesType && matchesVis;
            });

            const filteredMediaIds = filteredMedia.map((m) => m.id);
            const allFilteredMediaSelected =
              filteredMediaIds.length > 0 && filteredMediaIds.every((id) => selectedMediaIds.includes(id));

            const quickMediaTags = isRtl
              ? ['مقاله فنی', 'نگهداری و سرویس', 'اخبار پایون', 'پروژه کارگاهی', 'آموزش اپراتور']
              : ['Technical Guide', 'Maintenance', 'Payon News', 'Case Study', 'Operator Training'];

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        isActive: true,
                        tags: [],
                      });
                      setIsAddingMedia(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addNew}</span>
                  </button>
                </div>

                {/* Search & Filters */}
                <div className={`${cardClass} p-4 space-y-3`}>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 text-slate-400" />
                      <input
                        type="text"
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        placeholder={isRtl ? 'جستجوی عنوان، خلاصه یا برچسب مطلب...' : 'Search by title, summary, or tag...'}
                        className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/80 rounded-xl rtl:pr-9 ltr:pl-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#FD5202] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                      {(['all', 'active', 'hidden'] as const).map((visKey) => (
                        <button
                          key={visKey}
                          type="button"
                          onClick={() => setMediaVisibilityFilter(visKey)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                            mediaVisibilityFilter === visKey
                              ? 'bg-[#144AE0] text-white'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {visKey === 'all'
                            ? isRtl ? 'همه وضعیت‌ها' : 'All Status'
                            : visKey === 'active'
                            ? isRtl ? 'منتشر شده' : 'Published'
                            : isRtl ? 'مخفی' : 'Hidden'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    {[
                      { id: 'all', label: isRtl ? 'همه مطالب' : 'All Types' },
                      { id: 'article', label: isRtl ? 'مقاله فنی' : 'Articles' },
                      { id: 'news', label: isRtl ? 'اخبار' : 'News' },
                      { id: 'project', label: isRtl ? 'پروژه‌ها' : 'Projects' },
                    ].map((mt) => (
                      <button
                        key={mt.id}
                        type="button"
                        onClick={() => setMediaTypeFilter(mt.id as 'all' | MediaItem['type'])}
                        className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                          mediaTypeFilter === mt.id
                            ? 'bg-[#091A42] dark:bg-blue-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {mt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selection Bar */}
                {filteredMedia.length > 0 && (
                  <div className={`${cardClass} px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAllMedia(filteredMediaIds)}
                        className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-[#060F26] dark:hover:bg-blue-950 border border-slate-200 dark:border-blue-800 text-xs font-bold text-[#091A42] dark:text-white cursor-pointer"
                      >
                        {allFilteredMediaSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#FD5202]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>
                          {allFilteredMediaSelected
                            ? isRtl ? 'لغو انتخاب لیست فعلی' : 'Deselect Visible'
                            : isRtl ? `انتخاب همه (${filteredMedia.length})` : `Select All (${filteredMedia.length})`}
                        </span>
                      </button>

                      {selectedMediaIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedMediaIds([])}
                          className="flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'پاک کردن انتخاب' : 'Clear'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {isRtl ? `${filteredMedia.length} مطلب` : `${filteredMedia.length} items`}
                      </span>
                      {selectedMediaIds.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#FD5202] text-white font-bold tabular-nums">
                          {isRtl ? `${selectedMediaIds.length} مورد انتخاب‌شده` : `${selectedMediaIds.length} selected`}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Sticky Bulk Action Toolbar for Media */}
                {selectedMediaIds.length > 0 && (
                  <div className="sticky top-2 z-20 rounded-2xl bg-[#091A42] dark:bg-[#0D2150] text-white border border-blue-500/40 shadow-xl p-3.5 sm:p-4 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#FD5202] flex items-center justify-center font-mono text-xs font-extrabold tabular-nums shrink-0">
                          {selectedMediaIds.length}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold">
                            {isRtl ? 'عملیات گروهی روی مطالب و رسانه‌ها' : 'Bulk Actions on Selected Media'}
                          </p>
                          <p className="text-[11px] text-[#A6D6FE]">
                            {isRtl
                              ? 'تغییر وضعیت انتشار، برچسب‌گذاری یا حذف گروهی موارد انتخاب‌شده'
                              : 'Publish/hide, apply tags, or delete selected media items in batch'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBulkMediaVisibility(true)}
                          className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'انتشار / نمایش' : 'Publish'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkMediaVisibility(false)}
                          className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'عدم نمایش (مخفی)' : 'Hide'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowMediaBulkTagPanel((v) => !v)}
                          className={`flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold cursor-pointer border ${
                            showMediaBulkTagPanel
                              ? 'bg-[#144AE0] border-blue-400 text-white'
                              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5 text-[#FD5202]" />
                          <span>{isRtl ? 'برچسب‌گذاری گروهی' : 'Bulk Tag'}</span>
                        </button>

                        {!confirmBulkDeleteMedia ? (
                          <button
                            type="button"
                            onClick={() => setConfirmBulkDeleteMedia(true)}
                            className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'حذف گروهی' : 'Delete'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/60 px-2.5 py-1 rounded-xl">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <button
                              type="button"
                              onClick={handleBulkDeleteMedia}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                            >
                              {isRtl ? `تایید حذف (${selectedMediaIds.length})` : `Confirm (${selectedMediaIds.length})`}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmBulkDeleteMedia(false)}
                              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs cursor-pointer"
                            >
                              {isRtl ? 'انصراف' : 'Cancel'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {showMediaBulkTagPanel && (
                      <div className="pt-3 border-t border-white/15 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {(['add', 'remove', 'clear'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setMediaBulkTagMode(mode)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                                  mediaBulkTagMode === mode
                                    ? 'bg-[#FD5202] text-white'
                                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                                }`}
                              >
                                {mode === 'add'
                                  ? isRtl ? 'افزودن برچسب' : 'Add Tags'
                                  : mode === 'remove'
                                  ? isRtl ? 'حذف برچسب مشخص' : 'Remove Tag(s)'
                                  : isRtl ? 'پاک‌سازی همه برچسب‌ها' : 'Clear All Tags'}
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] text-[#A6D6FE]">
                            {isRtl ? 'برچسب‌های متعدد را با ویرگول (،) جدا کنید' : 'Separate multiple tags with commas'}
                          </span>
                        </div>

                        {mediaBulkTagMode !== 'clear' && (
                          <>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] text-slate-300 font-semibold">
                                {isRtl ? 'برچسب‌های پیشنهادی:' : 'Quick presets:'}
                              </span>
                              {quickMediaTags.map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleBulkTagMedia([preset])}
                                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#144AE0] text-[11px] font-semibold border border-white/15 cursor-pointer transition-colors"
                                >
                                  {mediaBulkTagMode === 'remove' ? '−' : '+'} {preset}
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              value={mediaBulkTagInput}
                              onChange={(e) => setMediaBulkTagInput(e.target.value)}
                              placeholder={isRtl ? 'مثلاً: راهنمای فنی، سرویس و نگهداری...' : 'e.g. Technical Guide, Maintenance...'}
                              className="w-full bg-[#060F26] border border-blue-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-[#FD5202] focus:outline-none"
                            />
                          </>
                        )}

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleBulkTagMedia()}
                            className="flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {mediaBulkTagMode === 'clear'
                                ? isRtl ? 'پاک کردن همه برچسب‌های انتخاب‌شده' : 'Clear Tags on Selected'
                                : mediaBulkTagMode === 'remove'
                                ? isRtl ? 'حذف برچسب‌های واردشده' : 'Remove Entered Tags'
                                : isRtl ? 'اعمال برچسب روی مطالب انتخاب‌شده' : 'Apply Tags to Selected'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {filteredMedia.length === 0 ? (
                  <div className={`${cardClass} p-12 text-center space-y-3`}>
                    <FileText className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="text-sm font-bold text-[#091A42] dark:text-white">
                      {isRtl ? 'مطلبی با این فیلترها یافت نشد' : 'No media items matched your filters'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMedia.map((item) => {
                      const isVisible = item.isActive !== false;
                      const isSelected = selectedMediaIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`${cardClass} p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 transition-all ${
                            isSelected
                              ? 'ring-2 ring-[#FD5202] border-[#FD5202] bg-orange-50/30 dark:bg-[#0D2150]'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectMedia(item.id)}
                              aria-pressed={isSelected}
                              title={isRtl ? 'انتخاب مطلب برای عملیات گروهی' : 'Select media item for batch action'}
                              className={`mt-1 w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FD5202] border-[#FD5202] text-white'
                                  : 'bg-slate-50 dark:bg-[#060F26] border-slate-300 dark:border-blue-800 text-slate-400 hover:border-[#FD5202]'
                              }`}
                            >
                              {isSelected ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </button>

                            <div className="relative flex-1 sm:flex-none sm:w-28 h-36 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-blue-900/40">
                              <img
                                src={item.image}
                                alt={item.titleFa}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span
                                className={`absolute top-1.5 rtl:right-1.5 ltr:left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isVisible ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                                }`}
                              >
                                {isVisible ? (isRtl ? 'منتشر' : 'Live') : (isRtl ? 'مخفی' : 'Hidden')}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-1.5 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-[#FD5202] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded">
                                {isRtl ? item.typeFa : item.typeEn}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? item.dateFa : item.dateEn}</span>
                            </div>
                            <h4 className="font-bold text-sm text-[#091A42] dark:text-white">{isRtl ? item.titleFa : item.titleEn}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{isRtl ? item.summaryFa : item.summaryEn}</p>

                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800 text-[10px] font-semibold text-[#144AE0] dark:text-[#A6D6FE]"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => handleToggleMediaActive(item.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                {isVisible ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                                <span className="text-[11px]">{isVisible ? (isRtl ? 'نمایش' : 'Visible') : (isRtl ? 'مخفی' : 'Hidden')}</span>
                              </button>
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
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

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
                          {isRtl ? 'تصویر اسلاید (آدرس، آپلود یا گالری)' : 'Slide Image'}
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
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
                              onChange={(e) => {
                                handleReadFileAsDataUrl(
                                  e.target.files?.[0],
                                  (dataUrl) =>
                                    onUpdateSlides(
                                      heroSlides.map((s) => (s.id === slide.id ? { ...s, image: dataUrl } : s))
                                    ),
                                  { category: 'hero', label: `اسلاید ${idx + 1}` }
                                );
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setGalleryPicker({
                                category: 'hero',
                                onPick: (url) =>
                                  onUpdateSlides(
                                    heroSlides.map((s) => (s.id === slide.id ? { ...s, image: url } : s))
                                  ),
                              })
                            }
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-xs font-bold cursor-pointer shrink-0"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                            <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                          </button>
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#091A42] dark:text-white">{t.tabSettings}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl ? 'تنظیمات لوگوی هدر، تم کلیدها، رنگ‌بندی برند، شماره تماس‌ها و لینک‌های اجتماعی' : 'Customize header logo, button themes, brand colors, contact info & social links'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onEnterPageEditMode && (
                    <button
                      type="button"
                      onClick={onEnterPageEditMode}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-[#144AE0] text-[#144AE0] hover:text-white dark:bg-blue-950/70 dark:text-[#A6D6FE] dark:hover:bg-[#144AE0] dark:hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>{isRtl ? 'تنظیمات صفحه (ویرایش روی سایت)' : 'Page Settings Mode'}</span>
                    </button>
                  )}

                  {onOpenUiThemePicker && (
                    <button
                      type="button"
                      onClick={onOpenUiThemePicker}
                      className="rcg-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isRtl ? 'باز کردن استودیو تم کلیدها و رابط کاربری' : 'Open UI & Button Theme Studio'}</span>
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className={`${cardClass} p-4 sm:p-6 space-y-5 sm:space-y-6`}>
                {/* Header Logo & Brand Customization Block */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[#091A42] dark:text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#FD5202]" />
                      <span>{isRtl ? 'تنظیمات لوگوی هدر سایت و رنگ‌بندی برند' : 'Header Logo & Brand Styling'}</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, logoType: 'vector' })}
                        className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold cursor-pointer border ${
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
                        className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold cursor-pointer border ${
                          localSettings.logoType === 'custom'
                            ? 'bg-[#144AE0] text-white border-[#144AE0]'
                            : 'bg-white dark:bg-[#091A42] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-800'
                        }`}
                      >
                        {isRtl ? 'لوگوی تصویری دلخواه' : 'Custom Image Logo'}
                      </button>
                    </div>
                  </div>

                  {/* Dual Light & Dark Surface Live Preview Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 text-slate-900 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isRtl ? 'نمایش در تم روشن / کارت‌های سفید' : 'Light Mode / Surface'}</span>
                      </span>
                      <RcgLogo
                        settings={localSettings}
                        surface="light"
                        subtitleType={isRtl ? 'fa' : 'en'}
                      />
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-[#060F26] border border-blue-800 text-white space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-[#A6D6FE]" />
                        <span>{isRtl ? 'نمایش در تم دارک / فوتر تیره' : 'Dark Mode / Footer BG'}</span>
                      </span>
                      <RcgLogo
                        settings={localSettings}
                        surface="dark"
                        subtitleType={isRtl ? 'fa' : 'en'}
                      />
                    </div>
                  </div>

                  {/* Mode Switcher Tabs: Light vs Dark Logo Customization */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-blue-900/60 pb-2">
                    <button
                      type="button"
                      onClick={() => setSettingsLogoMode('light')}
                      className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-xl text-xs font-bold border cursor-pointer ${
                        settingsLogoMode === 'light'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-800'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 shrink-0" />
                      <span>{isRtl ? 'تنظیمات پس‌زمینه روشن (Light)' : 'Light Theme / Surface'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsLogoMode('dark')}
                      className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-xl text-xs font-bold border cursor-pointer ${
                        settingsLogoMode === 'dark'
                          ? 'bg-[#091A42] text-[#A6D6FE] border-blue-500'
                          : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-800'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 shrink-0" />
                      <span>{isRtl ? 'تنظیمات پس‌زمینه تیره / دارک (Dark)' : 'Dark Theme / Footer BG'}</span>
                    </button>
                  </div>

                  {settingsLogoMode === 'light' ? (
                    localSettings.logoType === 'custom' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={localSettings.customLogoUrl || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, customLogoUrl: e.target.value })}
                          placeholder="آدرس لوگوی حالت روشن..."
                          className={`${inputClass} w-full sm:flex-1 font-mono`}
                          dir="ltr"
                        />
                        <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'آپلود لوگوی روشن' : 'Upload Light Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleReadFileAsDataUrl(
                                e.target.files?.[0],
                                (dataUrl) =>
                                  setLocalSettings({ ...localSettings, customLogoUrl: dataUrl, logoType: 'custom' }),
                                { category: 'logo', label: 'لوگوی حالت روشن' }
                              );
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryPicker({
                              category: 'logo',
                              onPick: (url) =>
                                setLocalSettings({ ...localSettings, customLogoUrl: url, logoType: 'custom' }),
                            })
                          }
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-[#091A42] border border-slate-300 dark:border-blue-800 text-xs font-bold cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                          <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'رنگ اصلی (روشن)' : 'Primary (Light)'}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={localSettings.logoPrimaryColor || '#144AE0'}
                              onChange={(e) => setLocalSettings({ ...localSettings, logoPrimaryColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
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
                            {isRtl ? 'رنگ حروف (روشن)' : 'Letters (Light)'}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={localSettings.logoSecondaryColor || '#091A42'}
                              onChange={(e) => setLocalSettings({ ...localSettings, logoSecondaryColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
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
                            {isRtl ? 'رنگ تاکیدی (روشن)' : 'Accent (Light)'}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={localSettings.logoAccentColor || '#FD5202'}
                              onChange={(e) => setLocalSettings({ ...localSettings, logoAccentColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
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

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isRtl ? 'حالت رنگ (روشن)' : 'Light Variant'}
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
                            <option value="color">{isRtl ? 'تمام‌رنگی رسمی' : 'Brand Color'}</option>
                            <option value="dark">{isRtl ? 'تک‌رنگ تیره' : 'Monochrome Dark'}</option>
                            <option value="light">{isRtl ? 'تک‌رنگ سفید' : 'Monochrome Light'}</option>
                          </select>
                        </div>
                      </div>
                    )
                  ) : localSettings.logoType === 'custom' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={localSettings.customLogoDarkUrl || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, customLogoDarkUrl: e.target.value })}
                        placeholder="آدرس لوگوی حالت دارک / تیره..."
                        className={`${inputClass} w-full sm:flex-1 font-mono`}
                        dir="ltr"
                      />
                      <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'آپلود لوگوی دارک' : 'Upload Dark Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleReadFileAsDataUrl(
                              e.target.files?.[0],
                              (dataUrl) =>
                                setLocalSettings({ ...localSettings, customLogoDarkUrl: dataUrl, logoType: 'custom' }),
                              { category: 'logo', label: 'لوگوی حالت تاریک' }
                            );
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryPicker({
                            category: 'logo',
                            onPick: (url) =>
                              setLocalSettings({ ...localSettings, customLogoDarkUrl: url, logoType: 'custom' }),
                          })
                        }
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-[#091A42] border border-slate-300 dark:border-blue-800 text-xs font-bold cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                        <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 sm:p-3.5 rounded-xl bg-[#091A42] text-white">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-200">
                          {isRtl ? 'رنگ اصلی (دارک)' : 'Primary (Dark)'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localSettings.logoDarkPrimaryColor || '#3B82F6'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoDarkPrimaryColor: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-blue-800 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={localSettings.logoDarkPrimaryColor || '#3B82F6'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoDarkPrimaryColor: e.target.value })}
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-200">
                          {isRtl ? 'رنگ حروف (دارک)' : 'Letters (Dark)'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localSettings.logoDarkSecondaryColor || '#FFFFFF'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoDarkSecondaryColor: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-blue-800 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={localSettings.logoDarkSecondaryColor || '#FFFFFF'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoDarkSecondaryColor: e.target.value })}
                            className={`${inputClass} font-mono`}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-200">
                          {isRtl ? 'رنگ تاکیدی (دارک)' : 'Accent (Dark)'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={localSettings.logoDarkAccentColor || '#FD5202'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoDarkAccentColor: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-blue-800 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={localSettings.logoDarkAccentColor || '#FD5202'}
                            onChange={(e) => setLocalSettings({ ...localSettings, logoDarkAccentColor: e.target.value })}
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
                          value={localSettings.logoDarkVariant || 'color'}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              logoDarkVariant: e.target.value as 'color' | 'dark' | 'light',
                            })
                          }
                          className={inputClass}
                        >
                          <option value="color">{isRtl ? 'تمام‌رنگی رسمی' : 'Brand Color'}</option>
                          <option value="light">{isRtl ? 'تک‌رنگ سفید' : 'Monochrome Light'}</option>
                          <option value="dark">{isRtl ? 'تک‌رنگ سفارشی' : 'Monochrome Custom'}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isRtl ? `اندازه پایه لوگو در کل سایت: ${localSettings.logoHeight || 36}px` : `Global Logo Height: ${localSettings.logoHeight || 36}px`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 max-h-[94dvh] overflow-y-auto text-xs text-slate-900 dark:text-white">
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

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    {isRtl ? 'برچسب‌ها (Tags - با ویرگول جدا کنید)' : 'Tags (comma-separated)'}
                  </label>
                  <input
                    type="text"
                    value={(editingProduct.tags || []).join(', ')}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        tags: e.target.value
                          .split(/[,\n،]+/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .slice(0, 12),
                      })
                    }
                    placeholder={isRtl ? 'پرفروش، اقساط ویژه، گارانتی رسمی...' : 'Best Seller, Free Setup...'}
                    className={inputClass}
                  />
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

              {/* 4. Image Upload & Stations Galleries */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-4">
                <h4 className="font-bold text-xs flex items-center gap-2 text-[#144AE0] dark:text-[#A6D6FE]">
                  <ImageIcon className="w-4 h-4 text-[#FD5202]" />
                  <span>{isRtl ? '۴. تصویر اصلی و ایستگاه‌های ۴گانه دستگاه' : '4. Machine Photo & 4 Internal Stations'}</span>
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                    dir="ltr"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'آپلود عکس' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleReadFileAsDataUrl(
                          e.target.files?.[0],
                          (dataUrl) => setEditingProduct({ ...editingProduct, image: dataUrl }),
                          { category: 'catalog', label: editingProduct.titleFa || editingProduct.model }
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryPicker({
                        category: 'catalog',
                        onPick: (url) => setEditingProduct({ ...editingProduct, image: url }),
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#091A42] border border-slate-300 dark:border-blue-800 font-bold cursor-pointer shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                    <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                  </button>
                </div>

                {/* Stations Thumbnails */}
                {editingProduct.stations && editingProduct.stations.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-blue-900">
                    {editingProduct.stations.map((st, stIdx) => (
                      <div key={stIdx} className={`${cardClass} p-3 space-y-2`}>
                        <div className="flex items-center gap-2">
                          <img src={st.img} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-blue-800" />
                          <input
                            type="text"
                            value={st.titleFa}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                stations: editingProduct.stations?.map((item, i) =>
                                  i === stIdx ? { ...item, titleFa: e.target.value } : item
                                ),
                              })
                            }
                            className={inputClass}
                            placeholder="عنوان ایستگاه..."
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#144AE0] text-white font-bold cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>{isRtl ? 'آپلود عکس ایستگاه' : 'Upload Station'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleReadFileAsDataUrl(
                                  e.target.files?.[0],
                                  (dataUrl) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      stations: editingProduct.stations?.map((item, i) =>
                                        i === stIdx ? { ...item, img: dataUrl } : item
                                      ),
                                    }),
                                  { category: 'catalog', label: st.titleFa || 'ایستگاه دستگاه' }
                                );
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setGalleryPicker({
                                category: 'catalog',
                                onPick: (url) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    stations: editingProduct.stations?.map((item, i) =>
                                      i === stIdx ? { ...item, img: url } : item
                                    ),
                                  }),
                              })
                            }
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 font-bold cursor-pointer"
                          >
                            <FolderOpen className="w-3 h-3 text-[#FD5202]" />
                            <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-blue-900 grid grid-cols-2 sm:flex sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 sm:px-5 py-2.5 min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer font-semibold"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(editingProduct)}
                className="flex items-center justify-center gap-1.5 px-4 sm:px-7 py-2.5 min-h-[42px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'ذخیره مشخصات دستگاه' : 'Save Machine'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Edit / Add Modal (Full Bilingual) */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[94dvh] overflow-y-auto text-xs text-slate-900 dark:text-white">
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
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editingMedia.image}
                    onChange={(e) => setEditingMedia({ ...editingMedia, image: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                    dir="ltr"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'آپلود' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleReadFileAsDataUrl(
                          e.target.files?.[0],
                          (dataUrl) => setEditingMedia({ ...editingMedia, image: dataUrl }),
                          { category: 'media', label: editingMedia.titleFa || 'کاور مقاله' }
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryPicker({
                        category: 'media',
                        onPick: (url) => setEditingMedia({ ...editingMedia, image: url }),
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 font-bold cursor-pointer shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                    <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    {isRtl ? 'برچسب‌ها (Tags - با ویرگول جدا کنید)' : 'Tags (comma-separated)'}
                  </label>
                  <input
                    type="text"
                    value={(editingMedia.tags || []).join(', ')}
                    onChange={(e) =>
                      setEditingMedia({
                        ...editingMedia,
                        tags: e.target.value
                          .split(/[,\n،]+/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .slice(0, 12),
                      })
                    }
                    placeholder={isRtl ? 'مقاله فنی، نگهداری، اخبار پایون...' : 'Technical Guide, Maintenance...'}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 px-3.5 py-2.5 min-h-[40px] w-full rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMedia.isActive !== false}
                      onChange={(e) => setEditingMedia({ ...editingMedia, isActive: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#FD5202]"
                    />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {isRtl ? 'مطلب در وب‌سایت نمایش داده شود (فعال)' : 'Visible & published on website'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-blue-900 grid grid-cols-2 sm:flex sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2.5 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer font-semibold"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveMedia(editingMedia)}
                className="px-4 sm:px-6 py-2.5 min-h-[40px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white font-bold cursor-pointer"
              >
                {isRtl ? 'انتشار مطلب' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Edit / Create Modal (Full Bilingual) */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 max-h-[94dvh] overflow-y-auto text-xs text-slate-900 dark:text-white">
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
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editingCampaign.heroImage}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, heroImage: e.target.value })}
                    className={`${inputClass} flex-1 font-mono`}
                    dir="ltr"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'آپلود تصویر' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleReadFileAsDataUrl(
                          e.target.files?.[0],
                          (dataUrl) => setEditingCampaign({ ...editingCampaign, heroImage: dataUrl }),
                          { category: 'campaigns', label: editingCampaign.titleFa || 'بنر کمپین' }
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryPicker({
                        category: 'campaigns',
                        onPick: (url) => setEditingCampaign({ ...editingCampaign, heroImage: url }),
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-blue-950 border border-slate-200 dark:border-blue-800 font-bold cursor-pointer shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#FD5202]" />
                    <span>{isRtl ? 'گالری' : 'Gallery'}</span>
                  </button>
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

            <div className="pt-4 border-t border-slate-200 dark:border-blue-900 grid grid-cols-2 sm:flex sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="px-4 sm:px-5 py-2.5 min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer font-semibold"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveCampaign(editingCampaign)}
                className="flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 min-h-[42px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'ذخیره و انتشار کمپین' : 'Save Campaign'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Asset Upload Modal (with real File Upload + Preview) */}
      {isAddingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleAddAssetSubmit}
            className="w-full max-w-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[94dvh] overflow-y-auto text-xs text-slate-900 dark:text-white"
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
                      setNewAssetCategory(e.target.value as BrandAssetCategory)
                    }
                    className={inputClass}
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isRtl ? c.labelFa : c.labelEn}
                      </option>
                    ))}
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

            <div className="pt-3 border-t border-slate-200 dark:border-blue-900 grid grid-cols-2 sm:flex sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAsset(false)}
                className="px-4 py-2.5 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer font-semibold"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 min-h-[40px] rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                {isRtl ? 'ذخیره در گالری' : 'Save Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

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
