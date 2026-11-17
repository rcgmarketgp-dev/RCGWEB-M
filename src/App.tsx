/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { EditableSectionWrapper } from './components/EditableSectionWrapper';
import { SectionEditorModal } from './components/SectionEditorModal';
import { MousePointerClick, Shield, Palette, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Language state (defaults to Persian 'fa')
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('rcg_lang');
    return saved === 'en' || saved === 'fa' ? saved : 'fa';
  });

  // 2. Theme state (defaults to Light Corporate style per authoritative brand redesign)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rcg_theme');
    return saved === 'dark';
  });

  // 3. Modals & Live Page Edit Mode state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('overview');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationPrefill, setConsultationPrefill] = useState<{ dept?: string; subject?: string }>({});

  const [isPageEditMode, setIsPageEditMode] = useState(false);
  const [activeEditSection, setActiveEditSection] = useState<SectionId | null>(null);
  const [pageToast, setPageToast] = useState<string | null>(null);

  const showPageToast = (msg: string) => {
    setPageToast(msg);
    setTimeout(() => setPageToast(null), 3200);
  };

  const handleOpenAdminWithTab = (tab: AdminTab) => {
    setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  const handleTogglePageEditMode = () => {
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

  // 4. CMS Data states with localStorage persistence
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

  // Persistence Handlers
  const handleUpdateSlides = (newSlides: HeroSlide[]) => {
    setHeroSlides(newSlides);
    localStorage.setItem('rcg_slides', JSON.stringify(newSlides));
  };

  const handleUpdateDepartments = (newDepts: Department[]) => {
    setDepartments(newDepts);
    localStorage.setItem('rcg_departments', JSON.stringify(newDepts));
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('rcg_products', JSON.stringify(newProducts));
  };

  const handleUpdateSharpeningOrders = (newOrders: SharpeningOrder[]) => {
    setSharpeningOrders(newOrders);
    localStorage.setItem('rcg_sharpening_orders', JSON.stringify(newOrders));
  };

  const handleUpdateInquiries = (newInquiries: Inquiry[]) => {
    setInquiries(newInquiries);
    localStorage.setItem('rcg_inquiries', JSON.stringify(newInquiries));
  };

  const handleUpdateMediaItems = (newItems: MediaItem[]) => {
    setMediaItems(newItems);
    localStorage.setItem('rcg_media', JSON.stringify(newItems));
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    localStorage.setItem('rcg_settings', JSON.stringify(newSettings));
  };

  const handleUpdateCampaigns = (newCampaigns: CampaignLanding[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('rcg_campaigns', JSON.stringify(newCampaigns));
  };

  const handleUpdateCampaignInquiries = (newInqs: CampaignInquiry[]) => {
    setCampaignInquiries(newInqs);
    localStorage.setItem('rcg_campaign_inquiries', JSON.stringify(newInqs));
  };

  const handleUpdateBrandAssets = (newAssets: BrandAsset[]) => {
    setBrandAssets(newAssets);
    localStorage.setItem('rcg_brand_assets', JSON.stringify(newAssets));
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
      return next;
    });
  };

  const handleUpdateNavLinks = (newLinks: NavLinkItem[]) => {
    setNavLinks(newLinks);
    localStorage.setItem('rcg_nav_links', JSON.stringify(newLinks));
  };

  const handleUpdateSectionsConfig = (newConfig: SiteSectionsConfig) => {
    setSectionsConfig(newConfig);
    localStorage.setItem('rcg_section_configs', JSON.stringify(newConfig));
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

  // User Actions
  const handleNewOrderCreated = (order: SharpeningOrder) => {
    handleUpdateSharpeningOrders([order, ...sharpeningOrders]);
  };

  const handleNewInquirySubmitted = (inquiry: Inquiry) => {
    handleUpdateInquiries([inquiry, ...inquiries]);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#060F26] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#FD5202] selection:text-white transition-colors duration-200">
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
        onLanguageChange={setLanguage}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        navLinks={navLinks}
        settings={siteSettings}
        isPageEditMode={isPageEditMode}
        onTogglePageEditMode={handleTogglePageEditMode}
        onEditHeaderSection={() => setActiveEditSection('header')}
        onOpenAdmin={() => handleOpenAdminWithTab('overview')}
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
          isEditMode={isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <Hero
            slides={heroSlides}
            language={language}
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
          isEditMode={isPageEditMode}
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
          isEditMode={isPageEditMode}
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
            onOpenMachineryManagement={() => handleOpenAdminWithTab('catalog')}
          />
        </EditableSectionWrapper>

        {/* 5. Campaign Marketing Landing Pages Showcase */}
        <EditableSectionWrapper
          sectionId="campaigns"
          labelFa="کمپین‌های بازاریابی"
          labelEn="Campaigns"
          isEditMode={isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <CampaignsSection
            campaigns={campaigns}
            language={language}
            sectionConfig={sectionsConfig.campaigns}
            onSelectCampaign={setActiveCampaignModal}
          />
        </EditableSectionWrapper>

        {/* 6. Online Saw Blade Sharpening Calculator */}
        <EditableSectionWrapper
          sectionId="calculator"
          labelFa="محاسبه‌گر تیزکاری"
          labelEn="Sharpening Calculator"
          isEditMode={isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <SharpeningCalculator
            language={language}
            sectionConfig={sectionsConfig.calculator}
            onOrderCreated={handleNewOrderCreated}
          />
        </EditableSectionWrapper>

        {/* 7. Media Center & Technical Insights */}
        <EditableSectionWrapper
          sectionId="media"
          labelFa="مرکز رسانه و مقالات"
          labelEn="Media Center"
          isEditMode={isPageEditMode}
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
          isEditMode={isPageEditMode}
          language={language}
          onEditSection={setActiveEditSection}
        >
          <AboutSection
            language={language}
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
          isEditMode={isPageEditMode}
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
        isEditMode={isPageEditMode}
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

      {/* Floating Bottom Toolbar when Page Edit Mode is Active */}
      {isPageEditMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-[#091A42]/95 text-white border border-blue-500/40 rounded-2xl shadow-2xl px-4 py-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FD5202] text-white animate-pulse">
              <MousePointerClick className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-extrabold">
                {isRtl ? 'حالت تنظیمات صفحه فعال است' : 'Page Edit Mode Active'}
              </p>
              <p className="text-[10px] text-[#A6D6FE]">
                {isRtl
                  ? 'روی هر بخش صفحه کلیک کنید تا متن، عکس، کلیدها و لینک‌های همان بخش باز شود'
                  : 'Click any section to customize text, photos, buttons & links'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveEditSection('header')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/90 hover:bg-[#144AE0] text-[11px] font-bold border border-blue-700 transition-colors cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-[#FD5202]" />
              <span>{isRtl ? 'لوگو و هدر' : 'Header Logo'}</span>
            </button>

            <button
              onClick={() => handleOpenAdminWithTab('overview')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-[11px] font-bold border border-blue-800 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#A6D6FE]" />
              <span>{isRtl ? 'پنل مدیریت' : 'Admin CMS'}</span>
            </button>

            <button
              onClick={() => {
                setIsPageEditMode(false);
                setActiveEditSection(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-[11px] font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isRtl ? 'خروج' : 'Exit'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Visual Section Settings Modal (when clicking any section in Page Edit Mode) */}
      {activeEditSection && (
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
          onClose={() => setActiveEditSection(null)}
          onNotify={showPageToast}
        />
      )}

      {/* 11. Admin CMS Modal */}
      {isAdminOpen && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          language={language}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
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
          onRegisterInquiry={(inq) => {
            handleUpdateCampaignInquiries([inq, ...campaignInquiries]);
          }}
          linkedProduct={products.find((p) => p.id === activeCampaignModal.featuredMachineId)}
        />
      )}
    </div>
  );
}
