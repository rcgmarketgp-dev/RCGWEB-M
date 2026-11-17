import React, { useState } from 'react';
import { CampaignLanding, CampaignInquiry, Language, Product, SiteSettings } from '../types';
import { RcgLogo } from './RcgLogo';
import { useForm } from 'react-hook-form';
import {
  Sparkles, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, Clock,
  Award, Download, Share2, ChevronLeft, ChevronRight,
  Send, Check, Star, Percent, PackageCheck, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface CampaignLandingModalProps {
  campaign: CampaignLanding;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings?: SiteSettings;
  isDark?: boolean;
  onRegisterInquiry: (inquiry: CampaignInquiry) => void;
  linkedProduct?: Product;
}

interface CampaignFormInputs {
  fullName: string;
  phone: string;
  city: string;
  workshopType: string;
  paymentPreference: 'installment' | 'cash' | 'lease';
}

export const CampaignLandingModal: React.FC<CampaignLandingModalProps> = ({
  campaign,
  isOpen,
  onClose,
  language,
  settings,
  isDark = false,
  onRegisterInquiry,
}) => {
  const isRtl = language === 'fa';
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CampaignFormInputs>({
    defaultValues: {
      fullName: '',
      phone: '',
      city: '',
      workshopType: 'کارگاه کابینت و دکوراسیون',
      paymentPreference: 'installment',
    },
  });

  const paymentPreference = watch('paymentPreference');

  if (!isOpen) return null;

  const onSubmit = (data: CampaignFormInputs) => {
    const newInq: CampaignInquiry = {
      id: `CMP-INQ-${Math.floor(100 + Math.random() * 900)}`,
      campaignId: campaign.id,
      campaignTitle: isRtl ? campaign.titleFa : campaign.titleEn,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      city: data.city.trim() || (isRtl ? 'رشت / گیلان' : 'Gilan'),
      workshopType: data.workshopType,
      interestedMachine: isRtl ? campaign.headlineFa : campaign.headlineEn,
      paymentPreference: data.paymentPreference,
      status: 'new',
      createdAt: new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: isRtl ? 'ثبت‌نام از طریق صفحه فرود اختصاصی کمپین RCG' : 'Registered via official RCG campaign landing',
    };

    setSubmittedPhone(data.phone.trim());
    onRegisterInquiry(newInq);
    setIsSubmitted(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('campaign-registration-box');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50/98 dark:bg-slate-950/98 backdrop-blur-xl text-slate-900 dark:text-white animate-in fade-in duration-200">
      {/* Top Banner Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#060F26]/95 backdrop-blur-md border-b border-slate-200 dark:border-blue-900/50 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <RcgLogo
            settings={settings}
            isDark={isDark}
            surface="auto"
            heightScale={0.88}
            showSubtitle={false}
          />
          <div className="h-5 w-px bg-slate-200 dark:bg-blue-900/60 hidden sm:block" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-[#FD5202]/15 text-[#FD5202] border border-orange-200 dark:border-[#FD5202]/30">
            <Sparkles className="w-3 h-3" />
            <span>{isRtl ? 'صفحه فرود رسمی کمپین RCG' : 'Official RCG Campaign'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[#144AE0] transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? (isRtl ? 'لینک کپی شد' : 'Copied!') : (isRtl ? 'اشتراک لینک' : 'Share')}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#091A42] hover:bg-[#FD5202] dark:bg-slate-800 dark:hover:bg-[#FD5202] text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
          >
            <span>{isRtl ? 'بازگشت به سایت اصلی' : 'Back to Main Site'}</span>
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Campaign Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-blue-800/40 bg-white dark:bg-gradient-to-br dark:from-[#091A42] dark:via-[#060F26] dark:to-[#040A1A] p-6 sm:p-10 lg:p-12 shadow-xl">
          <div className="absolute inset-0 opacity-30 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left/Right Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-[#FD5202]/20 border border-orange-200 dark:border-[#FD5202]/40 text-xs font-black text-[#FD5202] tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>{isRtl ? campaign.badgeFa : campaign.badgeEn}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#091A42] dark:text-white leading-tight tracking-tight">
                  {isRtl ? campaign.headlineFa : campaign.headlineEn}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl ? campaign.subheadlineFa : campaign.subheadlineEn}
                </p>
              </div>

              {/* Special Offer Box */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-gradient-to-r dark:from-[#FD5202]/15 dark:via-[#144AE0]/15 dark:to-transparent border border-blue-200 dark:border-[#FD5202]/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FD5202] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE]">
                    {isRtl ? 'شرایط ویژه جشنواره RCG' : 'Exclusive Festival Terms'}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#091A42] dark:text-white">
                    {isRtl ? campaign.specialOfferFa : campaign.specialOfferEn}
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToForm}
                  className="px-6 py-3.5 rounded-2xl bg-[#FD5202] hover:bg-[#E04600] text-white text-sm sm:text-base font-black shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <span>{isRtl ? campaign.ctaTextFa : campaign.ctaTextEn}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </motion.button>

                <a
                  href="/assets/aistudio/RCG_BrandBook_compressed_2221a68b.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-[#091A42] dark:text-slate-200 border border-slate-200 dark:border-blue-900/60 text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
                  <span>{isRtl ? campaign.secondaryCtaFa : campaign.secondaryCtaEn}</span>
                </a>
              </div>

              {/* Trust Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{isRtl ? campaign.warrantyFa : campaign.warrantyEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE] shrink-0" />
                  <span>{isRtl ? campaign.deliveryTermsFa : campaign.deliveryTermsEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isRtl ? 'نمایندگی رسمی پایون چوب' : 'Authorized Payon Dealer'}</span>
                </div>
              </div>
            </div>

            {/* Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-blue-500/30 shadow-2xl bg-slate-950 aspect-[4/3] group">
                <img
                  src={campaign.heroImage}
                  alt={isRtl ? campaign.titleFa : campaign.titleEn}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/50 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-white">
                    {isRtl ? 'پیشنهاد ویژه ماه' : 'Featured Offer'}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      {isRtl ? 'تسهیلات پرداختی' : 'Financing Terms'}
                    </div>
                    <div className="text-sm font-black text-[#FD5202]">
                      {isRtl ? campaign.installmentsCountFa : campaign.installmentsCountEn}
                    </div>
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left">
                    <div className="text-[11px] text-slate-400">
                      {isRtl ? 'پیش‌پرداخت نقدی' : 'Down Payment'}
                    </div>
                    <div className="text-sm font-black text-white">
                      {isRtl ? campaign.downPaymentFa : campaign.downPaymentEn}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#091A42] dark:text-white">
              {isRtl ? 'مزایای تخصصی و تضمین‌های این کمپین' : 'Key Advantages & Guarantees'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {isRtl
                ? 'تضمین اصالت قطعات، آزمون کارکرد زیر بار و پشتیبانی فنی مستقیم در سراسر کشور'
                : 'Genuine parts verification, live load testing, and direct engineering support.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isRtl ? campaign.highlightsFa : campaign.highlightsEn).map((hl, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/50 hover:border-[#FD5202]/60 transition-all flex items-start gap-3.5 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-[#FD5202]/15 border border-orange-200 dark:border-[#FD5202]/40 text-[#FD5202] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE] tabular-nums">
                    {isRtl ? `مزیت شماره ۰${idx + 1}` : `Key Advantage 0${idx + 1}`}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {hl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conversion Registration Form powered by React Hook Form */}
        <section
          id="campaign-registration-box"
          className="rounded-3xl border border-slate-200 dark:border-[#FD5202]/40 bg-white dark:bg-gradient-to-b dark:from-[#091A42] dark:to-[#060F26] p-6 sm:p-10 shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{isRtl ? 'ثبت‌نام سریع با اولویت رسیدگی' : 'Priority Processing'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#091A42] dark:text-white">
                {isRtl ? campaign.registrationTitleFa : campaign.registrationTitleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                {isRtl ? campaign.registrationSubtitleFa : campaign.registrationSubtitleEn}
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/50 p-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-xl font-black text-emerald-950 dark:text-white">
                  {isRtl ? 'درخواست شما با موفقیت ثبت گردید!' : 'Registration Completed Successfully!'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-slate-200 max-w-md mx-auto leading-relaxed">
                  {isRtl
                    ? `کارشناس فنی واحد بازرگانی آرسی به‌زودی با شماره ${submittedPhone} جهت هماهنگی بازدید و ارسال پیش‌فاکتور تماس می‌گیرد.`
                    : `Our technical sales advisor will contact you at ${submittedPhone} promptly with an official pro-forma invoice.`}
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    reset();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {isRtl ? 'ثبت درخواست جدید' : 'Register Another Request'}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                      <span>{isRtl ? 'نام و نام خانوادگی / نام کارگاه' : 'Full Name / Owner Name'}</span>
                      <span className="text-[#FD5202]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('fullName', {
                        required: isRtl ? 'وارد کردن نام الزامی است' : 'Full name is required',
                        minLength: { value: 3, message: isRtl ? 'حداقل ۳ کاراکتر وارد کنید' : 'Minimum 3 characters' },
                      })}
                      placeholder={isRtl ? 'مثال: کامران رضایی' : 'e.g. John Doe'}
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none transition-colors"
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.fullName.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                      <span>{isRtl ? 'شماره تماس مستقیم (همراه)' : 'Direct Mobile Phone'}</span>
                      <span className="text-[#FD5202]">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('phone', {
                        required: isRtl ? 'شماره تماس الزامی است' : 'Phone number is required',
                        pattern: {
                          value: /^[0-9+\-\s]{8,15}$/,
                          message: isRtl ? 'شماره تماس معتبر نیست (حداقل ۸ رقم)' : 'Invalid phone format',
                        },
                      })}
                      placeholder="0911..."
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none transition-colors font-mono"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.phone.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">
                      {isRtl ? 'شهر / استان محل کارگاه' : 'City / Workshop Location'}
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder={isRtl ? 'رشت، لاهیجان، ساری، بابل...' : 'Rasht, Sari...'}
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">
                      {isRtl ? 'نوع کارگاه یا حوزه فعالیت' : 'Workshop Field'}
                    </label>
                    <select
                      {...register('workshopType')}
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none transition-colors"
                    >
                      <option value="کارگاه کابینت و دکوراسیون">{isRtl ? 'کارگاه کابینت و دکوراسیون MDF' : 'Cabinet & MDF Workshop'}</option>
                      <option value="کارخانه تولید مصنوعات چوبی">{isRtl ? 'کارخانه صنایع چوب و مبلمان' : 'Furniture & Wood Factory'}</option>
                      <option value="کارگاه خدمات برش و پی‌وی‌سی">{isRtl ? 'خدمات برش، دورکن و PVC' : 'Sawing & Edgebanding Services'}</option>
                      <option value="تولیدی درب و پنجره">{isRtl ? 'تولیدی درب و پنجره و چارچوب' : 'Door & Window Production'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block">
                    {isRtl ? 'ترجیح نحوه پرداخت و تسویه:' : 'Preferred Payment Option:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                        paymentPreference === 'installment'
                          ? 'border-[#FD5202] bg-orange-50 dark:bg-[#FD5202]/15 text-[#091A42] dark:text-white font-bold'
                          : 'border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-[#060F26] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input type="radio" value="installment" {...register('paymentPreference')} className="accent-[#FD5202]" />
                      <span className="text-xs font-bold">{isRtl ? 'تسهیلات اقساطی ۱۶ ماهه' : '16-Month Installments'}</span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                        paymentPreference === 'cash'
                          ? 'border-[#FD5202] bg-orange-50 dark:bg-[#FD5202]/15 text-[#091A42] dark:text-white font-bold'
                          : 'border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-[#060F26] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input type="radio" value="cash" {...register('paymentPreference')} className="accent-[#FD5202]" />
                      <span className="text-xs font-bold">{isRtl ? 'پرداخت نقدی با تخفیف ویژه' : 'Cash (Special Discount)'}</span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                        paymentPreference === 'lease'
                          ? 'border-[#FD5202] bg-orange-50 dark:bg-[#FD5202]/15 text-[#091A42] dark:text-white font-bold'
                          : 'border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-[#060F26] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input type="radio" value="lease" {...register('paymentPreference')} className="accent-[#FD5202]" />
                      <span className="text-xs font-bold">{isRtl ? 'طرح تعویض دستگاه کارکرده' : 'Trade-in Old Machine'}</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-sm sm:text-base font-black text-white bg-[#FD5202] hover:bg-[#E04600] shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isRtl ? 'ثبت نهایی درخواست و رزرو اولویت تخفیف' : 'Submit & Secure Your Priority Spot'}</span>
                  </motion.button>
                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2.5">
                    {isRtl
                      ? 'اطلاعات شما نزد واحد بازرگانی گروه صنعتی آرسی محرمانه بوده و بلافاصله پردازش می‌شود.'
                      : 'Your information is strictly protected and reviewed exclusively by RCG.'}
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
