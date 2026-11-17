export type Language = 'fa' | 'en';

export interface DepartmentSubCard {
  titleFa: string;
  titleEn: string;
  image: string;
}

export interface Department {
  id: string;
  key: 'sales' | 'service' | 'sharpening' | 'overhaul';
  titleFa: string;
  titleEn: string;
  taglineFa: string;
  taglineEn: string;
  shortDescFa: string;
  shortDescEn: string;
  fullDescFa: string;
  fullDescEn: string;
  iconName: string;
  image: string;
  subSectionTitleFa: string;
  subSectionTitleEn: string;
  bottomBannerFa: string;
  bottomBannerEn: string;
  bottomBannerLink?: string;
  subCards: DepartmentSubCard[];
  servicesFa: string[];
  servicesEn: string[];
  statsFa: { label: string; value: string }[];
  statsEn: { label: string; value: string }[];
}

export interface ProductStation {
  titleFa: string;
  titleEn: string;
  img: string;
}

export interface Product {
  id: string;
  titleFa: string;
  titleEn: string;
  category: 'saws' | 'edgebanders' | 'cnc' | 'blades' | 'refurbished';
  categoryFa: string;
  categoryEn: string;
  brand: string;
  model: string;
  year?: string;
  condition: 'new' | 'used';
  conditionFa: string;
  conditionEn: string;
  power: string;
  tableSize?: string;
  feedSpeed?: string;
  priceFa: string;
  priceEn: string;
  downPaymentFa?: string;
  downPaymentEn?: string;
  installmentChecksFa?: string;
  installmentChecksEn?: string;
  installmentAvailable: boolean;
  specsFa: { key: string; value: string }[];
  specsEn: { key: string; value: string }[];
  image: string;
  badgeFa?: string;
  badgeEn?: string;
  featuredPoster?: boolean;
  isActive?: boolean;
  precisionRating?: number; // e.g. 98 (%)
  durabilityRating?: number; // e.g. 96 (%)
  efficiencyRating?: number; // e.g. 95 (%)
  qualityBadgeFa?: string;
  qualityBadgeEn?: string;
  tags?: string[];
  stations?: ProductStation[];
}

export interface MediaItem {
  id: string;
  type: 'news' | 'article' | 'video' | 'project';
  typeFa: string;
  typeEn: string;
  titleFa: string;
  titleEn: string;
  dateFa: string;
  dateEn: string;
  readTimeFa: string;
  readTimeEn: string;
  summaryFa: string;
  summaryEn: string;
  contentFa: string;
  contentEn: string;
  image: string;
  videoUrl?: string;
  authorFa: string;
  authorEn: string;
  isActive?: boolean;
  tags?: string[];
}

