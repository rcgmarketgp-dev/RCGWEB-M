import React, { useState } from 'react';
import { Product, Language } from '../types';
import { RcgLogo } from './RcgLogo';
import { Calendar, Phone, Check, Star, Wrench, Settings, Users, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface MachineShowcaseCardProps {
  product: Product;
  language: Language;
  onInquire: (productName: string) => void;
  onOpenSpecs: (product: Product) => void;
}

export const MachineShowcaseCard: React.FC<MachineShowcaseCardProps> = ({
  product,
  language,
  onInquire,
  onOpenSpecs,
}) => {
  const isRtl = language === 'fa';
  const [selectedStationImg, setSelectedStationImg] = useState<string | null>(null);

  // Dynamic station thumbnails corresponding to woodworking machine components
  const stations = product.stations && product.stations.length > 0 ? product.stations : [
    {
      titleFa: 'ایستگاه چسب و نواردهی',
      titleEn: 'Glue Pot & Tape Feed',
      img: '/assets/aistudio/file_0000000045ac81f49bc5e19e902c864a_0796f548.png',
    },
    {
      titleFa: 'غلتک‌های فشار و موتور فرز',
      titleEn: 'Pressure Rollers & Trimmer',
      img: '/assets/aistudio/file_000000002c78824384157c7938ba7f05_85caf837.png',
    },
    {
      titleFa: 'ریل و زنجیر نقاله مقاوم',
      titleEn: 'Conveyor Track & Bed',
      img: '/assets/aistudio/file_0000000045ac81f49bc5e19e902c864a_0796f548.png',
    },
    {
      titleFa: 'ایستگاه خروجی و پرداخت',
      titleEn: 'Outfeed & Buffing Unit',
      img: '/assets/aistudio/file_000000002c78824384157c7938ba7f05_85caf837.png',
    },
  ];

  const precision = product.precisionRating ?? 98;
  const durability = product.durabilityRating ?? 97;
  const efficiency = product.efficiencyRating ?? 95;

  // Extract checks and down payment numbers if present
  const checkCount = product.installmentChecksFa ? product.installmentChecksFa.replace(/[^0-9]/g, '') || '16' : '16';
  const downPaymentPercent = product.downPaymentFa ? product.downPaymentFa.replace(/[^0-9]/g, '') || '40' : '40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F6] dark:from-[#091A42] dark:to-[#060F26] text-slate-900 dark:text-white rounded-3xl border-2 border-blue-200 dark:border-blue-900/60 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 select-none"
    >
      
      {/* 1. Header Section matching poster top */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-200 dark:border-blue-900/50 pb-5">
        
        {/* RCG Logo Lockup */}
        <div className="shrink-0">
          <RcgLogo
            variant="color"
            height={36}
            showSubtitle={true}
            subtitleType={isRtl ? 'full' : 'en'}
          />
        </div>

        {/* Machine Title & Badges */}
        <div className="flex flex-col items-start sm:items-end space-y-1.5 rtl:sm:items-start ltr:sm:items-end">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-[#144AE0] dark:text-[#A6D6FE]">
              {isRtl ? product.categoryFa : product.categoryEn}
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#091A42] dark:bg-[#144AE0] text-white font-mono font-bold text-sm shadow-md">
              {product.model}
            </span>
          </div>

          <p className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
            {product.brand}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#FD5202]" />
            <span>{isRtl ? product.conditionFa : product.conditionEn}</span>
          </div>
        </div>

      </div>

      {/* 2. Hero Machine Centerpiece with Scalloped Quality Seal */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-950/70 border border-blue-100 dark:border-blue-900/40 p-4 sm:p-6 shadow-inner">
        
        {/* Machine Main Photo */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center overflow-hidden rounded-xl">
          <img
            src={product.image}
            alt={isRtl ? product.titleFa : product.titleEn}
            className="w-full h-full object-contain sm:object-cover transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Quality Seal Badge (Exact replica of circular badge in user photo) */}
          <div className="absolute bottom-2 rtl:left-2 ltr:right-2 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#091A42] to-[#144AE0] text-white p-3 flex flex-col items-center justify-center text-center shadow-2xl border-2 border-white/60 dark:border-blue-300/40 transform hover:rotate-6 transition-transform">
            <div className="flex items-center gap-0.5 text-amber-300 text-[10px] mb-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-300" />
              <Star className="w-2.5 h-2.5 fill-amber-300" />
              <Star className="w-2.5 h-2.5 fill-amber-300" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-black leading-tight">
              {isRtl ? 'دستگاهی با کیفیت و قابل اعتماد' : 'Certified High Reliability'}
            </p>
            <div className="mt-1 p-0.5 rounded-full bg-white/20 text-white">
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Section Divider: جزئیات و کیفیت در هر بخش (with dot matrix accents) */}
      <div className="flex items-center justify-center gap-4 py-1">
        <div className="flex items-center gap-1 text-blue-400 dark:text-blue-600 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>

        <div className="px-5 py-1.5 rounded-full bg-[#144AE0] text-white font-bold text-xs sm:text-sm shadow-md">
          {isRtl ? 'جزئیات و کیفیت در هر بخش' : 'Details & Quality in Every Station'}
        </div>

        <div className="flex items-center gap-1 text-blue-400 dark:text-blue-600 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>
      </div>

      {/* 4 Thumbnails Gallery of Internal Stations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stations.map((st, i) => (
          <div
            key={i}
            className="group relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 aspect-[4/3] cursor-pointer shadow-sm hover:shadow-md transition-all"
            onClick={() => onOpenSpecs(product)}
          >
            <img
              src={st.img}
              alt={isRtl ? st.titleFa : st.titleEn}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] font-bold text-white line-clamp-1">
                {isRtl ? st.titleFa : st.titleEn}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Performance Metric Progress Bars */}
      <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-200 dark:border-blue-900/50 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-[#FD5202]" />
            {isRtl ? 'شاخص‌های فنی و کیفیت ساخت RCG' : 'RCG Engineering Performance Metrics'}
          </span>
          <span className="font-mono text-xs text-[#144AE0] dark:text-[#A6D6FE]">
            {product.feedSpeed ? `${isRtl ? 'سرعت:' : 'Speed:'} ${product.feedSpeed}` : (isRtl ? 'استاندارد صنعتی' : 'Industrial Standard')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Precision Level */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
              <span>{isRtl ? 'دقت کالیبراسیون' : 'Precision Level'}</span>
              <span className="font-mono font-bold text-[#144AE0] dark:text-[#A6D6FE]">{precision}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-[#144AE0] rounded-full transition-all duration-1000"
                style={{ width: `${precision}%` }}
              />
            </div>
          </div>

          {/* 2. Durability Rating */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
              <span>{isRtl ? 'استقامت شاسی و بدنه' : 'Durability Rating'}</span>
              <span className="font-mono font-bold text-[#FD5202]">{durability}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-[#FD5202] rounded-full transition-all duration-1000"
                style={{ width: `${durability}%` }}
              />
            </div>
          </div>

          {/* 3. Energy Efficiency */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
              <span>{isRtl ? 'راندمان موتور و مصرف' : 'Motor Efficiency'}</span>
              <span className="font-mono font-bold text-emerald-500 dark:text-emerald-400">{efficiency}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${efficiency}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payment Terms & Call Action Box (Matching poster bottom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Left Card: شرایط پرداخت */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#060F26] border-2 border-blue-400/50 dark:border-blue-800 text-center relative overflow-hidden shadow-md flex flex-col justify-between">
          <div className="inline-block self-center px-4 py-1 rounded-full bg-[#144AE0] text-white text-[11px] font-bold mb-2">
            {isRtl ? 'شرایط پرداخت:' : 'Payment Terms:'}
          </div>

          <div className="flex items-center justify-center gap-3 py-1 font-mono text-slate-800 dark:text-white">
            <div className="text-center">
              <span className="text-2xl font-black text-[#144AE0] dark:text-[#A6D6FE]">{checkCount}</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{isRtl ? 'فقره چک' : 'Checks'}</p>
            </div>
            <span className="text-2xl font-light text-slate-400">+</span>
            <div className="text-center">
              <span className="text-2xl font-black text-[#FD5202]">{downPaymentPercent}%</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{isRtl ? 'پیش‌پرداخت' : 'Down Payment'}</p>
            </div>
          </div>
        </div>

        {/* Right Card: Contact & Inspection Advisory */}
        <div 
          onClick={() => onInquire(isRtl ? product.titleFa : product.titleEn)}
          className="p-4 rounded-2xl bg-white dark:bg-[#060F26] border-2 border-blue-400/50 dark:border-blue-800 hover:border-[#FD5202] text-center sm:text-right rtl:sm:text-right ltr:sm:text-left shadow-md flex items-center justify-between gap-3 cursor-pointer group transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#FD5202] transition-colors leading-snug">
              {isRtl
                ? 'برای دریافت اطلاعات بیشتر و هماهنگی بازدید، با ما در ارتباط باشید.'
                : 'Contact us for technical inquiry and to schedule an inspection.'}
            </p>
            <span className="inline-block text-[11px] font-bold text-[#144AE0] dark:text-[#A6D6FE]">
              {isRtl ? 'هماهنگی بازدید و استعلام روز ←' : 'Inquire & Schedule →'}
            </span>
          </div>

          <div className="w-12 h-12 rounded-full bg-[#144AE0] group-hover:bg-[#FD5202] text-white flex items-center justify-center shrink-0 shadow-lg transition-colors">
            <Phone className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 5. Bottom Capability Strip with 4 Pillars */}
      <div className="pt-4 border-t border-blue-200 dark:border-blue-900/50 grid grid-cols-4 divide-x rtl:divide-x-reverse divide-blue-200 dark:divide-blue-900/60 text-center text-xs">
        <div className="px-2 space-y-1">
          <Wrench className="w-4 h-4 mx-auto text-[#144AE0] dark:text-[#A6D6FE]" />
          <p className="font-bold text-[11px]">{isRtl ? 'نصب و راه‌اندازی' : 'Setup'}</p>
        </div>
        <div className="px-2 space-y-1">
          <Settings className="w-4 h-4 mx-auto text-[#144AE0] dark:text-[#A6D6FE]" />
          <p className="font-bold text-[11px]">{isRtl ? 'قطعات یدکی' : 'Spares'}</p>
        </div>
        <div className="px-2 space-y-1">
          <ShieldCheck className="w-4 h-4 mx-auto text-[#144AE0] dark:text-[#A6D6FE]" />
          <p className="font-bold text-[11px]">{isRtl ? 'خدمات پس از فروش' : 'Warranty'}</p>
        </div>
        <div className="px-2 space-y-1">
          <Users className="w-4 h-4 mx-auto text-[#144AE0] dark:text-[#A6D6FE]" />
          <p className="font-bold text-[11px]">{isRtl ? 'مشاوره تخصصی' : 'Advisory'}</p>
        </div>
      </div>

    </motion.div>
  );
};
