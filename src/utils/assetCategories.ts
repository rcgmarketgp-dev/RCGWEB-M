import { BrandAssetCategory } from '../types';

export interface AssetCategoryMeta {
  id: BrandAssetCategory;
  labelFa: string;
  labelEn: string;
}

export const ASSET_CATEGORIES: AssetCategoryMeta[] = [
  { id: 'logo', labelFa: 'لوگو و آرم‌ها', labelEn: 'Logos & Marks' },
  { id: 'hero', labelFa: 'اسلایدر و بنر اصلی', labelEn: 'Hero & Banners' },
  { id: 'departments', labelFa: 'ارکان ۴گانه و کارت‌ها', labelEn: 'Service Pillars' },
  { id: 'catalog', labelFa: 'ماشین‌آلات و ایستگاه‌ها', labelEn: 'Machinery & Stations' },
  { id: 'campaigns', labelFa: 'کمپین‌های فروش', labelEn: 'Campaigns' },
  { id: 'media', labelFa: 'اخبار و مقالات', labelEn: 'Media & Articles' },
  { id: 'photo', labelFa: 'تصاویر کارخانه و عمومی', labelEn: 'Industrial Photos' },
  { id: 'brandbook', labelFa: 'اسناد هویت بصری', labelEn: 'BrandBook Docs' },
  { id: 'certificate', labelFa: 'گواهینامه‌ها', labelEn: 'Certificates' },
];

export function getAssetCategoryLabel(category: BrandAssetCategory, isRtl: boolean): string {
  const found = ASSET_CATEGORIES.find((c) => c.id === category);
  if (!found) return category;
  return isRtl ? found.labelFa : found.labelEn;
}

export function isImageAssetUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('data:image/') ||
    /\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(url)
  );
}

export function formatAssetBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
