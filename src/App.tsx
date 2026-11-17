/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Language,
  HeroSlide,
  Department,
  Product,
  MediaItem,
  SharpeningOrder,
  Inquiry,
  SiteSettings,
  CampaignLanding,
  CampaignInquiry,
  BrandAsset,
  NavLinkItem,
  SectionId,
  SiteSectionsConfig,
} from './types';
import {
  initialHeroSlides,
  initialDepartments,
  initialProducts,
  initialMedia,
  initialSharpeningOrders,
  initialInquiries,
  initialSiteSettings,
  initialCampaigns,
  initialCampaignInquiries,
  initialBrandAssets,
  initialNavLinks,
  initialSectionsConfig,
} from './data/initialData';

import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  FirebaseProvider,
  useFirebase,
} from './context/FirebaseContext';
import { auth } from './firebase';
import {
  createCampaignInquiryInFirestore,
  createInquiryInFirestore,
  createSharpeningOrderInFirestore,
  serializeBrandAssetForFirestore,
  serializeCampaignForFirestore,
  serializeDepartmentForFirestore,
  serializeMediaForFirestore,
  serializeProductForFirestore,
  serializeSlideForFirestore,
  subscribeCustomerRecords,
  subscribePublicCmsStorefront,
  syncCollectionToFirestore,
  syncSiteConfigToFirestore,
  updateCampaignInquiryInFirestore,
  updateInquiryStatusInFirestore,
  updateSharpeningOrderInFirestore,
} from './services/firestoreSync';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DepartmentsSection } from './components/DepartmentsSection';
import { MachineryCatalog } from './components/MachineryCatalog';
import { CampaignsSection } from './components/CampaignsSection';
import { SharpeningCalculator } from './components/SharpeningCalculator';
import { MediaCenter } from './components/MediaCenter';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminDashboard, AdminTab } from './components/AdminDashboard';
import { ConsultationModal } from './components/ConsultationModal';
import { CampaignLandingModal } from './components/CampaignLandingModal';
import { UserPortalModal } from './components/UserPortalModal';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { EditableSectionWrapper } from './components/EditableSectionWrapper';
import { SectionEditorModal } from './components/SectionEditorModal';
import { UiThemePickerModal } from './components/UiThemePickerModal';
import { applyUiThemeToDocument } from './utils/uiThemes';
import { MousePointerClick, Shield, Palette, X, CheckCircle2, Undo2 } from 'lucide-react';

