import React, { useState } from 'react';
import {
  Language,
  SharpeningOrder,
  Inquiry,
  CampaignInquiry,
} from '../types';
import { BOOTSTRAPPED_ADMIN_EMAIL, useFirebase } from '../context/FirebaseContext';
import { updateSharpeningOrderInFirestore } from '../services/firestoreSync';
import {
  X,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Disc,
  MessageSquare,
  Flame,
  UserCheck,
  Save,
} from 'lucide-react';

interface UserPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  sharpeningOrders: SharpeningOrder[];
  inquiries: Inquiry[];
  campaignInquiries: CampaignInquiry[];
  onOpenAdmin?: () => void;
}

export const UserPortalModal: React.FC<UserPortalModalProps> = ({
  isOpen,
  onClose,
  language,
  sharpeningOrders,
  inquiries,
  campaignInquiries,
  onOpenAdmin,
}) => {
  const { user, isAdmin, signOutUser } = useFirebase();
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries' | 'campaigns'>('orders');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  if (!isOpen || !user) return null;

  const isRtl = language === 'fa';
  const isOwnerAdmin = Boolean(
    user.emailVerified &&
      user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
      isAdmin
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: isRtl ? 'ثبت جدید' : 'New',
          cls: 'bg-blue-50 text-[#144AE0] dark:bg-blue-950 dark:text-[#A6D6FE] border-blue-200 dark:border-blue-800',
        };
      case 'in_progress':
      case 'contacted':
        return {
          label: isRtl ? 'در حال پیگیری' : 'In Progress',
          cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'completed':
      case 'resolved':
      case 'contracted':
        return {
          label: isRtl ? 'تکمیل شده' : 'Completed',
          cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      default:
        return {
          label: isRtl ? 'بایگانی / لغو' : 'Archived',
          cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const handleSaveNote = async (orderId: string) => {
    setSavingNote(true);
    try {
      await updateSharpeningOrderInFirestore(orderId, { notes: noteDraft.trim() });
      setEditingOrderId(null);
      setNoteDraft('');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-2.5 sm:p-4">
      <div className="w-full max-w-3xl max-h-[92dvh] flex flex-col bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Header Profile Banner */}
        <div className="relative bg-gradient-to-r from-[#091A42] via-[#0E245E] to-[#144AE0] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 rtl:pl-10 ltr:pr-10 sm:rtl:pl-0 sm:ltr:pr-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-2 border-white/30 object-cover shadow-md shrink-0"
              />
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FD5202] flex items-center justify-center font-extrabold text-lg shrink-0">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-extrabold truncate max-w-[200px] sm:max-w-none">
                  {user.displayName || (isRtl ? 'کاربر تاییدشده' : 'Verified Member')}
                </h2>
                {isOwnerAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#FD5202] text-white text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    {isRtl ? 'مدیر کل سیستم' : 'System Admin'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                    <UserCheck className="w-3 h-3" />
                    {isRtl ? 'حساب کاربری گوگل' : 'Google Verified'}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#A6D6FE] mt-0.5 font-mono break-all">{user.email}</p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
            {isOwnerAdmin && onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[40px] rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {isRtl ? 'ورود به پنل مدیریت' : 'Open Admin CMS'}
              </button>
            )}
            <button
              onClick={async () => {
                await signOutUser();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-400/30 text-xs font-bold text-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isRtl ? 'خروج' : 'Sign Out'}</span>
            </button>
            <button
              onClick={onClose}
              className="absolute top-3 rtl:left-3 ltr:right-3 sm:static p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-2.5 sm:p-4 border-b border-slate-200 dark:border-blue-900/50 bg-slate-50 dark:bg-[#060F26] overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#144AE0] text-white shadow-sm'
                : 'bg-white dark:bg-blue-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-800/50'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>
              {isRtl ? `سفارش‌های تیزکاری (${sharpeningOrders.length})` : `Sharpening Orders (${sharpeningOrders.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-[#144AE0] text-white shadow-sm'
                : 'bg-white dark:bg-blue-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {isRtl ? `درخواست‌ها و مشاوره (${inquiries.length})` : `Inquiries (${inquiries.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-[#FD5202] text-white shadow-sm'
                : 'bg-white dark:bg-blue-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>
              {isRtl ? `کمپین‌های من (${campaignInquiries.length})` : `Campaign Leads (${campaignInquiries.length})`}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {activeTab === 'orders' && (
            <>
              {sharpeningOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? 'هنوز سفارشی در بخش محاسبه‌گر تیزکاری با حساب کاربری شما ثبت نشده است.'
                    : 'No sharpening orders recorded under your account yet.'}
                </div>
              ) : (
                sharpeningOrders.map((order) => {
                  const st = statusBadge(order.status);
                  const isLocked = order.status === 'completed' || order.status === 'cancelled';
                  return (
                    <div
                      key={order.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-slate-50/70 dark:bg-blue-950/30 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#144AE0] dark:text-[#A6D6FE]">
                            #{order.id}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold">
                            {order.bladeType} ({order.diameter} / {order.teethCount})
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span>
                          {order.serviceType} × {order.quantity} —{' '}
                          <strong className="text-[#FD5202]">{order.estimatedPrice}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {order.createdAt}
                        </span>
                      </div>

                      {editingOrderId === order.id ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder={isRtl ? 'یادداشت تکمیلی سفارش...' : 'Order note...'}
                            className="flex-1 px-3 py-2 min-h-[40px] text-xs rounded-xl bg-white dark:bg-[#060F26] border border-slate-300 dark:border-blue-800"
                          />
                          <button
                            disabled={savingNote}
                            onClick={() => handleSaveNote(order.id)}
                            className="inline-flex items-center justify-center gap-1 px-4 py-2 min-h-[40px] rounded-xl bg-[#144AE0] text-white text-xs font-bold cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'ذخیره' : 'Save'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{order.notes ? `${isRtl ? 'توضیحات:' : 'Notes:'} ${order.notes}` : ''}</span>
                          {!isLocked && (
                            <button
                              onClick={() => {
                                setEditingOrderId(order.id);
                                setNoteDraft(order.notes || '');
                              }}
                              className="text-[#144AE0] dark:text-[#A6D6FE] hover:underline font-bold cursor-pointer"
                            >
                              {isRtl ? 'ویرایش یادداشت' : 'Edit note'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'inquiries' && (
            <>
              {inquiries.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? 'هنوز درخواست مشاوره‌ای تحت حساب شما ثبت نشده است.'
                    : 'No consultation inquiries recorded under your account yet.'}
                </div>
              ) : (
                inquiries.map((inq) => {
                  const st = statusBadge(inq.status);
                  return (
                    <div
                      key={inq.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-slate-50/70 dark:bg-blue-950/30 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold">{inq.subject}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {inq.message}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{inq.department}</span>
                        <span>{inq.createdAt}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'campaigns' && (
            <>
              {campaignInquiries.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? 'هنوز در کمپین‌های فروش و خدمات RCG ثبت‌نام نکرده‌اید.'
                    : 'No campaign registrations recorded under your account yet.'}
                </div>
              ) : (
                campaignInquiries.map((ci) => {
                  const st = statusBadge(ci.status);
                  return (
                    <div
                      key={ci.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-slate-50/70 dark:bg-blue-950/30 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold">{ci.campaignTitle}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span>{ci.interestedMachine}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {ci.createdAt}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
