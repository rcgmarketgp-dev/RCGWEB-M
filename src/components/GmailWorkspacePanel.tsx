import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { useFirebase } from '../context/FirebaseContext';
import {
  GmailApiError,
  GmailLabel,
  GmailMessageDetail,
  GmailMessageSummary,
  GmailProfile,
  GmailVacationSettings,
  createGmailDraft,
  createGmailLabel,
  deleteGmailMessage,
  getGmailMessageDetail,
  getGmailProfile,
  getGmailVacationSettings,
  listGmailLabels,
  listGmailMessages,
  modifyGmailMessageLabels,
  sendGmailMessage,
  trashGmailMessage,
  updateGmailVacationSettings,
} from '../services/gmailService';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  FileEdit,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  MailOpen,
  Paperclip,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

export interface GmailComposeSeed {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}

interface GmailWorkspacePanelProps {
  language: Language;
  initialCompose?: GmailComposeSeed | null;
  onClearInitialCompose?: () => void;
}

interface PendingConfirmation {
  title: string;
  description: string;
  details?: string[];
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
}

const SYSTEM_LABEL_ORDER = ['INBOX', 'STARRED', 'SENT', 'DRAFT', 'SPAM', 'TRASH'];

export const GmailWorkspacePanel: React.FC<GmailWorkspacePanelProps> = ({
  language,
  initialCompose,
  onClearInitialCompose,
}) => {
  const isRtl = language === 'fa';
  const {
    gmailAccessToken,
    gmailConnecting,
    gmailAuthError,
    clearGmailAuthError,
    connectGmail,
    disconnectGmailToken,
  } = useFirebase();

  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<GmailMessageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeThreadId, setComposeThreadId] = useState<string | undefined>(undefined);
  const [composeInReplyTo, setComposeInReplyTo] = useState<string | undefined>(undefined);
  const [composeReferences, setComposeReferences] = useState<string | undefined>(undefined);

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');

  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [vacationLoading, setVacationLoading] = useState(false);
  const [vacationDraft, setVacationDraft] = useState<GmailVacationSettings>({
    enableAutoReply: false,
    responseSubject: '',
    responseBodyPlainText: '',
  });

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [executingAction, setExecutingAction] = useState(false);

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Pre-fill composer if triggered from Admin Inquiry reply
  useEffect(() => {
    if (initialCompose) {
      setComposeTo(initialCompose.to);
      setComposeSubject(initialCompose.subject);
      setComposeBody(initialCompose.body);
      setComposeThreadId(initialCompose.threadId);
      setComposeInReplyTo(initialCompose.inReplyTo);
      setComposeReferences(initialCompose.references);
      setIsComposeOpen(true);
      onClearInitialCompose?.();
    }
  }, [initialCompose, onClearInitialCompose]);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof GmailApiError && err.status === 401) {
        disconnectGmailToken();
        showBanner(
          'error',
          isRtl
            ? 'نشست جیمیل منقضی شده است. لطفاً دوباره با گوگل وارد شوید.'
            : 'Gmail session expired. Please sign in with Google again.'
        );
        return;
      }
      const msg = err instanceof Error ? err.message : 'Gmail request failed';
      showBanner('error', msg);
    },
    [disconnectGmailToken, isRtl]
  );

  const loadMailboxMetadata = useCallback(
    async (token: string) => {
      try {
        const [prof, lbls] = await Promise.all([
          getGmailProfile(token),
          listGmailLabels(token),
        ]);
        setProfile(prof);
        setLabels(lbls);
      } catch (err) {
        handleApiError(err);
      }
    },
    [handleApiError]
  );

  const loadMessages = useCallback(
    async (token: string, labelId: string, query: string, pageToken?: string) => {
      if (pageToken) {
        setLoadingMore(true);
      } else {
        setLoadingList(true);
      }
      try {
        const res = await listGmailMessages(token, {
          labelId,
          query,
          maxResults: 15,
          pageToken,
        });
        if (pageToken) {
          setMessages((prev) => [...prev, ...res.messages]);
        } else {
          setMessages(res.messages);
        }
        setNextPageToken(res.nextPageToken);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingList(false);
        setLoadingMore(false);
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    if (!gmailAccessToken) {
      setProfile(null);
      setLabels([]);
      setMessages([]);
      setSelectedDetail(null);
      setSelectedMessageId(null);
      return;
    }
    void loadMailboxMetadata(gmailAccessToken);
  }, [gmailAccessToken, loadMailboxMetadata]);

  useEffect(() => {
    if (!gmailAccessToken) return;
    void loadMessages(gmailAccessToken, selectedLabelId, activeSearch);
  }, [gmailAccessToken, selectedLabelId, activeSearch, loadMessages]);

  const handleOpenMessage = async (messageId: string) => {
    if (!gmailAccessToken) return;
    setSelectedMessageId(messageId);
    setLoadingDetail(true);
    try {
      const detail = await getGmailMessageDetail(gmailAccessToken, messageId);
      setSelectedDetail(detail);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConnectClick = async () => {
    clearGmailAuthError();
    await connectGmail();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleOpenComposeNew = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeThreadId(undefined);
    setComposeInReplyTo(undefined);
    setComposeReferences(undefined);
    setIsComposeOpen(true);
  };

  const handleOpenReply = (detail: GmailMessageDetail) => {
    const replyToAddress = detail.from;
    const subject = detail.subject.toLowerCase().startsWith('re:')
      ? detail.subject
      : `Re: ${detail.subject}`;
    setComposeTo(replyToAddress);
    setComposeSubject(subject);
    setComposeBody(
      `\n\n--- ${isRtl ? 'پیام قبلی از' : 'On'} ${detail.date} — ${detail.from} ---\n${detail.textBody || detail.snippet}`
    );
    setComposeThreadId(detail.threadId);
    setComposeInReplyTo(detail.messageIdHeader);
    setComposeReferences(
      [detail.referencesHeader, detail.messageIdHeader].filter(Boolean).join(' ') || undefined
    );
    setIsComposeOpen(true);
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    setExecutingAction(true);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setExecutingAction(false);
    }
  };

  const requestSendEmailConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailAccessToken) return;
    if (!composeTo.trim() || !composeSubject.trim()) {
      showBanner(
        'error',
        isRtl ? 'لطفاً گیرنده و موضوع ایمیل را وارد کنید.' : 'Please enter recipient and subject.'
      );
      return;
    }

    setPendingConfirm({
      title: isRtl ? 'تایید ارسال ایمیل با جیمیل' : 'Confirm Send Email',
      description: isRtl
        ? 'آیا از ارسال این ایمیل از طریق حساب جیمیل خود اطمینان دارید؟'
        : 'Are you sure you want to send this email from your Gmail account?',
      details: [
        `${isRtl ? 'گیرنده:' : 'To:'} ${composeTo.trim()}`,
        `${isRtl ? 'موضوع:' : 'Subject:'} ${composeSubject.trim()}`,
      ],
      confirmLabel: isRtl ? 'ارسال نهایی ایمیل' : 'Send Email',
      onConfirm: async () => {
        await sendGmailMessage(gmailAccessToken, {
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          threadId: composeThreadId,
          inReplyTo: composeInReplyTo,
          references: composeReferences,
        });
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        showBanner('success', isRtl ? 'ایمیل با موفقیت ارسال شد.' : 'Email sent successfully.');
        await loadMessages(gmailAccessToken, selectedLabelId, activeSearch);
      },
    });
  };

  const requestSaveDraftConfirmation = () => {
    if (!gmailAccessToken) return;
    if (!composeTo.trim() && !composeSubject.trim() && !composeBody.trim()) return;

    setPendingConfirm({
      title: isRtl ? 'تایید ذخیره پیش‌نویس' : 'Confirm Save Draft',
      description: isRtl
        ? 'این پیام به عنوان پیش‌نویس در حساب جیمیل شما ذخیره خواهد شد.'
        : 'This message will be saved to your Gmail Drafts folder.',
      details: [
        `${isRtl ? 'گیرنده:' : 'To:'} ${composeTo.trim() || '—'}`,
        `${isRtl ? 'موضوع:' : 'Subject:'} ${composeSubject.trim() || '(No Subject)'}`,
      ],
      confirmLabel: isRtl ? 'ذخیره پیش‌نویس' : 'Save Draft',
      onConfirm: async () => {
        await createGmailDraft(gmailAccessToken, {
          to: composeTo,
          subject: composeSubject || '(No Subject)',
          body: composeBody,
          threadId: composeThreadId,
        });
        setIsComposeOpen(false);
        showBanner('success', isRtl ? 'پیش‌نویس در جیمیل ذخیره شد.' : 'Draft saved in Gmail.');
        await loadMessages(gmailAccessToken, selectedLabelId, activeSearch);
      },
    });
  };

  const requestToggleReadConfirmation = (msg: GmailMessageSummary) => {
    if (!gmailAccessToken) return;
    const markingAsRead = msg.isUnread;
    setPendingConfirm({
      title: markingAsRead
        ? isRtl
          ? 'تایید علامت‌گذاری به عنوان خوانده‌شده'
          : 'Mark Message as Read?'
        : isRtl
        ? 'تایید علامت‌گذاری به عنوان خوانده‌نشده'
        : 'Mark Message as Unread?',
      description: isRtl
        ? 'برچسب وضعیت خوانده‌شدن این ایمیل در جیمیل تغییر خواهد کرد.'
        : 'This will update the read/unread status of this email in your Gmail mailbox.',
      details: [`${isRtl ? 'موضوع:' : 'Subject:'} ${msg.subject}`],
      confirmLabel: isRtl ? 'تایید تغییر وضعیت' : 'Confirm Update',
      onConfirm: async () => {
        await modifyGmailMessageLabels(
          gmailAccessToken,
          msg.id,
          markingAsRead ? { removeLabelIds: ['UNREAD'] } : { addLabelIds: ['UNREAD'] }
        );
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isUnread: !markingAsRead } : m))
        );
        if (selectedDetail?.id === msg.id) {
          setSelectedDetail((prev) => (prev ? { ...prev, isUnread: !markingAsRead } : prev));
        }
        showBanner(
          'success',
          isRtl ? 'وضعیت پیام به‌روزرسانی شد.' : 'Message status updated.'
        );
      },
    });
  };

  const requestToggleStarConfirmation = (msg: GmailMessageSummary) => {
    if (!gmailAccessToken) return;
    const starring = !msg.isStarred;
    setPendingConfirm({
      title: starring
        ? isRtl
          ? 'افزودن ستاره به ایمیل'
          : 'Star Email?'
        : isRtl
        ? 'حذف ستاره از ایمیل'
        : 'Remove Star from Email?',
      description: isRtl
        ? 'برچسب ستاره‌دار این ایمیل در جیمیل به‌روزرسانی می‌شود.'
        : 'This will update the STARRED label on this message in Gmail.',
      details: [`${isRtl ? 'موضوع:' : 'Subject:'} ${msg.subject}`],
      confirmLabel: isRtl ? 'تایید' : 'Confirm',
      onConfirm: async () => {
        await modifyGmailMessageLabels(
          gmailAccessToken,
          msg.id,
          starring ? { addLabelIds: ['STARRED'] } : { removeLabelIds: ['STARRED'] }
        );
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isStarred: starring } : m))
        );
        if (selectedDetail?.id === msg.id) {
          setSelectedDetail((prev) => (prev ? { ...prev, isStarred: starring } : prev));
        }
        showBanner('success', isRtl ? 'برچسب ستاره به‌روزرسانی شد.' : 'Star updated.');
      },
    });
  };

  const requestTrashConfirmation = (msg: GmailMessageSummary) => {
    if (!gmailAccessToken) return;
    setPendingConfirm({
      title: isRtl ? 'انتقال ایمیل به زباله‌دان' : 'Move Email to Trash?',
      description: isRtl
        ? 'این ایمیل در جیمیل به پوشه زباله‌دان (Trash) منتقل خواهد شد.'
        : 'This email will be moved to your Gmail Trash folder.',
      details: [
        `${isRtl ? 'فرستنده:' : 'From:'} ${msg.from}`,
        `${isRtl ? 'موضوع:' : 'Subject:'} ${msg.subject}`,
      ],
      confirmLabel: isRtl ? 'انتقال به زباله‌دان' : 'Move to Trash',
      danger: true,
      onConfirm: async () => {
        await trashGmailMessage(gmailAccessToken, msg.id);
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        if (selectedMessageId === msg.id) {
          setSelectedMessageId(null);
          setSelectedDetail(null);
        }
        showBanner('success', isRtl ? 'ایمیل به زباله‌دان منتقل شد.' : 'Moved to Trash.');
      },
    });
  };

  const requestPermanentDeleteConfirmation = (msg: GmailMessageSummary) => {
    if (!gmailAccessToken) return;
    setPendingConfirm({
      title: isRtl ? 'حذف دائمی ایمیل' : 'Permanently Delete Email?',
      description: isRtl
        ? 'هشدار: این عملیات غیرقابل بازگشت است و ایمیل برای همیشه از جیمیل پاک می‌شود.'
        : 'Warning: This action cannot be undone. The email will be permanently deleted from Gmail.',
      details: [
        `${isRtl ? 'فرستنده:' : 'From:'} ${msg.from}`,
        `${isRtl ? 'موضوع:' : 'Subject:'} ${msg.subject}`,
      ],
      confirmLabel: isRtl ? 'حذف دائمی' : 'Delete Permanently',
      danger: true,
      onConfirm: async () => {
        await deleteGmailMessage(gmailAccessToken, msg.id);
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        if (selectedMessageId === msg.id) {
          setSelectedMessageId(null);
          setSelectedDetail(null);
        }
        showBanner(
          'success',
          isRtl ? 'ایمیل برای همیشه حذف شد.' : 'Email permanently deleted.'
        );
      },
    });
  };

  const requestCreateLabelConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailAccessToken || !newLabelName.trim()) return;
    const labelName = newLabelName.trim();
    setPendingConfirm({
      title: isRtl ? 'ایجاد برچسب جدید در جیمیل' : 'Create New Gmail Label?',
      description: isRtl
        ? 'یک برچسب جدید به فهرست برچسب‌های جیمیل شما اضافه می‌شود.'
        : 'This will create a new label in your Gmail account.',
      details: [`${isRtl ? 'نام برچسب:' : 'Label:'} ${labelName}`],
      confirmLabel: isRtl ? 'ایجاد برچسب' : 'Create Label',
      onConfirm: async () => {
        const created = await createGmailLabel(gmailAccessToken, labelName);
        setLabels((prev) => [...prev, created]);
        setNewLabelName('');
        setIsLabelModalOpen(false);
        showBanner('success', isRtl ? 'برچسب ایجاد شد.' : 'Label created.');
      },
    });
  };

  const handleOpenVacationSettings = async () => {
    if (!gmailAccessToken) return;
    setIsVacationModalOpen(true);
    setVacationLoading(true);
    try {
      const current = await getGmailVacationSettings(gmailAccessToken);
      setVacationDraft({
        enableAutoReply: Boolean(current.enableAutoReply),
        responseSubject: current.responseSubject || '',
        responseBodyPlainText: current.responseBodyPlainText || '',
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setVacationLoading(false);
    }
  };

  const requestSaveVacationConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailAccessToken) return;
    setPendingConfirm({
      title: isRtl ? 'به‌روزرسانی پاسخگوی خودکار جیمیل' : 'Update Gmail Auto-Responder?',
      description: isRtl
        ? 'تنظیمات پاسخگوی خودکار (Vacation Responder) در حساب جیمیل شما تغییر خواهد کرد.'
        : 'This will update your Gmail Vacation Auto-Responder settings.',
      details: [
        `${isRtl ? 'وضعیت:' : 'Enabled:'} ${
          vacationDraft.enableAutoReply ? (isRtl ? 'فعال' : 'ON') : isRtl ? 'غیرفعال' : 'OFF'
        }`,
        ...(vacationDraft.responseSubject
          ? [`${isRtl ? 'موضوع:' : 'Subject:'} ${vacationDraft.responseSubject}`]
          : []),
      ],
      confirmLabel: isRtl ? 'ذخیره تنظیمات' : 'Save Settings',
      onConfirm: async () => {
        await updateGmailVacationSettings(gmailAccessToken, vacationDraft);
        setIsVacationModalOpen(false);
        showBanner(
          'success',
          isRtl ? 'تنظیمات پاسخگوی خودکار ذخیره شد.' : 'Auto-responder settings saved.'
        );
      },
    });
  };

  const labelDisplayName = (lbl: GmailLabel): string => {
    const map: Record<string, { fa: string; en: string }> = {
      INBOX: { fa: 'صندوق ورودی', en: 'Inbox' },
      STARRED: { fa: 'ستاره‌دار', en: 'Starred' },
      SENT: { fa: 'ارسال شده', en: 'Sent' },
      DRAFT: { fa: 'پیش‌نویس‌ها', en: 'Drafts' },
      SPAM: { fa: 'هرزنامه', en: 'Spam' },
      TRASH: { fa: 'زباله‌دان', en: 'Trash' },
    };
    if (map[lbl.id]) return isRtl ? map[lbl.id].fa : map[lbl.id].en;
    return lbl.name;
  };

  const systemLabels = SYSTEM_LABEL_ORDER.map((id) => labels.find((l) => l.id === id)).filter(
    (l): l is GmailLabel => Boolean(l)
  );
  const customLabels = labels.filter((l) => l.type === 'user');

  // Gate: Not authenticated for Gmail yet -> render official Sign in with Google button
  if (!gmailAccessToken) {
    return (
      <div className="p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-slate-50/80 dark:bg-[#060F26]/80 text-center space-y-5 max-w-xl mx-auto my-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#144AE0] to-[#091A42] text-white flex items-center justify-center shadow-lg">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#091A42] dark:text-white">
            {isRtl ? 'اتصال امن به صندوق جیمیل (Gmail)' : 'Connect Your Gmail Mailbox'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isRtl
              ? 'برای مشاهده ایمیل‌ها، جستجو در صندوق ورودی، مدیریت برچسب‌ها و ارسال پاسخ به مشتریان با اجازه شما، از طریق حساب گوگل وارد شوید. کلید دسترسی فقط در حافظه موقت مرورگر نگهداری می‌شود.'
              : 'Sign in with Google to read, search, organize labels, draft, and send emails directly with your permission. Your access token stays strictly in session memory.'}
          </p>
        </div>

        {gmailAuthError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            {gmailAuthError}
          </div>
        )}

        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={handleConnectClick}
            disabled={gmailConnecting}
            className="gsi-material-button"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {gmailConnecting
                  ? isRtl
                    ? 'در حال اتصال...'
                    : 'Connecting...'
                  : 'Sign in with Google'}
              </span>
              <span style={{ display: 'none' }}>Sign in with Google</span>
            </div>
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {isRtl
              ? 'پیش از ارسال یا حذف هر ایمیل، پنجره تایید نمایش داده می‌شود'
              : 'Explicit confirmation is required before sending or modifying emails'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {statusBanner && (
        <div
          className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="p-1 rounded-lg hover:bg-black/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Gmail Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/50 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FD5202]/15 text-[#FD5202] flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-[#091A42] dark:text-white truncate">
                {profile?.emailAddress || (isRtl ? 'صندوق جیمیل متصل' : 'Connected Gmail')}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                {isRtl ? 'متصل' : 'Connected'}
              </span>
            </div>
            {profile && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {isRtl
                  ? `${profile.messagesTotal.toLocaleString()} پیام / ${profile.threadsTotal.toLocaleString()} گفتگو`
                  : `${profile.messagesTotal.toLocaleString()} messages · ${profile.threadsTotal.toLocaleString()} threads`}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenComposeNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'ایمیل جدید' : 'Compose'}</span>
          </button>

          <button
            type="button"
            onClick={() => void loadMessages(gmailAccessToken, selectedLabelId, activeSearch)}
            disabled={loadingList}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            <span>{isRtl ? 'بروزرسانی' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLabelModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-xs font-semibold cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
            <span>{isRtl ? 'برچسب جدید' : 'New Label'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenVacationSettings}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 border border-slate-200 dark:border-blue-800 text-xs font-semibold cursor-pointer"
            title={isRtl ? 'پاسخگوی خودکار جیمیل' : 'Gmail Auto-Responder'}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRtl ? 'پاسخگوی خودکار' : 'Auto-Reply'}</span>
          </button>

          <button
            type="button"
            onClick={disconnectGmailToken}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'قطع اتصال' : 'Disconnect'}</span>
          </button>
        </div>
      </div>

      {/* Labels + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(systemLabels.length > 0
            ? systemLabels
            : ([
                { id: 'INBOX', name: 'INBOX' },
                { id: 'STARRED', name: 'STARRED' },
                { id: 'SENT', name: 'SENT' },
                { id: 'DRAFT', name: 'DRAFT' },
                { id: 'TRASH', name: 'TRASH' },
              ] as GmailLabel[])
          ).map((lbl) => {
            const active = selectedLabelId === lbl.id;
            return (
              <button
                key={lbl.id}
                type="button"
                onClick={() => {
                  setSelectedLabelId(lbl.id);
                  setSelectedMessageId(null);
                  setSelectedDetail(null);
                }}
                className={`whitespace-nowrap shrink-0 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#144AE0] text-white border-[#144AE0]'
                    : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-blue-900/50 hover:border-[#144AE0]'
                }`}
              >
                {labelDisplayName(lbl)}
              </button>
            );
          })}

          {customLabels.slice(0, 6).map((lbl) => {
            const active = selectedLabelId === lbl.id;
            return (
              <button
                key={lbl.id}
                type="button"
                onClick={() => {
                  setSelectedLabelId(lbl.id);
                  setSelectedMessageId(null);
                  setSelectedDetail(null);
                }}
                className={`whitespace-nowrap shrink-0 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#FD5202] text-white border-[#FD5202]'
                    : 'bg-white dark:bg-[#091A42] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-900/50'
                }`}
              >
                {lbl.name}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 w-full md:w-72">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'جستجو در ایمیل‌ها...' : 'Search Gmail...'}
              className="w-full rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 min-h-[38px] text-xs rounded-xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 focus:outline-none focus:border-[#144AE0]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 min-h-[38px] rounded-xl bg-[#091A42] dark:bg-[#144AE0] text-white text-xs font-bold cursor-pointer"
          >
            {isRtl ? 'جستجو' : 'Go'}
          </button>
        </form>
      </div>

      {/* Split View: Message List + Message Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Message List */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-[#091A42] overflow-hidden flex flex-col max-h-[520px]">
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-blue-900/50 bg-slate-50 dark:bg-[#060F26] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-[#144AE0] dark:text-[#A6D6FE]" />
              <span>
                {isRtl ? `فهرست پیام‌ها (${messages.length})` : `Messages (${messages.length})`}
              </span>
            </span>
            {activeSearch && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSearch('');
                }}
                className="text-[11px] text-[#FD5202] hover:underline cursor-pointer"
              >
                {isRtl ? 'پاک کردن فیلتر' : 'Clear search'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-blue-900/40">
            {loadingList ? (
              <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#144AE0]" />
                <span>{isRtl ? 'در حال بارگذاری ایمیل‌ها...' : 'Loading emails...'}</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-slate-500 dark:text-slate-400">
                {isRtl ? 'پیامی در این بخش یافت نشد.' : 'No emails found in this view.'}
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessageId === msg.id;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => void handleOpenMessage(msg.id)}
                    className={`w-full text-right rtl:text-right ltr:text-left p-3.5 transition-colors cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/40 border-r-4 rtl:border-r-4 ltr:border-r-0 ltr:border-l-4 border-[#144AE0]'
                        : 'hover:bg-slate-50 dark:hover:bg-blue-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs truncate ${
                          msg.isUnread
                            ? 'font-extrabold text-[#091A42] dark:text-white'
                            : 'font-semibold text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {msg.from}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.isStarred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        {msg.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#144AE0]" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        msg.isUnread
                          ? 'font-bold text-[#144AE0] dark:text-[#A6D6FE]'
                          : 'font-medium text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {msg.snippet}
                    </p>
                  </button>
                );
              })
            )}

            {nextPageToken && !loadingList && (
              <div className="p-3 text-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() =>
                    void loadMessages(
                      gmailAccessToken,
                      selectedLabelId,
                      activeSearch,
                      nextPageToken
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-xs font-bold cursor-pointer"
                >
                  {loadingMore
                    ? isRtl
                      ? 'در حال دریافت...'
                      : 'Loading...'
                    : isRtl
                    ? 'نمایش پیام‌های بیشتر'
                    : 'Load more emails'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail Pane */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-[#091A42] flex flex-col max-h-[520px] overflow-hidden">
          {!selectedMessageId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2 min-h-[260px]">
              <MailOpen className="w-10 h-10 opacity-40" />
              <p className="text-xs font-medium">
                {isRtl
                  ? 'یک ایمیل را از فهرست انتخاب کنید تا متن کامل و گزینه‌های پاسخ نمایش داده شود.'
                  : 'Select an email from the list to read its contents and reply.'}
              </p>
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center p-8 gap-2 text-xs text-slate-500 min-h-[260px]">
              <Loader2 className="w-5 h-5 animate-spin text-[#144AE0]" />
              <span>{isRtl ? 'در حال دریافت متن ایمیل...' : 'Loading email content...'}</span>
            </div>
          ) : selectedDetail ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-blue-900/50 bg-slate-50/70 dark:bg-[#060F26] space-y-3 shrink-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#091A42] dark:text-white leading-snug">
                    {selectedDetail.subject}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {selectedDetail.date}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p>
                    <strong className="text-slate-800 dark:text-white">
                      {isRtl ? 'فرستنده:' : 'From:'}
                    </strong>{' '}
                    {selectedDetail.from}
                  </p>
                  {selectedDetail.to && (
                    <p>
                      <strong className="text-slate-800 dark:text-white">
                        {isRtl ? 'گیرنده:' : 'To:'}
                      </strong>{' '}
                      {selectedDetail.to}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenReply(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-[#144AE0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'پاسخ' : 'Reply'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => requestToggleReadConfirmation(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-white dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-xs font-semibold cursor-pointer"
                  >
                    {selectedDetail.isUnread ? (
                      <MailOpen className="w-3.5 h-3.5" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selectedDetail.isUnread
                        ? isRtl
                          ? 'خوانده شد'
                          : 'Mark Read'
                        : isRtl
                        ? 'خوانده‌نشده'
                        : 'Mark Unread'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => requestToggleStarConfirmation(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-white dark:bg-blue-950 border border-slate-200 dark:border-blue-800 text-xs font-semibold cursor-pointer"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        selectedDetail.isStarred ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    />
                    <span>
                      {selectedDetail.isStarred
                        ? isRtl
                          ? 'حذف ستاره'
                          : 'Unstar'
                        : isRtl
                        ? 'ستاره‌دار'
                        : 'Star'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => requestTrashConfirmation(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'زباله‌دان' : 'Trash'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => requestPermanentDeleteConfirmation(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'حذف دائمی' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedDetail.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-blue-900/40">
                    {selectedDetail.attachments.map((att, idx) => (
                      <span
                        key={`${att.filename}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-blue-950 text-[11px] font-medium"
                      >
                        <Paperclip className="w-3 h-3 text-[#144AE0]" />
                        <span>{att.filename}</span>
                      </span>
                    ))}
                  </div>
                )}

                {selectedDetail.htmlBody ? (
                  <iframe
                    title={`Email ${selectedDetail.id}`}
                    sandbox=""
                    srcDoc={selectedDetail.htmlBody}
                    className="w-full min-h-[280px] rounded-xl border border-slate-200 dark:border-blue-900/40 bg-white"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {selectedDetail.textBody || selectedDetail.snippet}
                  </pre>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
          <form
            onSubmit={requestSendEmailConfirmation}
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
          >
            <div className="px-5 py-3.5 bg-[#091A42] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FD5202]" />
                <h4 className="text-sm font-extrabold">
                  {composeThreadId
                    ? isRtl
                      ? 'ارسال پاسخ در جیمیل'
                      : 'Reply via Gmail'
                    : isRtl
                    ? 'ارسال ایمیل جدید از جیمیل'
                    : 'Compose Gmail Message'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'گیرنده (To)' : 'To'}
                </label>
                <input
                  type="text"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'موضوع (Subject)' : 'Subject'}
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder={isRtl ? 'موضوع پیام...' : 'Email subject...'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'متن پیام' : 'Message Body'}
                </label>
                <textarea
                  rows={8}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder={isRtl ? 'متن ایمیل خود را بنویسید...' : 'Write your message...'}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-800 leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#060F26] border-t border-slate-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={requestSaveDraftConfirmation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-800 text-xs font-bold cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>{isRtl ? 'ذخیره پیش‌نویس' : 'Save Draft'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-blue-900/40 cursor-pointer"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'ارسال ایمیل' : 'Send Email'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Create Label Modal */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <form
            onSubmit={requestCreateLabelConfirmation}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold">
                {isRtl ? 'ساخت برچسب جدید در جیمیل' : 'Create Gmail Label'}
              </h4>
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-blue-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder={isRtl ? 'مثلاً: مشتریان VIP' : 'e.g. VIP Clients'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#144AE0] text-white text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'ایجاد برچسب' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vacation Auto-Responder Settings Modal */}
      {isVacationModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <form
            onSubmit={requestSaveVacationConfirmation}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold">
                {isRtl ? 'تنظیمات پاسخگوی خودکار جیمیل' : 'Gmail Vacation Auto-Responder'}
              </h4>
              <button
                type="button"
                onClick={() => setIsVacationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-blue-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {vacationLoading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRtl ? 'در حال دریافت تنظیمات...' : 'Loading settings...'}</span>
              </div>
            ) : (
              <>
                <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vacationDraft.enableAutoReply}
                    onChange={(e) =>
                      setVacationDraft((prev) => ({
                        ...prev,
                        enableAutoReply: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-[#FD5202]"
                  />
                  <span>
                    {isRtl ? 'فعال‌سازی پاسخگوی خودکار' : 'Enable Vacation Auto-Responder'}
                  </span>
                </label>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isRtl ? 'موضوع پاسخ خودکار' : 'Response Subject'}
                  </label>
                  <input
                    type="text"
                    value={vacationDraft.responseSubject || ''}
                    onChange={(e) =>
                      setVacationDraft((prev) => ({
                        ...prev,
                        responseSubject: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isRtl ? 'متن پیام پاسخ خودکار' : 'Response Message'}
                  </label>
                  <textarea
                    rows={4}
                    value={vacationDraft.responseBodyPlainText || ''}
                    onChange={(e) =>
                      setVacationDraft((prev) => ({
                        ...prev,
                        responseBodyPlainText: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-300 dark:border-blue-800"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVacationModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={vacationLoading}
                className="px-4 py-2 rounded-xl bg-[#FD5202] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isRtl ? 'ذخیره تنظیمات' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Dialog for All Destructive / Mutating Operations */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  pendingConfirm.danger
                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300'
                    : 'bg-blue-100 text-[#144AE0] dark:bg-blue-950 dark:text-[#A6D6FE]'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#091A42] dark:text-white">
                  {pendingConfirm.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pendingConfirm.description}
                </p>
              </div>
            </div>

            {pendingConfirm.details && pendingConfirm.details.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/50 space-y-1 text-xs text-slate-700 dark:text-slate-200 break-words">
                {pendingConfirm.details.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={executingAction}
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 min-h-[38px] rounded-xl border border-slate-300 dark:border-blue-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/50 cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={executingAction}
                onClick={() => void executeConfirmedAction()}
                className={`inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-60 ${
                  pendingConfirm.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#FD5202] hover:bg-[#E04600]'
                }`}
              >
                {executingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{pendingConfirm.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
