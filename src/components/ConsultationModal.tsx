import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Inquiry, Language } from '../types';
import { translations } from '../utils/i18n';
import { useFirebase } from '../context/FirebaseContext';
import { GoogleBrandIcon } from './GoogleBrandIcon';
import { X, Send, CheckCircle2, PhoneCall, AlertCircle } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  prefilledSubject?: string;
  onSubmitted: (inquiry: Inquiry) => void;
}

interface ConsultationFormInputs {
  name: string;
  phone: string;
  department: string;
  subject: string;
  message: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  language,
  prefilledSubject = '',
  onSubmitted,
}) => {
  const isRtl = language === 'fa';
  const t = translations[language].contact;
  const { user, signInWithGoogle } = useFirebase();
  const [isDone, setIsDone] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConsultationFormInputs>({
    defaultValues: {
      name: user?.displayName || '',
      phone: '',
      department: 'فروش و بازرگانی (Sales)',
      subject: prefilledSubject || (isRtl ? 'مشاوره خرید ماشین‌آلات' : 'Machinery Consultation'),
      message: '',
    },
  });

  useEffect(() => {
    if (prefilledSubject) {
      setValue('subject', prefilledSubject);
    }
    if (user?.displayName) {
      setValue('name', user.displayName);
    }
  }, [prefilledSubject, user?.displayName, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setIsDone(false);
      setSubmitNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: ConsultationFormInputs) => {
    setSubmitNotice(null);
    let activeUser = user;
    if (!activeUser) {
      setSubmitting(true);
      activeUser = await signInWithGoogle();
      setSubmitting(false);
      if (!activeUser) {
        setSubmitNotice(
          isRtl
            ? 'برای ثبت درخواست در پنل و پیگیری وضعیت آن، ورود با گوگل الزامی است.'
            : 'Sign in with Google is required to submit your request.'
        );
        return;
      }
    }

    const newInquiry: Inquiry = {
      id: `INQ-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: activeUser.email || undefined,
      department: data.department,
      subject: data.subject.trim() || (isRtl ? 'درخواست مشاوره تخصصی' : 'Specialist Consultation'),
      message: data.message.trim() || (isRtl ? 'درخواست تماس کارشناس' : 'Callback requested'),
      status: 'new',
      createdAt: new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onSubmitted(newInquiry);
    setIsDone(true);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-blue-900/60 p-4 sm:px-8 sm:pt-7 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#FD5202] text-white shadow-sm shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-lg text-[#091A42] dark:text-white truncate">
                {isRtl ? 'درخواست مشاوره تخصصی RCG' : 'Request Specialist Consultation'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-300 truncate">
                {isRtl ? 'مشاوره رایگان خرید، قطعات، تیزکاری و اورهال' : 'Free advisory on machinery, sharpening & parts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:px-8 sm:pb-8 sm:pt-5 overflow-y-auto flex-1">
          {isDone ? (
            <div className="py-6 sm:py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-[#091A42] dark:text-white">
                {isRtl ? 'درخواست مشاوره شما ثبت شد' : 'Request Received'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {isRtl
                  ? 'کارشناسان ما در کوتاه‌ترین زمان ممکن با شما تماس حاصل خواهند نمود.'
                  : 'Our engineering specialists will connect with you promptly.'}
              </p>
              <button
                onClick={onClose}
                className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 text-xs font-bold rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white cursor-pointer"
              >
                {isRtl ? 'بستن' : 'Close'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm" noValidate>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{t.name} *</label>
                <input
                  type="text"
                  {...register('name', {
                    required: isRtl ? 'نام و نام خانوادگی الزامی است' : 'Full name is required',
                    minLength: { value: 2, message: isRtl ? 'حداقل ۲ کاراکتر' : 'Min 2 characters' },
                  })}
                  placeholder={isRtl ? 'نام و نام خانوادگی' : 'Full Name'}
                  className={`w-full min-h-[42px] bg-slate-50 dark:bg-[#060F26] border rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none ${
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

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{t.phone} *</label>
                <input
                  type="tel"
                  {...register('phone', {
                    required: isRtl ? 'شماره تماس الزامی است' : 'Phone number is required',
                    minLength: { value: 8, message: isRtl ? 'شماره تماس معتبر وارد کنید' : 'Enter valid phone' },
                  })}
                  placeholder="0911..."
                  className={`w-full min-h-[42px] bg-slate-50 dark:bg-[#060F26] border rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none font-mono ${
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

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{t.dept}</label>
                <select
                  {...register('department')}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="فروش و بازرگانی (Sales)">{isRtl ? 'دپارتمان فروش و بازرگانی' : 'Sales & Commerce'}</option>
                  <option value="خدمات فنی و پشتیبانی (Support)">{isRtl ? 'دپارتمان خدمات فنی و قطعات' : 'Technical Support & Spares'}</option>
                  <option value="تیزکاری CNC و اره الماسه (Sharpening)">{isRtl ? 'مرکز تخصصی تیزکاری اره الماسه' : 'Diamond Blade Sharpening'}</option>
                  <option value="اورهال و نوسازی ماشین‌آلات (Overhaul)">{isRtl ? 'دپارتمان اورهال و نوسازی' : 'Machinery Overhaul'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{t.subject}</label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">{t.message}</label>
                <textarea
                  rows={3}
                  {...register('message')}
                  placeholder={isRtl ? 'توضیحات کوتاه در مورد درخواست یا شرایط کارگاه...' : 'Brief notes...'}
                  className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              {submitNotice && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitNotice}</span>
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#FD5202] to-[#E04600] hover:from-[#E04600] hover:to-[#C03C00] shadow-lg shadow-orange-500/25 dark:shadow-orange-950/40 transition-all cursor-pointer disabled:opacity-60"
                >
                  {user ? (
                    <Send className="w-4 h-4 shrink-0" />
                  ) : (
                    <GoogleBrandIcon className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" />
                  )}
                  <span>
                    {user
                      ? t.send
                      : isRtl
                      ? 'ورود با گوگل و ارسال درخواست'
                      : 'Sign in with Google & Send'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