export interface SharpeningOrder {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  bladeType: string;
  diameter: string;
  teethCount: string;
  serviceType: string;
  quantity: number;
  estimatedPrice: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  department: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface HeroSlide {
  id: string;
  titleFa: string;
  titleEn: string;
  highlightFa: string;
  highlightEn: string;
  subtitleFa: string;
  subtitleEn: string;
  image: string;
  primaryCtaFa: string;
  primaryCtaEn: string;
  primaryCtaLink?: string;
  secondaryCtaFa: string;
  secondaryCtaEn: string;
  secondaryCtaLink?: string;
}

export type UiDesignPreset =
  | 'rcg-corporate'
  | 'material-you'
  | 'apple-glass'
  | 'carbon-industrial'
  | 'swiss-minimal';

export type ButtonThemeStyle =
  | 'solid-gradient'
  | 'pill-soft'
  | 'sharp-outline'
  | 'glass-frost'
  | 'tactile-3d';

export type UiInteractionMode =
  | 'spring-playful'
  | 'corporate-smooth'
  | 'snappy-tech'
  | 'reduced-instant';

export type ScrollSnapBehavior = 'proximity' | 'mandatory' | 'off';

export type ExternalIconSet =
  | 'lucide-default'
  | 'phosphor-duotone'
  | 'iconify-mdi'
  | 'iconify-tabler'
  | 'iconify-solar';

export interface SiteSettings {
  companyNameFa: string;
  companyNameEn: string;
  sloganFa: string;
  sloganEn: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  email: string;
  addressFa: string;
  addressEn: string;
  workingHoursFa: string;
  workingHoursEn: string;
  instagramUrl: string;
  linkedinUrl: string;
  telegramUrl: string;
  // Light Theme & Surface Logo Customization
  logoType?: 'vector' | 'custom';
  customLogoUrl?: string;
  logoVariant?: 'color' | 'dark' | 'light';
  logoPrimaryColor?: string;
  logoSecondaryColor?: string;
  logoAccentColor?: string;
  // Dark Theme & Dark Surface Logo Customization
  customLogoDarkUrl?: string;
  logoDarkVariant?: 'color' | 'dark' | 'light';
  logoDarkPrimaryColor?: string;
  logoDarkSecondaryColor?: string;
  logoDarkAccentColor?: string;
  // Shared Logo Dimensions & Lockup
  logoHeight?: number;
  logoShowSubtitle?: boolean;
  headerCtaTextFa?: string;
  headerCtaTextEn?: string;
  headerCtaLink?: string;
  // UI & Button Theme + External Resources
  uiPreset?: UiDesignPreset;
  buttonStyle?: ButtonThemeStyle;
  uiInteraction?: UiInteractionMode;
  scrollSnapMode?: ScrollSnapBehavior;
  externalIconPack?: ExternalIconSet;
  externalCtaIcon?: string;
  externalFontEn?: string;
}

export interface CampaignLanding {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  badgeFa: string;
  badgeEn: string;
  headlineFa: string;
  headlineEn: string;
  subheadlineFa: string;
  subheadlineEn: string;
  heroImage: string;
  ctaTextFa: string;
  ctaTextEn: string;
  secondaryCtaFa: string;
  secondaryCtaEn: string;
  featuredMachineId?: string;
  specialOfferFa: string;
  specialOfferEn: string;
  discountPercentage?: number;
  downPaymentFa?: string;
  downPaymentEn?: string;
  installmentsCountFa?: string;
  installmentsCountEn?: string;
  deliveryTermsFa: string;
  deliveryTermsEn: string;
  warrantyFa: string;
  warrantyEn: string;
  highlightsFa: string[];
  highlightsEn: string[];
  registrationTitleFa: string;
  registrationTitleEn: string;
  registrationSubtitleFa: string;
  registrationSubtitleEn: string;
  isActive: boolean;
  viewsCount?: number;
  conversionsCount?: number;
}

export interface CampaignInquiry {
  id: string;
  campaignId: string;
  campaignTitle: string;
  fullName: string;
  phone: string;
  city: string;
  workshopType: string;
  interestedMachine: string;
  paymentPreference: 'cash' | 'installment' | 'lease';
  status: 'new' | 'contacted' | 'contracted' | 'archived';
  createdAt: string;
  notes?: string;
}

export type BrandAssetCategory =
  | 'logo'
  | 'hero'
  | 'departments'
  | 'catalog'
  | 'campaigns'
  | 'media'
  | 'photo'
  | 'brandbook'
  | 'certificate';

export interface BrandAsset {
  id: string;
  titleFa: string;
  titleEn: string;
  category: BrandAssetCategory;
  url: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
}

export interface NavLinkItem {
  id: string;
  labelFa: string;
  labelEn: string;
  targetId: string;
  isVisible: boolean;
}

export type SectionId =
  | 'header'
  | 'hero'
  | 'departments'
  | 'catalog'
  | 'campaigns'
  | 'calculator'
  | 'media'
  | 'about'
  | 'contact'
  | 'footer';

export interface SectionCustomization {
  badgeFa?: string;
  badgeEn?: string;
  titleFa?: string;
  titleEn?: string;
  subtitleFa?: string;
  subtitleEn?: string;
  historyTitleFa?: string;
  historyTitleEn?: string;
  bodyFa?: string;
  bodyEn?: string;
  bodySecondaryFa?: string;
  bodySecondaryEn?: string;
  image?: string;
  ctaTextFa?: string;
  ctaTextEn?: string;
  ctaLink?: string;
  secondaryCtaTextFa?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaLink?: string;
}

export type SiteSectionsConfig = Record<Exclude<SectionId, 'header'>, SectionCustomization>;
