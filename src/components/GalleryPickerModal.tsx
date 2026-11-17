import React, { useState } from 'react';
import { BrandAsset, BrandAssetCategory, Language } from '../types';
import {
  ASSET_CATEGORIES,
  getAssetCategoryLabel,
  isImageAssetUrl,
} from '../utils/assetCategories';
import { X, Search, Check, Image as ImageIcon } from 'lucide-react';

interface GalleryPickerModalProps {
  isOpen: boolean;
  assets: BrandAsset[];
  language: Language;
  defaultCategory?: BrandAssetCategory | 'all';
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({
  isOpen,
  assets,
  language,
  defaultCategory = 'all',
  onSelect,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BrandAssetCategory | 'all'>(
    defaultCategory
  );
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const isRtl = language === 'fa';
  const imageAssets = assets.filter((a) => isImageAssetUrl(a.url));
  const q = search.trim().toLowerCase();

  const filtered = imageAssets.filter((a) => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchQuery =
      !q ||
      a.titleFa.toLowerCase().includes(q) ||
      a.titleEn.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#144AE0] text-white">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#091A42] dark:text-white">
                {isRtl ? 'انتخاب تصویر از گالری بایگانی‌شده RCG' : 'Pick Image from RCG Media Archive'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#A6D6FE]">
                {isRtl
                  ? 'تمامی تصاویر آپلودشده به صورت دسته‌بندی‌شده در اینجا بایگانی می‌شوند'
                  : 'All uploaded photos are automatically archived here by category'}
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

        {/* Filters */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-blue-900/50 space-y-3 bg-white dark:bg-[#091A42] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? 'جستجو در عنوان تصاویر...' : 'Search archived images...'}
              className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 rounded-xl rtl:pr-9 ltr:pl-9 py-2 text-xs text-slate-900 dark:text-white focus:border-[#FD5202] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#144AE0] text-white border-[#144AE0]'
                  : 'bg-slate-100 dark:bg-[#060F26] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-900'
              }`}
            >
              {isRtl ? `همه (${imageAssets.length})` : `All (${imageAssets.length})`}
            </button>

            {ASSET_CATEGORIES.filter((c) => c.id !== 'brandbook').map((cat) => {
              const count = imageAssets.filter((a) => a.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer border ${
                    selectedCategory === cat.id
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

        {/* Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-[#050C1F]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'تصویری در این دسته‌بندی یافت نشد.'
                : 'No images found in this category.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onSelect(asset.url);
                    onClose();
                  }}
                  className="group text-right rtl:text-right ltr:text-left rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 hover:border-[#FD5202] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    <img
                      src={asset.url}
                      alt={isRtl ? asset.titleFa : asset.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 rtl:right-2 ltr:left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {getAssetCategoryLabel(asset.category, isRtl)}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-[#091A42]/50 flex items-center justify-center">
                      <span className="px-3 py-1 rounded-xl bg-[#FD5202] text-white text-[11px] font-bold flex items-center gap-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'انتخاب' : 'Select'}</span>
                      </span>
                    </span>
                  </div>

                  <div className="p-2.5 space-y-0.5">
                    <p className="text-[11px] font-bold text-[#091A42] dark:text-white line-clamp-1">
                      {isRtl ? asset.titleFa : asset.titleEn}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {asset.fileSize}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
