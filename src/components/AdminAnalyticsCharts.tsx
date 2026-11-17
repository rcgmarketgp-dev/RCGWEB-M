import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Product, SharpeningOrder, Inquiry, CampaignInquiry, Language } from '../types';
import { TrendingUp, Layers } from 'lucide-react';

interface AdminAnalyticsChartsProps {
  language: Language;
  products: Product[];
  sharpeningOrders: SharpeningOrder[];
  inquiries: Inquiry[];
  campaignInquiries: CampaignInquiry[];
  isDark: boolean;
}

export const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({
  language,
  products,
  sharpeningOrders,
  inquiries,
  campaignInquiries,
  isDark,
}) => {
  const isRtl = language === 'fa';

  const monthlyData = useMemo(() => {
    const base = isRtl
      ? [
          { month: 'فروردین', sharpening: 18, leads: 11 },
          { month: 'اردیبهشت', sharpening: 24, leads: 15 },
          { month: 'خرداد', sharpening: 29, leads: 19 },
          { month: 'تیر', sharpening: 34, leads: 22 },
          { month: 'مرداد', sharpening: 41, leads: 27 },
          {
            month: 'شهریور',
            sharpening: 38 + sharpeningOrders.length,
            leads: 24 + inquiries.length + campaignInquiries.length,
          },
        ]
      : [
          { month: 'Apr', sharpening: 18, leads: 11 },
          { month: 'May', sharpening: 24, leads: 15 },
          { month: 'Jun', sharpening: 29, leads: 19 },
          { month: 'Jul', sharpening: 34, leads: 22 },
          { month: 'Aug', sharpening: 41, leads: 27 },
          {
            month: 'Sep',
            sharpening: 38 + sharpeningOrders.length,
            leads: 24 + inquiries.length + campaignInquiries.length,
          },
        ];
    return base;
  }, [isRtl, sharpeningOrders.length, inquiries.length, campaignInquiries.length]);

  const categoryDistribution = useMemo(() => {
    const cats = [
      { key: 'edgebanders', nameFa: 'لبه‌چسبان', nameEn: 'Edgebanders', color: '#144AE0' },
      { key: 'saws', nameFa: 'دورکن', nameEn: 'Table Saws', color: '#FD5202' },
      { key: 'cnc', nameFa: 'سی‌ان‌سی', nameEn: 'CNC', color: '#091A42' },
      { key: 'blades', nameFa: 'اره الماسه', nameEn: 'Blades', color: '#2563EB' },
      { key: 'refurbished', nameFa: 'اورهال شده', nameEn: 'Overhauled', color: '#10B981' },
    ];

    return cats.map((cat) => ({
      name: isRtl ? cat.nameFa : cat.nameEn,
      count: products.filter((p) => p.category === cat.key).length,
      color: isDark && cat.color === '#091A42' ? '#A6D6FE' : cat.color,
    }));
  }, [products, isRtl, isDark]);

  const gridStroke = isDark ? '#1e3a8a' : '#e2e8f0';
  const axisTickColor = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? '#091A42' : '#ffffff';
  const tooltipBorder = isDark ? '#1e40af' : '#cbd5e1';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Monthly Orders & Campaign Leads Area Chart */}
      <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#091A42] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FD5202]" />
              <span>{isRtl ? 'روند سفارشات تیزکاری و سرنخ‌های فروش' : 'Monthly Sharpening & Sales Leads'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isRtl ? 'مقایسه عملکرد ۶ ماهه دپارتمان بازرگانی و مرکز تیزکاری' : '6-month comparison across sharpening & commercial leads'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#144AE0]" />
              {isRtl ? 'تیزکاری' : 'Sharpening'}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FD5202]" />
              {isRtl ? 'استعلام و کمپین' : 'Leads'}
            </span>
          </div>
        </div>

        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="rcgBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#144AE0" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#144AE0" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rcgOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FD5202" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FD5202" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: tooltipText,
                }}
              />
              <Area
                type="monotone"
                dataKey="sharpening"
                name={isRtl ? 'سفارش تیزکاری' : 'Sharpening Orders'}
                stroke="#144AE0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rcgBlueGrad)"
              />
              <Area
                type="monotone"
                dataKey="leads"
                name={isRtl ? 'درخواست و کمپین' : 'Sales Leads'}
                stroke="#FD5202"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rcgOrangeGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment Catalog Distribution Bar Chart */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-900/60 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#091A42] dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE]" />
            <span>{isRtl ? 'توزیع دستگاه‌ها در کاتالوگ' : 'Catalog Distribution by Category'}</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl ? 'تعداد ماشین‌آلات و تجهیزات ثبت‌شده به تفکیک دسته' : 'Active catalog units grouped by machinery type'}
          </p>
        </div>

        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryDistribution} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(30,58,138,0.25)' : 'rgba(226,232,240,0.45)' }}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: tooltipText,
                }}
              />
              <Bar dataKey="count" name={isRtl ? 'تعداد دستگاه' : 'Units'} radius={[8, 8, 0, 0]} maxBarSize={42}>
                {categoryDistribution.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
