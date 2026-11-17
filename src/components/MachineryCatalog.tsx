import React, { useState } from 'react';
import { Product, Language, SectionCustomization, SiteSettings } from '../types';
import { translations } from '../utils/i18n';
import { triggerCtaLink } from '../utils/ctaNavigation';
import { MachineShowcaseCard } from './MachineShowcaseCard';
import { ShieldCheck, Zap, FileText, PhoneCall, X, LayoutGrid, Award } from 'lucide-react';
import { GearSix, Toolbox } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

interface MachineryCatalogProps {
  products: Product[];
  language: Language;
  settings?: SiteSettings;
  isDark?: boolean;
  sectionConfig?: SectionCustomization;
  onInquireProduct: (productName: string) => void;
  onOpenMachineryManagement?: () => void;
}

export const MachineryCatalog: React.FC<MachineryCatalogProps> = ({
  products,
  language,
  settings,
  isDark = false,
  sectionConfig,
  onInquireProduct,
  onOpenMachineryManagement,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showcaseMode, setShowcaseMode] = useState<boolean>(true);

  const t = translations[language].catalog;
  const isRtl = language === 'fa';

  const categories = [
    { id: 'all', label: t.all },
    { id: 'edgebanders', label: t.edgebanders },
    { id: 'saws', label: t.saws },
    { id: 'cnc', label: t.cnc },
    { id: 'blades', label: t.blades },
    { id: 'refurbished', label: t.refurbished },
  ];

  const activeProducts = products.filter((p) => p.isActive !== false);

  const filteredProducts = activeCategory === 'all'
    ? activeProducts
    : activeProducts.filter((p) => p.category === activeCategory);

  return (
    <section id="catalog" className="py-14 sm:py-20 lg:py-24 bg-white dark:bg-[#060F26] text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3 sm:space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-500/30 text-[11px] sm:text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE]">
            <GearSix weight="duotone" className="w-4 h-4 text-[#FD5202]" />
            <span>{isRtl ? sectionConfig?.badgeFa || 'محصولات، تجهیزات و ماشین‌آلات' : sectionConfig?.badgeEn || 'Industrial Catalog & Machinery'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#091A42] dark:text-white">
            {isRtl ? sectionConfig?.titleFa || t.title : sectionConfig?.titleEn || t.title}
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl ? sectionConfig?.subtitleFa || t.subtitle : sectionConfig?.subtitleEn || t.subtitle}
          </p>

          {sectionConfig?.ctaTextFa && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  triggerCtaLink(sectionConfig?.ctaLink, () => onInquireProduct(isRtl ? 'کاتالوگ ماشین‌آلات' : 'Machinery Catalog'))
                }
                className="rcg-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{isRtl ? sectionConfig.ctaTextFa : sectionConfig.ctaTextEn || t.requestQuote}</span>
              </button>
            </div>
          )}

          {/* View Switcher & Direct Admin Management Link */}
          <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setShowcaseMode(true)}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 min-h-[40px] text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                showcaseMode
                  ? 'bg-[#091A42] dark:bg-[#144AE0] border-[#091A42] dark:border-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#FD5202] shrink-0" />
              <span className="truncate">{isRtl ? 'نمای پوستر معرفی دستگاه' : 'Showcase View'}</span>
            </button>

            <button
              onClick={() => setShowcaseMode(false)}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 min-h-[40px] text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                !showcaseMode
                  ? 'bg-[#091A42] dark:bg-[#144AE0] border-[#091A42] dark:border-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isRtl ? 'نمای شبکه‌ای کاتالوگ' : 'Grid View'}</span>
            </button>

            {onOpenMachineryManagement && (
              <button
                onClick={onOpenMachineryManagement}
                className="col-span-2 sm:col-auto flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold rounded-xl bg-orange-50 dark:bg-[#FD5202]/15 hover:bg-[#FD5202] text-[#FD5202] hover:text-white border border-orange-200 dark:border-[#FD5202]/40 transition-all cursor-pointer"
              >
                <Toolbox weight="duotone" className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'مدیریت دستگاه‌ها در پنل CMS' : 'Manage in CMS'}</span>
                <span className="font-mono text-[10px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full tabular-nums">
                  {products.length}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-7 sm:mb-10 no-scrollbar"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#144AE0] border-[#144AE0] text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* 1. Showcase Poster Mode OR 2. Standard Grid Mode */}
        {showcaseMode ? (
          <div className="space-y-8 sm:space-y-12">
            {filteredProducts.map((prod) => (
              <MachineShowcaseCard
                key={prod.id}
                product={prod}
                language={language}
                settings={settings}
                isDark={isDark}
                onInquire={onInquireProduct}
                onOpenSpecs={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filteredProducts.map((prod, idx) => {
              const title = isRtl ? prod.titleFa : prod.titleEn;
              const category = isRtl ? prod.categoryFa : prod.categoryEn;
              const condition = isRtl ? prod.conditionFa : prod.conditionEn;
              const price = isRtl ? prod.priceFa : prod.priceEn;
              const badge = isRtl ? prod.badgeFa : prod.badgeEn;

              return (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group bg-white dark:bg-[#091A42]/90 border border-slate-200 dark:border-blue-900/50 hover:border-[#144AE0] dark:hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Product Image */}
                  <div className="relative h-48 sm:h-56 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

                    <div className="absolute top-3 rtl:right-3 ltr:left-3 flex flex-col gap-1.5 items-start">
                      {badge && (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#FD5202] text-white shadow">
                          {badge}
                        </span>
                      )}
                      {prod.installmentAvailable && (
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-[#144AE0] text-white shadow">
                          {t.installmentTag}
                        </span>
                      )}
                    </div>

                    <span className="absolute top-3 rtl:left-3 ltr:right-3 text-[11px] font-mono text-white bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/15">
                      {prod.brand}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE]">
                        {category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#091A42] dark:text-white group-hover:text-[#FD5202] transition-colors leading-snug">
                        {title}
                      </h3>
                    </div>

                    {/* Specs Summary */}
                    <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-blue-900/50 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400">{t.powerLabel}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{prod.power}</span>
                      </div>
                      {prod.tableSize && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'ابعاد میز:' : 'Table Size:'}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{prod.tableSize}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400">{t.conditionLabel}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{condition}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[#144AE0] dark:text-[#A6D6FE] font-bold">
                        {price}
                      </p>
                      {prod.tags && prod.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {prod.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-blue-950/80 border border-slate-200 dark:border-blue-800/70 text-[10px] font-semibold text-slate-600 dark:text-[#A6D6FE]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="rcg-btn-secondary flex-1 min-h-[42px] py-2.5 px-3 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-[#091A42] dark:text-slate-100 text-center cursor-pointer"
                      >
                        {t.viewSpecs}
                      </button>
                      <button
                        onClick={() => onInquireProduct(title)}
                        className="rcg-btn-primary min-h-[42px] py-2.5 px-3.5 text-xs font-bold rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        title={t.requestQuote}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'استعلام' : 'Quote'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Specs Detail Modal with Motion Transition */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col text-slate-900 dark:text-white"
            >
              <div className="relative h-44 sm:h-56 bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={selectedProduct.image}
                  alt={isRtl ? selectedProduct.titleFa : selectedProduct.titleEn}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091A42] via-transparent to-black/40" />

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 rtl:left-3 ltr:right-3 sm:top-4 sm:rtl:left-4 sm:ltr:right-4 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-[#FD5202] text-white transition-colors border border-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 sm:bottom-4 px-4 sm:px-6 space-y-0.5 sm:space-y-1 inset-x-0">
                  <span className="text-[11px] sm:text-xs font-bold text-[#A6D6FE] block truncate">
                    {selectedProduct.brand} · {isRtl ? selectedProduct.categoryFa : selectedProduct.categoryEn}
                  </span>
                  <h3 className="text-base sm:text-2xl font-bold text-white line-clamp-2">
                    {isRtl ? selectedProduct.titleFa : selectedProduct.titleEn}
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm text-slate-700 dark:text-slate-200 flex-1">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.conditionLabel}</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {isRtl ? selectedProduct.conditionFa : selectedProduct.conditionEn}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.powerLabel}</span>
                    <p className="font-bold text-[#091A42] dark:text-white">{selectedProduct.power}</p>
                  </div>
                  <div className="col-span-2 sm:col-auto">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isRtl ? 'شرایط مالی' : 'Financing'}</span>
                    <p className="font-bold text-[#FD5202]">
                      {selectedProduct.installmentAvailable ? (isRtl ? 'فروش نقدی و اقساطی' : 'Cash & Installments') : (isRtl ? 'تحویل فوری' : 'Immediate')}
                    </p>
                  </div>
                </div>

                {/* Technical Specifications Table */}
                <div className="space-y-2.5 sm:space-y-3">
                  <h4 className="font-bold text-[#091A42] dark:text-white text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FD5202]" />
                    <span>{isRtl ? 'مشخصات فنی و استانداردهای کارخانه' : 'Technical Specifications'}</span>
                  </h4>
                  <div className="border border-slate-200 dark:border-blue-900/60 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-blue-900/40">
                    {(isRtl ? selectedProduct.specsFa : selectedProduct.specsEn).map((spec, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/40">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{spec.key}</span>
                        <span className="text-[#091A42] dark:text-white font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support & Warranty Notice */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FD5202] shrink-0" />
                    <span>{isRtl ? 'تضمین خدمات پس از فروش و تأمین قطعات RCG' : 'RCG Certified After-Sales & Spare Parts Guarantee'}</span>
                  </p>
                  <p className="leading-relaxed">
                    {isRtl
                      ? 'تمامی ماشین‌آلات مشمول نصب و راه‌اندازی رایگان توسط تیم مهندسی آرسی، آموزش کامل اپراتور، گارانتی معتبر و پشتیبانی قطعات یدکی می‌باشند.'
                      : 'All machinery includes free on-site commissioning by RCG engineering crew, operator training, certified warranties, and rapid spare parts availability.'}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-blue-900/50 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5 sm:gap-4 shrink-0">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 min-h-[42px] text-xs font-semibold rounded-xl border border-slate-200 dark:border-blue-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {isRtl ? 'بستن' : 'Close'}
                </button>

                <button
                  onClick={() => {
                    const prodName = isRtl ? selectedProduct.titleFa : selectedProduct.titleEn;
                    setSelectedProduct(null);
                    onInquireProduct(prodName);
                  }}
                  className="rcg-btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 min-h-[42px] text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#FD5202] to-[#E04600] hover:from-[#E04600] hover:to-[#C03C00] rounded-xl shadow-md whitespace-nowrap cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.requestQuote}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
