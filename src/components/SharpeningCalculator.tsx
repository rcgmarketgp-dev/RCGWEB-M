import React, { useState, useEffect } from 'react';
import {
  DiscountCode,
  Language,
  SectionCustomization,
  SharpeningOrder,
  SharpeningPricingConfig,
  SiteSettings,
} from '../types';
import { defaultSharpeningPricing } from '../data/initialData';
import { translations } from '../utils/i18n';
import { useForm } from 'react-hook-form';
import { useFirebase } from '../context/FirebaseContext';
import {
  normalizeDiscountCodeKey,
  verifyDiscountCodeInFirestore,
} from '../services/firestoreSync';
import { GoogleBrandIcon } from './GoogleBrandIcon';
import { ExternalIconBadge } from './ExternalIconBadge';
import {
  Calculator,
  CheckCircle2,
  Send,
  Clock,
  AlertCircle,
  UserCheck,
  Tag,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { Disc, Cpu } from '@phosphor-icons/react';
import { motion } from 'motion/react';

interface SharpeningCalculatorProps {
  language: Language;
  settings?: SiteSettings;
  sectionConfig?: SectionCustomization;
  discountCodes?: DiscountCode[];
  onOrderCreated: (order: SharpeningOrder, appliedDiscount?: DiscountCode) => void;
}

interface SharpeningCustomerInputs {
  customerName: string;
  phone: string;
  city: string;
  notes: string;
}

export const SharpeningCalculator: React.FC<SharpeningCalculatorProps> = ({
  language,
  settings,
  sectionConfig,
  discountCodes = [],
  onOrderCreated,
}) => {
  const t = translations[language].calculator;
  const isRtl = language === 'fa';
  const { user, signInWithGoogle } = useFirebase();

  const [bladeType, setBladeType] = useState<'mdf' | 'scoring' | 'solid' | 'alu'>('mdf');
  const [diameter, setDiameter] = useState('300');
  const [teeth, setTeeth] = useState('96');
  const [serviceType, setServiceType] = useState<'std' | 'teeth_rep' | 'balance'>('std');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Discount Code verification & application state
  const [discountInput, setDiscountInput] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountStatus, setDiscountStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SharpeningCustomerInputs>({
    defaultValues: {
      customerName: user?.displayName || '',
      phone: '',
      city: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (user?.displayName) {
      setValue('customerName', user.displayName);
    }
  }, [user?.displayName, setValue]);

  const pricing: SharpeningPricingConfig = {
    ...defaultSharpeningPricing,
    ...(settings?.sharpeningPricing || {}),
    bladeTypeSurchargePercent: {
      ...defaultSharpeningPricing.bladeTypeSurchargePercent,
      ...(settings?.sharpeningPricing?.bladeTypeSurchargePercent || {}),
    },
  };

  const formatMoney = (amount: number) => {
    const safeAmount = Math.max(0, Math.round(amount));
    const usdRate = Math.max(1000, Number(pricing.usdExchangeRate) || 600000);
    return {
      fa: `${safeAmount.toLocaleString('fa-IR')} تومان`,
      en: `${safeAmount.toLocaleString('en-US')} Toman (~$${(safeAmount / usdRate).toFixed(1)})`,
      raw: safeAmount,
    };
  };

  const calculateEstimate = () => {
    let perTooth = Number(pricing.basePricePerTooth) || 3500;
    if (serviceType === 'teeth_rep') {
      perTooth += Number(pricing.teethRepairExtraPerTooth) || 0;
    }
    if (serviceType === 'balance') {
      perTooth += Number(pricing.balanceExtraPerTooth) || 0;
    }

    const toothNum = parseInt(teeth, 10) || 96;
    const setupFee = Number(pricing.fixedSetupFeePerBlade) || 0;
    const bladeMultiplierPct = Number(pricing.bladeTypeSurchargePercent[bladeType]) || 0;
    const singleBladeRaw = Math.round(
      (toothNum * perTooth + setupFee) * (1 + bladeMultiplierPct / 100)
    );
    const subtotalRaw = Math.max(0, singleBladeRaw * (quantity || 1));

    let discountRaw = 0;
    if (appliedDiscount && !appliedDiscount.isUsed) {
      if (appliedDiscount.discountType === 'percent') {
        const pct = Math.min(100, Math.max(0, Number(appliedDiscount.discountValue) || 0));
        discountRaw = Math.round((subtotalRaw * pct) / 100);
      } else {
        discountRaw = Math.min(subtotalRaw, Math.max(0, Number(appliedDiscount.discountValue) || 0));
      }
    }

    const finalRaw = Math.max(0, subtotalRaw - discountRaw);

    return {
      subtotal: formatMoney(subtotalRaw),
      discount: formatMoney(discountRaw),
      final: formatMoney(finalRaw),
      hasDiscount: Boolean(appliedDiscount && discountRaw > 0),
    };
  };

  const estimate = calculateEstimate();

  const resolveCodeMatch = async (rawCode: string): Promise<DiscountCode | null> => {
    const normalized = normalizeDiscountCodeKey(rawCode);
    if (normalized.length < 2) return null;

    const remote = await verifyDiscountCodeInFirestore(normalized);
    if (remote.found && remote.code) {
      return remote.code;
    }

    const localMatch = discountCodes.find(
      (c) => normalizeDiscountCodeKey(c.code || c.id) === normalized
    );
    return localMatch || null;
  };

  const handleApplyDiscount = async () => {
    const normalized = normalizeDiscountCodeKey(discountInput);
    if (normalized.length < 2) {
      setDiscountStatus({
        type: 'error',
        message: isRtl
          ? 'لطفاً کد تخفیف معتبر (حداقل ۲ کاراکتر انگلیسی/عدد) وارد کنید.'
          : 'Please enter a valid discount code.',
      });
      return;
    }

    setCheckingCode(true);
    setDiscountStatus(null);
    try {
      const matched = await resolveCodeMatch(normalized);
      if (!matched) {
        setAppliedDiscount(null);
        setDiscountStatus({
          type: 'error',
          message: isRtl
            ? 'کد تخفیف وارد شده در لیست کدهای ثبت‌شده پنل مدیریت یافت نشد.'
            : 'Discount code not found in our system.',
        });
        return;
      }

      if (matched.isUsed) {
        setAppliedDiscount(null);
        setDiscountStatus({
          type: 'error',
          message: isRtl
            ? 'این کد تخفیف قبلاً استفاده شده است و دیگر قابل اعمال نیست.'
            : 'This discount code has already been redeemed.',
        });
        return;
      }

      setAppliedDiscount(matched);
      setDiscountInput(matched.code);
      const valueText =
        matched.discountType === 'percent'
          ? isRtl
            ? `${matched.discountValue.toLocaleString('fa-IR')}٪ تخفیف`
            : `${matched.discountValue}% off`
          : isRtl
          ? `${matched.discountValue.toLocaleString('fa-IR')} تومان کسر مبلغ`
          : `${matched.discountValue.toLocaleString('en-US')} Toman off`;

      setDiscountStatus({
        type: 'success',
        message: isRtl
          ? `کد «${matched.code}» تایید شد (${valueText}) و از مبلغ محاسبه‌شده کسر گردید.`
          : `Code "${matched.code}" verified (${valueText}) and deducted from your total.`,
      });
    } finally {
      setCheckingCode(false);
    }
  };

  const handleClearDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput('');
    setDiscountStatus(null);
  };

  const onSubmit = async (data: SharpeningCustomerInputs) => {
    setSubmitNotice(null);

    let verifiedDiscount: DiscountCode | undefined;
    if (appliedDiscount) {
      setSubmitting(true);
      const latestCheck = await resolveCodeMatch(appliedDiscount.code);
      setSubmitting(false);
      if (!latestCheck || latestCheck.isUsed) {
        setAppliedDiscount(null);
        setDiscountStatus({
          type: 'error',
          message: isRtl
            ? 'کد تخفیف انتخاب‌شده دیگر معتبر نیست یا پیش‌تر مصرف شده است. لطفاً مجدداً بررسی کنید.'
            : 'Selected discount code is no longer valid or has already been redeemed.',
        });
        return;
      }
      verifiedDiscount = latestCheck;
    }

    let activeUser = user;
    if (!activeUser) {
      setSubmitting(true);
      activeUser = await signInWithGoogle();
      setSubmitting(false);
      if (!activeUser) {
        setSubmitNotice(
          isRtl
            ? 'برای ثبت آنلاین سفارش در سامانه ابری RCG و پیگیری آن، ورود با گوگل الزامی است.'
            : 'Please sign in with Google to submit and track your sharpening order.'
        );
        return;
      }
    }

    const createdAtLabel = new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newOrder: SharpeningOrder = {
      id: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      city: data.city.trim() || (isRtl ? 'ثبت نشده' : 'Not specified'),
      bladeType:
        bladeType === 'mdf'
          ? t.bladeTypeMdf
          : bladeType === 'scoring'
          ? t.bladeTypeScoring
          : bladeType === 'solid'
          ? t.bladeTypeSolidWood
          : t.bladeTypeAlu,
      diameter: `${diameter} mm`,
      teethCount: `${teeth}T`,
      serviceType:
        serviceType === 'std'
          ? t.serviceStd
          : serviceType === 'teeth_rep'
          ? t.serviceTeethRep
          : t.serviceBalance,
      quantity,
      estimatedPrice: isRtl ? estimate.final.fa : estimate.final.en,
      ...(verifiedDiscount && estimate.hasDiscount
        ? {
            originalPrice: isRtl ? estimate.subtotal.fa : estimate.subtotal.en,
            discountCode: verifiedDiscount.code,
            discountAmount: isRtl ? estimate.discount.fa : estimate.discount.en,
          }
        : {}),
      status: 'new',
      createdAt: createdAtLabel,
      notes: data.notes.trim(),
    };

    onOrderCreated(newOrder, verifiedDiscount);
    setAppliedDiscount(null);
    setDiscountInput('');
    setDiscountStatus(null);
    setIsSubmitted(true);
  };

  return (
    <section
      id="calculator"
      className="py-14 sm:py-20 lg:py-24 bg-white dark:bg-[#091A42] text-slate-900 dark:text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-[#FD5202]/15 border border-orange-200 dark:border-[#FD5202]/40 text-[11px] sm:text-xs font-bold text-[#FD5202]">
            <Cpu weight="duotone" className="w-4 h-4" />
            <span>
              {isRtl
                ? sectionConfig?.badgeFa || 'مرکز مکانیزه تیزکاری آلمانی RCG'
                : sectionConfig?.badgeEn || 'RCG Automated Sharpening Center'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#091A42] dark:text-white">
            {isRtl ? sectionConfig?.titleFa || t.title : sectionConfig?.titleEn || t.title}
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl ? sectionConfig?.subtitleFa || t.subtitle : sectionConfig?.subtitleEn || t.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-slate-50 dark:bg-[#060F26]/95 border border-slate-200 dark:border-blue-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg space-y-5 sm:space-y-6"
          >
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#091A42] dark:text-white">
                  {isRtl ? 'سفارش تیزکاری شما ثبت گردید' : 'Tool Order Received'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {t.successMessage}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      reset();
                    }}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white transition-colors cursor-pointer"
                  >
                    {isRtl ? 'محاسبه مجدد یا سفارش جدید' : 'Calculate Another Tool'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#091A42] dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-blue-900/60 pb-2.5">
                    <Disc weight="duotone" className="w-5 h-5 text-[#FD5202]" />
                    <span>{t.bladeDetails}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Blade Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.bladeType}
                      </label>
                      <select
                        value={bladeType}
                        onChange={(e) => {
                          const next = e.target.value as 'mdf' | 'scoring' | 'solid' | 'alu';
                          setBladeType(next);
                          if (next === 'scoring') {
                            setDiameter('120');
                            setTeeth('24');
                          } else if (next === 'mdf') {
                            setDiameter('300');
                            setTeeth('96');
                          }
                        }}
                        className="w-full min-h-[42px] bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="mdf">{t.bladeTypeMdf}</option>
                        <option value="scoring">{t.bladeTypeScoring}</option>
                        <option value="solid">{t.bladeTypeSolidWood}</option>
                        <option value="alu">{t.bladeTypeAlu}</option>
                      </select>
                    </div>

                    {/* Diameter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.diameter}
                      </label>
                      <select
                        value={diameter}
                        onChange={(e) => setDiameter(e.target.value)}
                        className="w-full min-h-[42px] bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="120">120 mm ({isRtl ? 'خط‌زن' : 'Scoring'})</option>
                        <option value="250">250 mm</option>
                        <option value="300">300 mm ({isRtl ? 'استاندارد دورکن' : 'Standard'})</option>
                        <option value="350">350 mm</option>
                        <option value="400">400 mm</option>
                        <option value="450">450 mm ({isRtl ? 'پانل‌بر بزرگ' : 'Panel Saw'})</option>
                      </select>
                    </div>

                    {/* Teeth Count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.teeth}
                      </label>
                      <select
                        value={teeth}
                        onChange={(e) => setTeeth(e.target.value)}
                        className="w-full min-h-[42px] bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="24">24T ({isRtl ? 'خط‌زن' : 'Scoring'})</option>
                        <option value="48">48T ({isRtl ? 'طولی‌بر' : 'Rip Cut'})</option>
                        <option value="72">72T ({isRtl ? 'برش تمیز چوب' : 'Fine Wood'})</option>
                        <option value="96">96T ({isRtl ? 'برش ام‌دی‌اف و هایگلاس' : 'MDF / Melamine'})</option>
                        <option value="108">108T ({isRtl ? 'فوق‌العاده ظریف' : 'Ultra Fine'})</option>
                        <option value="120">120T ({isRtl ? 'آلومینیوم و کامپوزیت' : 'Alu / Composite'})</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.quantity}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-lg font-bold hover:bg-slate-100 dark:hover:bg-blue-900 text-slate-800 dark:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="flex-1 min-w-0 min-h-[44px] text-center bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900 rounded-xl py-2 text-slate-900 dark:text-white font-bold text-sm tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-lg font-bold hover:bg-slate-100 dark:hover:bg-blue-900 text-slate-800 dark:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Service Scope Radio Options */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t.serviceType}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setServiceType('std')}
                        className={`p-3 text-right rtl:text-right ltr:text-left rounded-xl border text-xs transition-all cursor-pointer ${
                          serviceType === 'std'
                            ? 'bg-blue-50 dark:bg-blue-600/30 border-[#FD5202] text-[#091A42] dark:text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold block text-[#091A42] dark:text-white">
                          {isRtl ? 'تیزکاری استاندارد' : 'Standard Sharpening'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isRtl ? 'ماشین تمام اتومات آلمان' : 'Automated German CNC'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceType('teeth_rep')}
                        className={`p-3 text-right rtl:text-right ltr:text-left rounded-xl border text-xs transition-all cursor-pointer ${
                          serviceType === 'teeth_rep'
                            ? 'bg-blue-50 dark:bg-blue-600/30 border-[#FD5202] text-[#091A42] dark:text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold block text-[#091A42] dark:text-white">
                          {isRtl ? 'تعویض دندانه' : 'Tooth Replacement'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isRtl ? 'الماسه کارباید اصلی' : 'Original Micrograin Tip'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceType('balance')}
                        className={`p-3 text-right rtl:text-right ltr:text-left rounded-xl border text-xs transition-all cursor-pointer ${
                          serviceType === 'balance'
                            ? 'bg-blue-50 dark:bg-blue-600/30 border-[#FD5202] text-[#091A42] dark:text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold block text-[#091A42] dark:text-white">
                          {isRtl ? 'بالانس و رفع تاب' : 'Plate Balancing'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isRtl ? 'کاهش لرزش و صدا' : 'Vibration & Runout'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Discount Code Section */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#091A42]/90 border border-slate-200 dark:border-blue-800/70 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-[#091A42] dark:text-white flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#FD5202]" />
                      <span>{isRtl ? 'کد تخفیف تیزکاری (اختیاری)' : 'Sharpening Discount Code (Optional)'}</span>
                    </label>
                    {appliedDiscount && (
                      <button
                        type="button"
                        onClick={handleClearDiscount}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>{isRtl ? 'حذف کد' : 'Remove'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => {
                        setDiscountInput(e.target.value.toUpperCase());
                        if (appliedDiscount && normalizeDiscountCodeKey(e.target.value) !== appliedDiscount.code) {
                          setAppliedDiscount(null);
                          setDiscountStatus(null);
                        }
                      }}
                      dir="ltr"
                      placeholder={isRtl ? 'مثال: RCG-OFF20' : 'e.g. RCG-OFF20'}
                      className="flex-1 min-h-[42px] bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2 text-sm font-mono uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyDiscount()}
                      disabled={checkingCode || !discountInput.trim()}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-[#144AE0] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {checkingCode ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#A6D6FE]" />
                      )}
                      <span>{isRtl ? 'بررسی و اعمال کد' : 'Verify & Apply'}</span>
                    </button>
                  </div>

                  {discountStatus && (
                    <div
                      className={`text-[11px] font-semibold px-3 py-2 rounded-xl flex items-center gap-2 border ${
                        discountStatus.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {discountStatus.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{discountStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* 2. Customer Contact */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-bold text-[#091A42] dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-blue-900/60 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
                    <span>{t.customerInfo}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.fullName} *
                      </label>
                      <input
                        type="text"
                        {...register('customerName', {
                          required: isRtl ? 'وارد کردن نام کارگاه یا مشتری الزامی است' : 'Name is required',
                          minLength: { value: 2, message: isRtl ? 'حداقل ۲ کاراکتر' : 'Min 2 chars' },
                        })}
                        placeholder={isRtl ? 'مثال: صنایع چوب افرا' : 'e.g. Acme Woodcraft'}
                        className={`w-full bg-white dark:bg-[#091A42] border rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none ${
                          errors.customerName
                            ? 'border-rose-500'
                            : 'border-slate-200 dark:border-blue-900 focus:border-[#FD5202]'
                        }`}
                      />
                      {errors.customerName && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.customerName.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.phone} *
                      </label>
                      <input
                        type="tel"
                        {...register('phone', {
                          required: isRtl ? 'شماره تماس الزامی است' : 'Phone is required',
                          minLength: { value: 8, message: isRtl ? 'شماره معتبر وارد کنید' : 'Enter valid phone' },
                        })}
                        placeholder="0911..."
                        className={`w-full bg-white dark:bg-[#091A42] border rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none font-mono ${
                          errors.phone
                            ? 'border-rose-500'
                            : 'border-slate-200 dark:border-blue-900 focus:border-[#FD5202]'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.phone.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.city}
                      </label>
                      <input
                        type="text"
                        {...register('city')}
                        placeholder={isRtl ? 'رشت، بابل، ساری...' : 'City'}
                        className="w-full bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t.notes}
                    </label>
                    <input
                      type="text"
                      {...register('notes')}
                      placeholder={isRtl ? 'توضیحات تکمیلی یا درخواست پیک...' : 'Special notes...'}
                      className="w-full bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Auth status hint & Submit Trigger */}
                {submitNotice && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitNotice}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="rcg-btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#FD5202] to-[#E04600] hover:from-[#E04600] hover:to-[#C03C00] shadow-lg shadow-orange-500/25 dark:shadow-orange-950/40 cursor-pointer disabled:opacity-60 text-center"
                >
                  {user ? (
                    <ExternalIconBadge
                      iconName={settings?.externalCtaIcon}
                      className="w-4 h-4 shrink-0"
                      invertColor={true}
                      fallback={<Send className="w-4 h-4 shrink-0" />}
                    />
                  ) : (
                    <GoogleBrandIcon className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" />
                  )}
                  <span>
                    {user
                      ? isRtl
                        ? sectionConfig?.ctaTextFa || t.submitBtn
                        : sectionConfig?.ctaTextEn || t.submitBtn
                      : isRtl
                      ? 'ورود با گوگل و ثبت نهایی سفارش تیزکاری'
                      : 'Sign in with Google & Submit Order'}
                  </span>
                </button>
                {user && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>
                      {isRtl
                        ? `سفارش در پروفایل ${user.email} ذخیره و قابل پیگیری خواهد بود`
                        : `Order saved to verified account (${user.email})`}
                    </span>
                  </p>
                )}
              </form>
            )}
          </motion.div>

          {/* Right Summary Card (Price estimation & German Tech highlights) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Price Card */}
            <div className="bg-gradient-to-br from-[#091A42] to-[#144AE0] dark:from-[#0B1E4D] dark:to-[#060F26] border border-blue-800/60 dark:border-blue-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FD5202]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-white/15">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#A6D6FE]">
                  <Calculator className="w-4 h-4 text-[#FD5202] shrink-0" />
                  <span>{isRtl ? 'برآورد فاکتور تیزکاری' : 'Sharpening Estimate'}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-700/70 px-2.5 py-0.5 rounded-lg tabular-nums shrink-0">
                  {quantity} {isRtl ? 'عدد تیغ اره' : 'blades'}
                </span>
              </div>

              {/* Price Display */}
              <div className="py-5 sm:py-6 text-center space-y-2">
                <span className="text-xs text-slate-300 block">{t.estPrice}</span>

                {estimate.hasDiscount && appliedDiscount && (
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base text-slate-300/80 line-through tabular-nums">
                      {isRtl ? estimate.subtotal.fa : estimate.subtotal.en}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold tabular-nums">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-mono">{appliedDiscount.code}</span>
                      <span>
                        ({isRtl ? `-${estimate.discount.fa}` : `-${estimate.discount.en}`})
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-2xl sm:text-4xl font-black text-white tabular-nums break-words">
                  {isRtl ? estimate.final.fa : estimate.final.en}
                </p>
                <p className="text-[11px] text-blue-100/80 pt-1">
                  {isRtl
                    ? pricing.pricingNoteFa || 'قیمت بر اساس تعرفه مصوب و تیپ دندانه کارباید'
                    : pricing.pricingNoteEn || 'Official standardized pricing'}
                </p>
              </div>

              {/* Turnaround Time */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-black/25 border border-white/15 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Clock className="w-4 h-4 text-[#FD5202] shrink-0" />
                  <span>{t.estTime}</span>
                </div>
                <span className="font-bold text-white">
                  {isRtl ? pricing.turnaroundFa || t.turnaround : pricing.turnaroundEn || t.turnaround}
                </span>
              </div>

              {/* RCG Advantages */}
              <div className="mt-4 sm:mt-5 space-y-2.5 text-xs text-blue-50 border-t border-white/15 pt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FD5202] shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? 'ماشین‌آلات آلمانی Vollmer با سیستم خنک‌کاری صابون مایع بدون سوختگی الماسه'
                      : 'Vollmer German robotic grinding with high-pressure fluid cooling'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FD5202] shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? 'حفظ کامل زاویه برشی فابریک کارخانه و افزایش عمر مفید تیغه تا ۴۰٪'
                      : 'Factory rake angle preservation extending blade lifespan by up to 40%'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FD5202] shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? 'امکان تحویل و دریافت با سرویس پیک در رشت، بابل، ساری و شهرهای مجاور'
                      : 'Workshop courier pickup service across northern industrial zones'}
                  </span>
                </div>
              </div>
            </div>

            {/* Saw Blade Technical Asset Preview Card */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-blue-900/50 relative aspect-[16/9] shadow-lg group">
              <img
                src={sectionConfig?.image || '/assets/aistudio/04_saw_blade_hero_crop_dffed999.jpg'}
                alt="Saw blade cutting with sparks"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3.5 sm:p-5 flex flex-col justify-end">
                <p className="font-bold text-white text-xs sm:text-sm">
                  {isRtl ? 'تکنولوژی آلمان در قلب شمال کشور' : 'German Tooling Technology in Northern Iran'}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  {isRtl
                    ? 'تیزکاری بیش از ۲۰,۰۰۰ تیغ اره صنعتی از سال ۱۳۸۹'
                    : 'Over 20,000 industrial blades processed since 2010'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