interface AppContentProps {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

function AppContent({ language, setLanguage, isDark, setIsDark }: AppContentProps) {
  const { user, authReady, isAdmin, updateUserPreferences } = useFirebase();
  const canAccessAdmin = Boolean(
    authReady &&
      user &&
      user.emailVerified &&
      user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
      isAdmin
  );

  // Modals & Live Page Edit Mode state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('overview');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isUserPortalOpen, setIsUserPortalOpen] = useState(false);
  const [isUiThemePickerOpen, setIsUiThemePickerOpen] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [consultationPrefill, setConsultationPrefill] = useState<{ dept?: string; subject?: string }>({});

  const [isPageEditMode, setIsPageEditMode] = useState(false);
  const [activeEditSection, setActiveEditSection] = useState<SectionId | null>(null);
  const [pageToast, setPageToast] = useState<string | null>(null);
  const [sectionEditHistory, setSectionEditHistory] = useState<
    Array<{
      sectionId: SectionId;
      settings?: SiteSettings;
      sectionsConfig?: SiteSectionsConfig;
      heroSlides?: HeroSlide[];
      departments?: Department[];
      campaigns?: CampaignLanding[];
      mediaItems?: MediaItem[];
    }>
  >([]);

  useEffect(() => {
    if (!canAccessAdmin) {
      setIsAdminOpen(false);
      setIsPageEditMode(false);
      setActiveEditSection(null);
      setIsUiThemePickerOpen(false);
      setSectionEditHistory([]);
    }
  }, [canAccessAdmin]);

  const showPageToast = (msg: string) => {
    setPageToast(msg);
    setTimeout(() => setPageToast(null), 3200);
  };

  const handleOpenAdminWithTab = (tab: AdminTab) => {
    if (!canAccessAdmin) return;
    setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  const handleTogglePageEditMode = () => {
    if (!canAccessAdmin) return;
    setIsPageEditMode((prev) => {
      const next = !prev;
      if (next) {
        showPageToast(
          language === 'fa'
            ? 'حالت تنظیمات صفحه فعال شد — روی هر بخش سایت کلیک کنید'
            : 'Page Edit Mode active — click any section on the page to customize it'
        );
      } else {
        setActiveEditSection(null);
      }
      return next;
    });
  };

  const handleEnterPageEditFromAdmin = () => {
    setIsAdminOpen(false);
    setIsPageEditMode(true);
    showPageToast(
      language === 'fa'
        ? 'حالت تنظیمات صفحه فعال شد — روی هر بخش سایت کلیک کنید'
        : 'Page Edit Mode active — click any section on the page to customize it'
    );
  };

  // CMS Data states with localStorage fallback
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('rcg_slides');
    return saved ? JSON.parse(saved) : initialHeroSlides;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('rcg_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rcg_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((p: Product) => p.id === 'prod-nb4j')) {
          return parsed;
        }
      } catch {
        // fallback to initial
      }
    }
    return initialProducts;
  });

  const [sharpeningOrders, setSharpeningOrders] = useState<SharpeningOrder[]>(() => {
    const saved = localStorage.getItem('rcg_sharpening_orders');
    return saved ? JSON.parse(saved) : initialSharpeningOrders;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('rcg_inquiries');
    return saved ? JSON.parse(saved) : initialInquiries;
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('rcg_media');
    return saved ? JSON.parse(saved) : initialMedia;
  });

  const [campaigns, setCampaigns] = useState<CampaignLanding[]>(() => {
    const saved = localStorage.getItem('rcg_campaigns');
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [campaignInquiries, setCampaignInquiries] = useState<CampaignInquiry[]>(() => {
    const saved = localStorage.getItem('rcg_campaign_inquiries');
    return saved ? JSON.parse(saved) : initialCampaignInquiries;
  });

  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>(() => {
    const saved = localStorage.getItem('rcg_brand_assets');
    return saved ? JSON.parse(saved) : initialBrandAssets;
  });

  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(() => {
    const saved = localStorage.getItem('rcg_nav_links');
    return saved ? JSON.parse(saved) : initialNavLinks;
  });

  const [sectionsConfig, setSectionsConfig] = useState<SiteSectionsConfig>(() => {
    const saved = localStorage.getItem('rcg_section_configs');
    if (saved) {
      try {
        return { ...initialSectionsConfig, ...JSON.parse(saved) };
      } catch {
        return initialSectionsConfig;
      }
    }
    return initialSectionsConfig;
  });

  const [activeCampaignModal, setActiveCampaignModal] = useState<CampaignLanding | null>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('rcg_settings');
    if (saved) {
      try {
        return { ...initialSiteSettings, ...JSON.parse(saved) };
      } catch {
        return initialSiteSettings;
      }
    }
    return initialSiteSettings;
  });

  // Clear any legacy visitor UI theme override so cloud admin theme applies to everyone
  useEffect(() => {
    localStorage.removeItem('rcg_visitor_ui_theme');
  }, []);

  // Synchronize live UI theme preset, button styling, interaction physics, scroll-snap & external Google Font
  useEffect(() => {
    applyUiThemeToDocument(siteSettings, language);
  }, [siteSettings, language]);

  const prevOrdersRef = useRef<SharpeningOrder[]>(sharpeningOrders);
  const prevInquiriesRef = useRef<Inquiry[]>(inquiries);
  const prevCampInquiriesRef = useRef<CampaignInquiry[]>(campaignInquiries);
  prevOrdersRef.current = sharpeningOrders;
  prevInquiriesRef.current = inquiries;
  prevCampInquiriesRef.current = campaignInquiries;

  // Subscribe to public Firestore CMS storefront data
  useEffect(() => {
    const unsubscribe = subscribePublicCmsStorefront({
      onSettings: (cloudSettings) => {
        const merged = { ...initialSiteSettings, ...cloudSettings };
        setSiteSettings(merged);
        localStorage.setItem('rcg_settings', JSON.stringify(merged));
      },
      onSections: (cloudSections) => {
        const merged = { ...initialSectionsConfig, ...cloudSections };
        setSectionsConfig(merged);
        localStorage.setItem('rcg_section_configs', JSON.stringify(merged));
      },
      onNavLinks: (cloudLinks) => {
        setNavLinks(cloudLinks);
        localStorage.setItem('rcg_nav_links', JSON.stringify(cloudLinks));
      },
      onSlides: (cloudSlides) => {
        setHeroSlides(cloudSlides);
        localStorage.setItem('rcg_slides', JSON.stringify(cloudSlides));
      },
      onDepartments: (cloudDepts) => {
        setDepartments(cloudDepts);
        localStorage.setItem('rcg_departments', JSON.stringify(cloudDepts));
      },
      onProducts: (cloudProducts) => {
        setProducts(cloudProducts);
        localStorage.setItem('rcg_products', JSON.stringify(cloudProducts));
      },
      onMedia: (cloudMedia) => {
        setMediaItems(cloudMedia);
        localStorage.setItem('rcg_media', JSON.stringify(cloudMedia));
      },
      onCampaigns: (cloudCampaigns) => {
        setCampaigns(cloudCampaigns);
        localStorage.setItem('rcg_campaigns', JSON.stringify(cloudCampaigns));
      },
      onBrandAssets: (cloudAssets) => {
        setBrandAssets(cloudAssets);
        localStorage.setItem('rcg_brand_assets', JSON.stringify(cloudAssets));
      },
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to authenticated user-scoped (or bootstrapped admin-all) Firestore customer records
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) return;
    const isSuperListAdmin = user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
    const unsubscribe = subscribeCustomerRecords(user.uid, isSuperListAdmin, {
      onOrders: (cloudOrders) => {
        if (cloudOrders.length > 0 || isSuperListAdmin) {
          setSharpeningOrders(cloudOrders);
          localStorage.setItem('rcg_sharpening_orders', JSON.stringify(cloudOrders));
        }
      },
      onInquiries: (cloudInqs) => {
        if (cloudInqs.length > 0 || isSuperListAdmin) {
          setInquiries(cloudInqs);
          localStorage.setItem('rcg_inquiries', JSON.stringify(cloudInqs));
        }
      },
      onCampaignInquiries: (cloudCampInqs) => {
        if (cloudCampInqs.length > 0 || isSuperListAdmin) {
          setCampaignInquiries(cloudCampInqs);
          localStorage.setItem('rcg_campaign_inquiries', JSON.stringify(cloudCampInqs));
        }
      },
    });
    return () => unsubscribe();
  }, [authReady, user]);

  // Language & Theme handlers with Firestore preference sync
  const handleLanguageChange = (nextLang: Language) => {
    setLanguage(nextLang);
    void updateUserPreferences(nextLang, isDark ? 'dark' : 'light');
  };

  const handleThemeToggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      void updateUserPreferences(language, next ? 'dark' : 'light');
      return next;
    });
  };

  // Persistence Handlers (localStorage + Firestore when Admin)
  const handleUpdateSlides = (newSlides: HeroSlide[]) => {
    setHeroSlides(newSlides);
    localStorage.setItem('rcg_slides', JSON.stringify(newSlides));
    if (isAdmin && user) {
      void syncCollectionToFirestore('hero_slides', newSlides, serializeSlideForFirestore);
    }
  };

  const handleUpdateDepartments = (newDepts: Department[]) => {
    setDepartments(newDepts);
    localStorage.setItem('rcg_departments', JSON.stringify(newDepts));
    if (isAdmin && user) {
      void syncCollectionToFirestore('departments', newDepts, serializeDepartmentForFirestore);
    }
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('rcg_products', JSON.stringify(newProducts));
    if (isAdmin && user) {
      void syncCollectionToFirestore('products', newProducts, serializeProductForFirestore);
    }
  };

  const handleUpdateSharpeningOrders = (newOrders: SharpeningOrder[]) => {
    const prev = prevOrdersRef.current;
    setSharpeningOrders(newOrders);
    localStorage.setItem('rcg_sharpening_orders', JSON.stringify(newOrders));
    if (isAdmin && user) {
      newOrders.forEach((o) => {
        const old = prev.find((p) => p.id === o.id);
        if (old && (old.status !== o.status || old.notes !== o.notes)) {
          void updateSharpeningOrderInFirestore(o.id, { status: o.status, notes: o.notes });
        }
      });
    }
  };

  const handleUpdateInquiries = (newInquiries: Inquiry[]) => {
    const prev = prevInquiriesRef.current;
    setInquiries(newInquiries);
    localStorage.setItem('rcg_inquiries', JSON.stringify(newInquiries));
    if (isAdmin && user) {
      newInquiries.forEach((inq) => {
        const old = prev.find((p) => p.id === inq.id);
        if (old && old.status !== inq.status) {
          void updateInquiryStatusInFirestore(inq.id, inq.status);
        }
      });
    }
  };

  const handleUpdateMediaItems = (newItems: MediaItem[]) => {
    setMediaItems(newItems);
    localStorage.setItem('rcg_media', JSON.stringify(newItems));
    if (isAdmin && user) {
      void syncCollectionToFirestore('media_items', newItems, serializeMediaForFirestore);
    }
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    localStorage.setItem('rcg_settings', JSON.stringify(newSettings));
    if (canAccessAdmin && user) {
      void syncSiteConfigToFirestore(
        'settings',
        newSettings as unknown as Record<string, unknown>,
        user.uid
      );
    }
  };

  const handleUpdateCampaigns = (newCampaigns: CampaignLanding[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('rcg_campaigns', JSON.stringify(newCampaigns));
    if (isAdmin && user) {
      void syncCollectionToFirestore('campaigns', newCampaigns, serializeCampaignForFirestore);
    }
  };

  const handleUpdateCampaignInquiries = (newInqs: CampaignInquiry[]) => {
    const prev = prevCampInquiriesRef.current;
    setCampaignInquiries(newInqs);
    localStorage.setItem('rcg_campaign_inquiries', JSON.stringify(newInqs));
    if (isAdmin && user) {
      newInqs.forEach((ci) => {
        const old = prev.find((p) => p.id === ci.id);
        if (old && (old.status !== ci.status || old.notes !== ci.notes)) {
          void updateCampaignInquiryInFirestore(ci.id, { status: ci.status, notes: ci.notes });
        }
      });
    }
  };

  const handleUpdateBrandAssets = (newAssets: BrandAsset[]) => {
    setBrandAssets(newAssets);
    localStorage.setItem('rcg_brand_assets', JSON.stringify(newAssets));
    if (isAdmin && user) {
      void syncCollectionToFirestore('brand_assets', newAssets, serializeBrandAssetForFirestore);
    }
  };

  const handleArchiveAsset = (asset: Omit<BrandAsset, 'id' | 'uploadedAt'>) => {
    setBrandAssets((prev) => {
      const existingIndex = prev.findIndex((a) => a.url === asset.url);
      let next: BrandAsset[];
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.category === asset.category) {
          return prev;
        }
        next = prev.map((a, idx) =>
          idx === existingIndex ? { ...a, category: asset.category } : a
        );
      } else {
        const created: BrandAsset = {
          ...asset,
          id: `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          uploadedAt: new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US'),
        };
        next = [created, ...prev];
      }
      localStorage.setItem('rcg_brand_assets', JSON.stringify(next));
      if (isAdmin && user) {
        void syncCollectionToFirestore('brand_assets', next, serializeBrandAssetForFirestore);
      }
      return next;
    });
  };

  const handleUpdateNavLinks = (newLinks: NavLinkItem[]) => {
    setNavLinks(newLinks);
    localStorage.setItem('rcg_nav_links', JSON.stringify(newLinks));
    if (isAdmin && user) {
      void syncSiteConfigToFirestore('navigation', { links: newLinks }, user.uid);
    }
  };

  const handleUpdateSectionsConfig = (newConfig: SiteSectionsConfig) => {
    setSectionsConfig(newConfig);
    localStorage.setItem('rcg_section_configs', JSON.stringify(newConfig));
    if (isAdmin && user) {
      void syncSiteConfigToFirestore(
        'sections',
        newConfig as unknown as Record<string, unknown>,
        user.uid
      );
    }
  };

  const SECTION_EDIT_LABELS: Record<SectionId, { fa: string; en: string }> = {
    header: { fa: 'لوگو و هدر', en: 'Header & Logo' },
    hero: { fa: 'بخش هیرو و اسلایدر', en: 'Hero Section' },
    departments: { fa: 'چهار رکن خدمات', en: 'Departments' },
    catalog: { fa: 'کاتالوگ ماشین‌آلات', en: 'Machinery Catalog' },
    campaigns: { fa: 'کمپین‌های فروش', en: 'Campaigns' },
    calculator: { fa: 'محاسبه‌گر تیزکاری', en: 'Sharpening Calculator' },
    media: { fa: 'مرکز رسانه', en: 'Media Center' },
    about: { fa: 'درباره آرسی', en: 'About RCG' },
    contact: { fa: 'تماس با ما', en: 'Contact Section' },
    footer: { fa: 'فوتر سایت', en: 'Footer' },
  };

  const handleCaptureSectionSnapshot = (sid: SectionId) => {
    const cloneValue = <T,>(val: T): T => JSON.parse(JSON.stringify(val)) as T;
    const snapshot =
      sid === 'header'
        ? {
            sectionId: sid,
            settings: cloneValue(siteSettings),
          }
        : {
            sectionId: sid,
            sectionsConfig: cloneValue(sectionsConfig),
            ...(sid === 'hero' ? { heroSlides: cloneValue(heroSlides) } : {}),
            ...(sid === 'departments' ? { departments: cloneValue(departments) } : {}),
            ...(sid === 'campaigns' ? { campaigns: cloneValue(campaigns) } : {}),
            ...(sid === 'media' ? { mediaItems: cloneValue(mediaItems) } : {}),
          };

    setSectionEditHistory((prev) => [...prev.slice(-19), snapshot]);
  };

  const handleUndoLastSectionEdit = () => {
    if (!canAccessAdmin || sectionEditHistory.length === 0) return;
    const lastSnapshot = sectionEditHistory[sectionEditHistory.length - 1];
    setSectionEditHistory((prev) => prev.slice(0, -1));

    if (lastSnapshot.settings) {
      handleUpdateSettings(lastSnapshot.settings);
    }
    if (lastSnapshot.sectionsConfig) {
      handleUpdateSectionsConfig(lastSnapshot.sectionsConfig);
    }
    if (lastSnapshot.heroSlides) {
      handleUpdateSlides(lastSnapshot.heroSlides);
    }
    if (lastSnapshot.departments) {
      handleUpdateDepartments(lastSnapshot.departments);
    }
    if (lastSnapshot.campaigns) {
      handleUpdateCampaigns(lastSnapshot.campaigns);
    }
    if (lastSnapshot.mediaItems) {
      handleUpdateMediaItems(lastSnapshot.mediaItems);
    }

    const label = SECTION_EDIT_LABELS[lastSnapshot.sectionId];
    showPageToast(
      language === 'fa'
        ? `آخرین تغییر بخش «${label.fa}» بازگردانی و لغو شد`
        : `Reverted last change to "${label.en}"`
    );
  };

  const handlePublishAllToCloud = async () => {
    if (!isAdmin || !user) return;
    setCloudSyncing(true);
    try {
      await Promise.all([
        syncSiteConfigToFirestore(
          'settings',
          siteSettings as unknown as Record<string, unknown>,
          user.uid
        ),
        syncSiteConfigToFirestore(
          'sections',
          sectionsConfig as unknown as Record<string, unknown>,
          user.uid
        ),
        syncSiteConfigToFirestore('navigation', { links: navLinks }, user.uid),
        syncCollectionToFirestore('hero_slides', heroSlides, serializeSlideForFirestore),
        syncCollectionToFirestore('departments', departments, serializeDepartmentForFirestore),
        syncCollectionToFirestore('products', products, serializeProductForFirestore),
        syncCollectionToFirestore('media_items', mediaItems, serializeMediaForFirestore),
        syncCollectionToFirestore('campaigns', campaigns, serializeCampaignForFirestore),
        syncCollectionToFirestore('brand_assets', brandAssets, serializeBrandAssetForFirestore),
      ]);
    } finally {
      setCloudSyncing(false);
    }
  };

  const handleResetToDefaults = () => {
    localStorage.removeItem('rcg_slides');
    localStorage.removeItem('rcg_departments');
    localStorage.removeItem('rcg_products');
    localStorage.removeItem('rcg_sharpening_orders');
    localStorage.removeItem('rcg_inquiries');
    localStorage.removeItem('rcg_media');
    localStorage.removeItem('rcg_settings');
    localStorage.removeItem('rcg_campaigns');
    localStorage.removeItem('rcg_campaign_inquiries');
    localStorage.removeItem('rcg_brand_assets');
    localStorage.removeItem('rcg_nav_links');
    localStorage.removeItem('rcg_section_configs');

    setHeroSlides(initialHeroSlides);
    setDepartments(initialDepartments);
    setProducts(initialProducts);
    setSharpeningOrders(initialSharpeningOrders);
    setInquiries(initialInquiries);
    setMediaItems(initialMedia);
    setSiteSettings(initialSiteSettings);
    setCampaigns(initialCampaigns);
    setCampaignInquiries(initialCampaignInquiries);
    setBrandAssets(initialBrandAssets);
    setNavLinks(initialNavLinks);
    setSectionsConfig(initialSectionsConfig);
  };

  // Authenticated Customer Actions -> Firestore + Local State
  const handleNewOrderCreated = (order: SharpeningOrder) => {
    const next = [order, ...sharpeningOrders];
    setSharpeningOrders(next);
    localStorage.setItem('rcg_sharpening_orders', JSON.stringify(next));
    const activeUid = auth.currentUser?.uid || user?.uid;
    if (activeUid) {
      void createSharpeningOrderInFirestore(activeUid, order);
    }
  };

  const handleNewInquirySubmitted = (inquiry: Inquiry) => {
    const next = [inquiry, ...inquiries];
    setInquiries(next);
    localStorage.setItem('rcg_inquiries', JSON.stringify(next));
    const activeUid = auth.currentUser?.uid || user?.uid;
    if (activeUid) {
      void createInquiryInFirestore(activeUid, inquiry);
    }
  };

  const handleNewCampaignInquiry = (inq: CampaignInquiry) => {
    const next = [inq, ...campaignInquiries];
    setCampaignInquiries(next);
    localStorage.setItem('rcg_campaign_inquiries', JSON.stringify(next));
    const activeUid = auth.currentUser?.uid || user?.uid;
    if (activeUid) {
      void createCampaignInquiryInFirestore(activeUid, inq);
    }
  };

  const openInquiryForDepartment = (deptTitle: string) => {
    setConsultationPrefill({
      dept: deptTitle,
      subject: language === 'fa' ? `استعلام خدمات ${deptTitle}` : `Inquiry for ${deptTitle}`,
    });
    setIsConsultationOpen(true);
  };

  const openInquiryForProduct = (prodTitle: string) => {
    setConsultationPrefill({
      subject: language === 'fa' ? `استعلام قیمت و شرایط اقساطی ${prodTitle}` : `Inquiry for ${prodTitle}`,
    });
    setIsConsultationOpen(true);
  };

  const isRtl = language === 'fa';

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 dark:bg-[#060F26] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#FD5202] selection:text-white transition-colors duration-200">
      <ScrollProgressBar language={language} />

      {/* Live Page Edit Mode Notification Toast */}
      {pageToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-[#091A42] dark:bg-[#FD5202] text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/15">
          <CheckCircle2 className="w-4 h-4 text-[#FD5202] dark:text-white shrink-0" />
          <span>{pageToast}</span>
        </div>
      )}

      {/* 1. Header / Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        onOpenUiThemePicker={canAccessAdmin ? () => setIsUiThemePickerOpen(true) : undefined}
        navLinks={navLinks}
        settings={siteSettings}
        isPageEditMode={canAccessAdmin && isPageEditMode}
        onTogglePageEditMode={canAccessAdmin ? handleTogglePageEditMode : undefined}
        onEditHeaderSection={canAccessAdmin ? () => setActiveEditSection('header') : undefined}
        onOpenAdmin={canAccessAdmin ? () => handleOpenAdminWithTab('overview') : undefined}
        onOpenUserPortal={() => setIsUserPortalOpen(true)}
        onOpenContactModal={() => {
          setConsultationPrefill({});
          setIsConsultationOpen(true);
        }}
      />

      {/* 2. Main Sections */}
      <main className="flex-1">
        <EditableSectionWrapper
          sectionId="hero"
          labelFa="اسلایدر و بخش هیرو"
          labelEn="Hero Section"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <Hero
            slides={heroSlides}
            language={language}
            settings={siteSettings}
            sectionConfig={sectionsConfig.hero}
            onExploreDepartments={() => {
              const el = document.getElementById('departments');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCalculator={() => {
              const el = document.getElementById('calculator');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenContactModal={() => {
              setConsultationPrefill({});
              setIsConsultationOpen(true);
            }}
          />
        </EditableSectionWrapper>

        {/* 3. Four Pillars / Specialized Departments */}
        <EditableSectionWrapper
          sectionId="departments"
          labelFa="دپارتمان‌های تخصصی"
          labelEn="Departments"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <DepartmentsSection
            departments={departments}
            language={language}
            settings={siteSettings}
            isDark={isDark}
            sectionConfig={sectionsConfig.departments}
            onSelectDepartmentForInquiry={openInquiryForDepartment}
          />
        </EditableSectionWrapper>

        {/* 4. Machinery & Cutting Tool Catalog */}
        <EditableSectionWrapper
          sectionId="catalog"
          labelFa="کاتالوگ ماشین‌آلات"
          labelEn="Machinery Catalog"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <MachineryCatalog
            products={products}
            language={language}
            settings={siteSettings}
            isDark={isDark}
            sectionConfig={sectionsConfig.catalog}
            onInquireProduct={openInquiryForProduct}
            onOpenMachineryManagement={canAccessAdmin ? () => handleOpenAdminWithTab('catalog') : undefined}
          />
        </EditableSectionWrapper>

        {/* 5. Campaign Marketing Landing Pages Showcase */}
        <EditableSectionWrapper
          sectionId="campaigns"
          labelFa="کمپین‌های بازاریابی"
          labelEn="Campaigns"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <CampaignsSection
            campaigns={campaigns}
            language={language}
            settings={siteSettings}
            sectionConfig={sectionsConfig.campaigns}
            onSelectCampaign={setActiveCampaignModal}
          />
        </EditableSectionWrapper>

        {/* 6. Online Saw Blade Sharpening Calculator */}
        <EditableSectionWrapper
          sectionId="calculator"
          labelFa="محاسبه‌گر تیزکاری"
          labelEn="Sharpening Calculator"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <SharpeningCalculator
            language={language}
            settings={siteSettings}
            sectionConfig={sectionsConfig.calculator}
            onOrderCreated={handleNewOrderCreated}
          />
        </EditableSectionWrapper>

        {/* 7. Media Center & Technical Insights */}
        <EditableSectionWrapper
          sectionId="media"
          labelFa="مرکز رسانه و مقالات"
          labelEn="Media Center"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <MediaCenter
            items={mediaItems}
            language={language}
            sectionConfig={sectionsConfig.media}
          />
        </EditableSectionWrapper>

        {/* 8. About RCG & Heritage */}
        <EditableSectionWrapper
          sectionId="about"
          labelFa="درباره گروه صنعتی آرسی"
          labelEn="About RCG"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <AboutSection
            language={language}
            settings={siteSettings}
            sectionConfig={sectionsConfig.about}
            onOpenConsultation={() => {
              setConsultationPrefill({
                subject: language === 'fa' ? 'درخواست مشاوره تخصصی کارگاهی' : 'Workshop Advisory Request',
              });
              setIsConsultationOpen(true);
            }}
          />
        </EditableSectionWrapper>

        {/* 9. Contact & Facilities */}
        <EditableSectionWrapper
          sectionId="contact"
          labelFa="تماس با ما و پشتیبانی"
          labelEn="Contact Section"
          isEditMode={canAccessAdmin && isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <ContactSection
            settings={siteSettings}
            language={language}
            sectionConfig={sectionsConfig.contact}
            prefilledDepartment={consultationPrefill.dept}
            prefilledSubject={consultationPrefill.subject}
            onInquirySubmitted={handleNewInquirySubmitted}
          />
        </EditableSectionWrapper>
      </main>

      {/* 10. Footer */}
      <EditableSectionWrapper
        sectionId="footer"
        labelFa="فوتر و اطلاعات پایانی"
        labelEn="Footer"
        isEditMode={canAccessAdmin && isPageEditMode}
        language={language}
        onEditSection={setActiveEditSection}
      >
        <Footer
          settings={siteSettings}
          isDark={isDark}
          language={language}
          navLinks={navLinks}
          sectionConfig={sectionsConfig.footer}
        />
      </EditableSectionWrapper>

      {/* Floating Bottom Toolbar when Page Edit Mode is Active (Admin Only) */}
      {canAccessAdmin && isPageEditMode && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl bg-[#091A42]/95 text-white border border-blue-500/40 rounded-2xl shadow-2xl px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 sm:p-2 rounded-xl bg-[#FD5202] text-white animate-pulse shrink-0">
              <MousePointerClick className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold truncate">
                {isRtl ? 'حالت تنظیمات صفحه فعال است (روی هر بخش کلیک کنید)' : 'Page Edit Mode Active'}
              </p>
              <p className="hidden sm:block text-[10px] text-[#A6D6FE]">
                {isRtl
                  ? 'روی هر بخش صفحه کلیک کنید تا متن، عکس، کلیدها و لینک‌های همان بخش باز شود'
                  : 'Click any section to customize text, photos, buttons & links'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUndoLastSectionEdit}
              disabled={sectionEditHistory.length === 0}
              title={
                sectionEditHistory.length > 0
                  ? isRtl
                    ? `بازگردانی آخرین تغییر (${SECTION_EDIT_LABELS[sectionEditHistory[sectionEditHistory.length - 1].sectionId].fa})`
                    : `Undo last change (${SECTION_EDIT_LABELS[sectionEditHistory[sectionEditHistory.length - 1].sectionId].en})`
                  : isRtl
                  ? 'تغییری برای بازگردانی ثبت نشده است'
                  : 'No edits to undo'
              }
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded-xl text-[11px] font-bold border transition-colors ${
                sectionEditHistory.length > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-white border-amber-400/50 cursor-pointer'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 opacity-50 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isRtl ? 'بازگردانی' : 'Undo'}</span>
              {sectionEditHistory.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/25 tabular-nums shrink-0">
                  {sectionEditHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveEditSection('header')}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded-xl bg-blue-900/90 hover:bg-[#144AE0] text-[11px] font-bold border border-blue-700 transition-colors cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-[#FD5202] shrink-0" />
              <span className="truncate">{isRtl ? 'لوگو و هدر' : 'Header'}</span>
            </button>

            <button
              onClick={() => handleOpenAdminWithTab('overview')}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded-xl bg-blue-950 hover:bg-blue-900 text-[11px] font-bold border border-blue-800 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#A6D6FE] shrink-0" />
              <span className="truncate">{isRtl ? 'پنل مدیریت' : 'Admin'}</span>
            </button>

            <button
              onClick={() => {
                setIsPageEditMode(false);
                setActiveEditSection(null);
              }}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-[11px] font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>{isRtl ? 'خروج' : 'Exit'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Visual Section Settings Modal (when clicking any section in Page Edit Mode - Admin Only) */}
      {canAccessAdmin && activeEditSection && (
        <SectionEditorModal
          isOpen={!!activeEditSection}
          sectionId={activeEditSection}
          language={language}
          settings={siteSettings}
          sectionsConfig={sectionsConfig}
          heroSlides={heroSlides}
          departments={departments}
          campaigns={campaigns}
          mediaItems={mediaItems}
          brandAssets={brandAssets}
          onUpdateSettings={handleUpdateSettings}
          onUpdateSectionsConfig={handleUpdateSectionsConfig}
          onUpdateSlides={handleUpdateSlides}
          onUpdateDepartments={handleUpdateDepartments}
          onUpdateCampaigns={handleUpdateCampaigns}
          onUpdateMediaItems={handleUpdateMediaItems}
          onArchiveAsset={handleArchiveAsset}
          onBeforeCommit={handleCaptureSectionSnapshot}
          onClose={() => setActiveEditSection(null)}
          onNotify={showPageToast}
        />
      )}

      {/* 11. Admin CMS Modal (Admin Only) */}
      {canAccessAdmin && isAdminOpen && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          language={language}
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
          isPageEditMode={isPageEditMode}
          onEnterPageEditMode={handleEnterPageEditFromAdmin}
          initialTab={adminInitialTab}
          heroSlides={heroSlides}
          onUpdateSlides={handleUpdateSlides}
          departments={departments}
          onUpdateDepartments={handleUpdateDepartments}
          sectionsConfig={sectionsConfig}
          onUpdateSectionsConfig={handleUpdateSectionsConfig}
          products={products}
          onUpdateProducts={handleUpdateProducts}
          sharpeningOrders={sharpeningOrders}
          onUpdateSharpeningOrders={handleUpdateSharpeningOrders}
          inquiries={inquiries}
          onUpdateInquiries={handleUpdateInquiries}
          mediaItems={mediaItems}
          onUpdateMediaItems={handleUpdateMediaItems}
          campaigns={campaigns}
          onUpdateCampaigns={handleUpdateCampaigns}
          campaignInquiries={campaignInquiries}
          onUpdateCampaignInquiries={handleUpdateCampaignInquiries}
          brandAssets={brandAssets}
          onUpdateBrandAssets={handleUpdateBrandAssets}
          onArchiveAsset={handleArchiveAsset}
          onPreviewCampaign={(camp) => {
            setIsAdminOpen(false);
            setActiveCampaignModal(camp);
          }}
          navLinks={navLinks}
          onUpdateNavLinks={handleUpdateNavLinks}
          settings={siteSettings}
          onUpdateSettings={handleUpdateSettings}
          onOpenUiThemePicker={() => setIsUiThemePickerOpen(true)}
          onPublishAllToCloud={handlePublishAllToCloud}
          cloudSyncing={cloudSyncing}
          onResetToDefaults={handleResetToDefaults}
        />
      )}

      {/* 12. Quick Consultation Modal */}
      {isConsultationOpen && (
        <ConsultationModal
          isOpen={isConsultationOpen}
          onClose={() => setIsConsultationOpen(false)}
          language={language}
          prefilledSubject={consultationPrefill.subject}
          onSubmitted={(inquiry) => {
            handleNewInquirySubmitted(inquiry);
          }}
        />
      )}

      {/* 13. Campaign Marketing Landing Page Modal */}
      {activeCampaignModal && (
        <CampaignLandingModal
          campaign={activeCampaignModal}
          isOpen={!!activeCampaignModal}
          onClose={() => setActiveCampaignModal(null)}
          language={language}
          settings={siteSettings}
          isDark={isDark}
          onRegisterInquiry={handleNewCampaignInquiry}
          linkedProduct={products.find((p) => p.id === activeCampaignModal.featuredMachineId)}
        />
      )}

      {/* 14. User Account & Real-Time Firestore Order Tracker Modal */}
      {isUserPortalOpen && (
        <UserPortalModal
          isOpen={isUserPortalOpen}
          onClose={() => setIsUserPortalOpen(false)}
          language={language}
          sharpeningOrders={sharpeningOrders}
          inquiries={inquiries}
          campaignInquiries={campaignInquiries}
          onOpenAdmin={canAccessAdmin ? () => handleOpenAdminWithTab('overview') : undefined}
        />
      )}

      {/* 15. Interactive UI & Button Theme Studio Modal (Admin Only: rcgroup.mdp@gmail.com) */}
      {canAccessAdmin && isUiThemePickerOpen && (
        <UiThemePickerModal
          isOpen={isUiThemePickerOpen}
          onClose={() => setIsUiThemePickerOpen(false)}
          language={language}
          settings={siteSettings}
          onApplySettings={handleUpdateSettings}
          canPublishCloud={canAccessAdmin}
        />
      )}
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('rcg_lang');
    return saved === 'en' || saved === 'fa' ? saved : 'fa';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rcg_theme');
    return saved === 'dark';
  });

  // Synchronize HTML dir & lang
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('rcg_lang', language);
  }, [language]);

  // Synchronize HTML dark class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rcg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rcg_theme', 'light');
    }
  }, [isDark]);

  return (
    <FirebaseProvider
      language={language}
      isDark={isDark}
      onHydratePreferences={(prefLang, prefTheme) => {
        setLanguage(prefLang);
        setIsDark(prefTheme === 'dark');
      }}
    >
      <AppContent
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        setIsDark={setIsDark}
      />
    </FirebaseProvider>
  );
}
