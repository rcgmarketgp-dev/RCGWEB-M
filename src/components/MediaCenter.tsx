import React, { useState } from 'react';
import { MediaItem, Language, SectionCustomization } from '../types';
import { translations } from '../utils/i18n';
import { Newspaper, BookOpen, Video, Briefcase, Calendar, Clock, User, ArrowLeft, ArrowRight, X, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MediaCenterProps {
  items: MediaItem[];
  language: Language;
  sectionConfig?: SectionCustomization;
}

export const MediaCenter: React.FC<MediaCenterProps> = ({ items, language, sectionConfig }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);

  const t = translations[language].media;
  const isRtl = language === 'fa';

  const tabs = [
    { id: 'all', label: t.all },
    { id: 'article', label: t.articles },
    { id: 'news', label: t.news },
    { id: 'project', label: t.projects },
  ];

  const activeItems = items.filter((item) => item.isActive !== false);

  const filteredItems = activeTab === 'all'
    ? activeItems
    : activeItems.filter((item) => item.type === activeTab);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="media" className="py-14 sm:py-20 lg:py-24 bg-slate-50 dark:bg-[#060F26] text-slate-900 dark:text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-500/30 text-[11px] sm:text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE]">
            <BookOpen className="w-3.5 h-3.5 text-[#FD5202]" />
            <span>{isRtl ? sectionConfig?.badgeFa || 'مرکز رسانه و مقالات تخصصی' : sectionConfig?.badgeEn || 'Media Center & Insights'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#091A42] dark:text-white">
            {isRtl ? sectionConfig?.titleFa || t.title : sectionConfig?.titleEn || t.title}
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl ? sectionConfig?.subtitleFa || t.subtitle : sectionConfig?.subtitleEn || t.subtitle}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-7 sm:mb-10 no-scrollbar"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#144AE0] border-[#144AE0] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {filteredItems.map((item, idx) => {
            const title = isRtl ? item.titleFa : item.titleEn;
            const summary = isRtl ? item.summaryFa : item.summaryEn;
            const date = isRtl ? item.dateFa : item.dateEn;
            const readTime = isRtl ? item.readTimeFa : item.readTimeEn;
            const typeLabel = isRtl ? item.typeFa : item.typeEn;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer bg-white dark:bg-[#091A42]/90 border border-slate-200 dark:border-blue-900/50 hover:border-[#144AE0] dark:hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-44 sm:h-52 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={item.image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-black/20" />

                  <span className="absolute top-3 rtl:right-3 ltr:left-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#FD5202] text-white shadow">
                    {typeLabel}
                  </span>
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{readTime}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#091A42] dark:text-white group-hover:text-[#FD5202] transition-colors leading-snug line-clamp-2">
                      {title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {summary}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-800/70 text-[10px] font-semibold text-[#144AE0] dark:text-[#A6D6FE]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE] group-hover:text-[#FD5202] transition-colors">
                    <span>{isRtl ? sectionConfig?.ctaTextFa || t.readMore : sectionConfig?.ctaTextEn || t.readMore}</span>
                    {isRtl ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Full Article Reader Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ArticleReaderModal
            item={selectedItem}
            language={language}
            copied={copied}
            shareLabel={t.share}
            onShare={handleShare}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

    </section>
  );
};

interface ArticleReaderModalProps {
  item: MediaItem;
  language: Language;
  copied: boolean;
  shareLabel: string;
  onShare: () => void;
  onClose: () => void;
}

const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  item,
  language,
  copied,
  shareLabel,
  onShare,
  onClose,
}) => {
  const isRtl = language === 'fa';
  const [readProgress, setReadProgress] = useState(0);

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setReadProgress(Math.min(1, Math.max(0, el.scrollTop / maxScroll)));
    } else {
      setReadProgress(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col text-slate-900 dark:text-white"
      >
        {/* Top Modal Reading Depth Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-20 bg-slate-900/30 pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#144AE0] to-[#FD5202]"
            animate={{ scaleX: readProgress }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{ transformOrigin: isRtl ? 'right center' : 'left center' }}
          />
        </div>

        <div className="relative h-44 sm:h-72 overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={isRtl ? item.titleFa : item.titleEn}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091A42] via-transparent to-black/40" />

          <button
            onClick={onClose}
            className="absolute top-3 rtl:left-3 ltr:right-3 sm:top-4 sm:rtl:left-4 sm:ltr:right-4 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-[#FD5202] text-white transition-colors border border-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 sm:bottom-4 px-4 sm:px-6 space-y-0.5 sm:space-y-1 inset-x-0">
            <span className="text-[11px] sm:text-xs font-bold text-[#FD5202] uppercase tracking-wider">
              {isRtl ? item.typeFa : item.typeEn}
            </span>
            <h3 className="text-base sm:text-2xl font-bold text-white leading-snug line-clamp-2">
              {isRtl ? item.titleFa : item.titleEn}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div
          onScroll={handleBodyScroll}
          className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 text-slate-700 dark:text-slate-200"
        >
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-slate-200 dark:border-blue-900/60 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
                <span>{isRtl ? item.authorFa : item.authorEn}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FD5202]" />
                <span>{isRtl ? item.dateFa : item.dateEn}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRtl ? item.readTimeFa : item.readTimeEn}</span>
              </span>
            </div>

            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 min-h-[38px] rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (isRtl ? 'لینک کپی شد' : 'Link Copied') : shareLabel}</span>
            </button>
          </div>

          {/* Lead Excerpt */}
          <p className="text-sm sm:text-base font-semibold text-[#144AE0] dark:text-[#A6D6FE] leading-relaxed">
            {isRtl ? item.summaryFa : item.summaryEn}
          </p>

          {/* Article Prose */}
          <div className="max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {isRtl ? item.contentFa : item.contentEn}
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-blue-900/50">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-800/70 text-[11px] font-semibold text-[#144AE0] dark:text-[#A6D6FE]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-blue-900/50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] text-xs font-bold text-white bg-[#091A42] hover:bg-[#144AE0] dark:bg-blue-900 dark:hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
          >
            {isRtl ? 'بستن پنجره' : 'Close Window'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
