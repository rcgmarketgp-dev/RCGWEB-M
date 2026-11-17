import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Inquiry, Language, SiteSettings, SectionCustomization } from '../types';
import { translations } from '../utils/i18n';
import { useFirebase } from '../context/FirebaseContext';
import { GoogleBrandIcon } from './GoogleBrandIcon';
import { ExternalIconBadge } from './ExternalIconBadge';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { WhatsAppBrandIcon } from './SocialBrandIcons';
import { motion } from 'motion/react';

interface ContactSectionProps {
  settings: SiteSettings;
  language: Language;
  sectionConfig?: SectionCustomization;
  prefilledDepartment?: string;
  prefilledSubject?: string;
  onInquirySubmitted: (inquiry: Inquiry) => void;
}

interface ContactFormInputs {
  name: string;
  phone: string;
  email: string;
  department: string;
  subject: string;
  message: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  language,
  sectionConfig,
  prefilledDepartment = '',
  prefilledSubject = '',
  onInquirySubmitted,
}) => {
  const t = translations[language].contact;
  const isRtl = language === 'fa';
  const { user, signInWithGoogle } = useFirebase();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    defaultValues: {
      name: user?.displayName || '',
      phone: '',
      email: user?.email || '',
      department: prefilledDepartment || 'فروش و بازرگانی (Sales)',
      subject: prefilledSubject || '',
      message: '',
    },
  });

  useEffect(() => {
    if (prefilledDepartment) setValue('department', prefilledDepartment);
    if (prefilledSubject) setValue('subject', prefilledSubject);
    if (user?.displayName) setValue('name', user.displayName);
    if (user?.email) setValue('email', user.email);
  }, [prefilledDepartment, prefilledSubject, user?.displayName, user?.email, setValue]);

  const onSubmit = async (data: ContactFormInputs) => {
    setSubmitNotice(null);
    let activeUser = user;
    if (!activeUser) {
      setSubmitting(true);
      activeUser = await signInWithGoogle();
      setSubmitting(false);
      if (!activeUser) {
        setSubmitNotice(
          isRtl
            ? 'برای ثبت آنلاین درخواست و مشاهده پاسخ در سوابق، ورود با گوگل الزامی است.'
            : 'Please sign in with Google to submit and track your inquiry.'
        );
        return;
      }
    }

    const newInquiry: Inquiry = {
      id: `INQ-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim() || activeUser.email || undefined,
      department: data.department,
      subject: data.subject.trim() || (isRtl ? 'درخواست مشاوره عمومی' : 'General Advisory Request'),
      message: data.message.trim(),
      status: 'new',
      createdAt: new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onInquirySubmitted(newInquiry);
    setIsSuccess(true);
  };

  return (
    <section
      id="contact"
      className="py-14 sm:py-20 lg:py-24 bg-slate-50 dark:bg-[#060F26] text-slate-900 dark:text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-15 rcg-pattern-triangles dark:rcg-pattern-triangles-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-[#FD5202]/15 border border-orange-200 dark:border-[#FD5202]/40 text-[11px] sm:text-xs font-bold text-[#FD5202]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isRtl ? sectionConfig?.badgeFa || 'مشاوره و پشتیبانی فنی' : sectionConfig?.badgeEn || 'Advisory & Technical Support'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#091A42] dark:text-white">
            {isRtl ? sectionConfig?.titleFa || t.title : sectionConfig?.titleEn || t.title}
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isRtl ? sectionConfig?.subtitleFa || t.subtitle : sectionConfig?.subtitleEn || t.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Contact Details Card */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/50 space-y-5 sm:space-y-6 shadow-lg">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 sm:p-3 rounded-xl bg-orange-50 dark:bg-blue-950 border border-orange-200 dark:border-blue-800 text-[#FD5202] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#091A42] dark:text-white">{t.addressTitle}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {isRtl ? settings.addressFa : settings.addressEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#091A42] dark:text-white">{t.phoneTitle}</h4>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 space-y-1 font-mono tabular-nums">
                    <p className="hover:text-[#FD5202] transition-colors">
                      <a href={`tel:${settings.phonePrimary}`} className="inline-block py-0.5">{settings.phonePrimary}</a>
                    </p>
                    <p className="hover:text-[#FD5202] transition-colors">
                      <a href={`tel:${settings.phoneSecondary}`} className="inline-block py-0.5">{settings.phoneSecondary}</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 sm:p-3 rounded-xl bg-orange-50 dark:bg-blue-950 border border-orange-200 dark:border-blue-800 text-[#FD5202] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#091A42] dark:text-white">{t.hoursTitle}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {isRtl ? settings.workingHoursFa : settings.workingHoursEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#144AE0] dark:text-[#A6D6FE] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#091A42] dark:text-white">{isRtl ? 'پست الکترونیک' : 'Official Email'}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono break-all">
                    <a href={`mailto:${settings.email}`} className="hover:text-[#FD5202] transition-colors">
                      {settings.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Chat Action */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full min-h-[46px] py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <WhatsAppBrandIcon className="w-4 h-4 shrink-0" />
                  <span>{t.whatsappBtn}</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 'some', margin: '0px 0px -16px 0px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-white dark:bg-[#091A42]/90 border border-slate-200 dark:border-blue-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg"
          >
            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#091A42] dark:text-white">
                  {isRtl ? 'درخواست شما با موفقیت دریافت شد' : 'Consultation Request Sent'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {t.sentSuccess}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      reset();
                    }}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white transition-colors cursor-pointer"
                  >
                    {isRtl ? 'ارسال پیام جدید' : 'Send Another Message'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.name} *</label>
                    <input
                      type="text"
                      {...register('name', {
                        required: isRtl ? 'نام خود را وارد کنید' : 'Name is required',
                        minLength: { value: 2, message: isRtl ? 'حداقل ۲ کاراکتر' : 'Min 2 characters' },
                      })}
                      placeholder={isRtl ? 'نام و نام خانوادگی' : 'Full Name'}
                      className={`w-full bg-slate-50 dark:bg-[#060F26] border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none ${
                        errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-blue-900 focus:border-[#FD5202]'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.phone} *</label>
                    <input
                      type="tel"
                      {...register('phone', {
                        required: isRtl ? 'شماره تماس الزامی است' : 'Phone number is required',
                        minLength: { value: 8, message: isRtl ? 'شماره معتبر وارد کنید' : 'Enter valid phone' },
                      })}
                      placeholder="0911..."
                      className={`w-full bg-slate-50 dark:bg-[#060F26] border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none font-mono ${
                        errors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-blue-900 focus:border-[#FD5202]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.phone.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'ایمیل (اختیاری)' : 'Email (Optional)'}</label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="info@example.com"
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.dept}</label>
                    <select
                      {...register('department')}
                      className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="فروش و بازرگانی (Sales)">{isRtl ? 'دپارتمان فروش و بازرگانی' : 'Sales & Commerce'}</option>
                      <option value="خدمات فنی و پشتیبانی (Support)">{isRtl ? 'دپارتمان خدمات فنی و قطعات' : 'Technical Support & Spares'}</option>
                      <option value="تیزکاری CNC و اره الماسه (Sharpening)">{isRtl ? 'مرکز تخصصی تیزکاری اره الماسه' : 'Diamond Blade Sharpening'}</option>
                      <option value="اورهال و نوسازی ماشین‌آلات (Overhaul)">{isRtl ? 'دپارتمان اورهال و نوسازی' : 'Machinery Overhaul'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.subject}</label>
                  <input
                    type="text"
                    {...register('subject')}
                    placeholder={isRtl ? 'مثال: استعلام قیمت دورکن ۳۸۰ پایون' : 'Subject...'}
                    className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.message} *</label>
                  <textarea
                    rows={4}
                    {...register('message', {
                      required: isRtl ? 'لطفاً شرح درخواست خود را بنویسید' : 'Message is required',
                      minLength: { value: 5, message: isRtl ? 'حداقل ۵ کاراکتر بنویسید' : 'Min 5 characters' },
                    })}
                    placeholder={isRtl ? 'شرح درخواست یا نیاز کارگاهی خود را بنویسید...' : 'Please describe your request...'}
                    className={`w-full bg-slate-50 dark:bg-[#060F26] border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none resize-none ${
                      errors.message ? 'border-rose-500' : 'border-slate-200 dark:border-blue-900 focus:border-[#FD5202]'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.message.message}</span>
                    </p>
                  )}
                </div>

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
                      iconName={settings.externalCtaIcon}
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
                        ? sectionConfig?.ctaTextFa || t.send
                        : sectionConfig?.ctaTextEn || t.send
                      : isRtl
                      ? 'ورود با گوگل و ارسال درخواست'
                      : 'Sign in with Google & Send Request'}
                  </span>
                </button>
                {user && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>
                      {isRtl
                        ? `درخواست در حساب تاییدشده ${user.email} ثبت می‌شود`
                        : `Linked to verified account (${user.email})`}
                    </span>
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
