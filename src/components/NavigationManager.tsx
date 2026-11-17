import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavLinkItem, Language } from '../types';
import { GripVertical, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';

interface SortableLinkRowProps {
  link: NavLinkItem;
  language: Language;
  onUpdateLabel: (id: string, field: 'labelFa' | 'labelEn', value: string) => void;
  onToggleVisibility: (id: string) => void;
}

const SortableLinkRow: React.FC<SortableLinkRowProps> = ({
  link,
  language,
  onUpdateLabel,
  onToggleVisibility,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  const isRtl = language === 'fa';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 rounded-2xl border transition-shadow flex flex-col sm:flex-row sm:items-center gap-3 ${
        isDragging
          ? 'bg-blue-50 dark:bg-blue-950 border-[#144AE0] shadow-xl'
          : 'bg-white dark:bg-[#091A42] border-slate-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700'
      }`}
    >
      {/* Drag Handle & ID badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#060F26] dark:hover:bg-blue-950 text-slate-500 dark:text-slate-400 cursor-grab active:cursor-grabbing border border-slate-200 dark:border-blue-900"
          title={isRtl ? 'بکشید و جابجا کنید' : 'Drag to reorder'}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 font-mono text-[11px] font-bold text-[#144AE0] dark:text-[#A6D6FE]">
          #{link.targetId}
        </span>
      </div>

      {/* Bilingual Label Inputs */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {isRtl ? 'عنوان فارسی منو' : 'Persian Label'}
          </label>
          <input
            type="text"
            value={link.labelFa}
            onChange={(e) => onUpdateLabel(link.id, 'labelFa', e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {isRtl ? 'عنوان انگلیسی (English)' : 'English Label'}
          </label>
          <input
            type="text"
            value={link.labelEn}
            onChange={(e) => onUpdateLabel(link.id, 'labelEn', e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900 focus:border-[#FD5202] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-end shrink-0">
        <button
          type="button"
          onClick={() => onToggleVisibility(link.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            link.isVisible
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {link.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{link.isVisible ? (isRtl ? 'نمایش در منو' : 'Visible') : (isRtl ? 'مخفی' : 'Hidden')}</span>
        </button>
      </div>
    </div>
  );
};

interface NavigationManagerProps {
  navLinks: NavLinkItem[];
  language: Language;
  onUpdateNavLinks: (links: NavLinkItem[]) => void;
  onNotify: (msg: string) => void;
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({
  navLinks,
  language,
  onUpdateNavLinks,
  onNotify,
}) => {
  const isRtl = language === 'fa';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = navLinks.findIndex((item) => item.id === active.id);
      const newIndex = navLinks.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(navLinks, oldIndex, newIndex);
      onUpdateNavLinks(reordered);
      onNotify(isRtl ? 'ترتیب لینک‌های منو و فوتر ذخیره شد' : 'Navigation order updated');
    }
  };

  const handleUpdateLabel = (id: string, field: 'labelFa' | 'labelEn', value: string) => {
    const updated = navLinks.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdateNavLinks(updated);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = navLinks.map((item) =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    onUpdateNavLinks(updated);
    onNotify(isRtl ? 'وضعیت نمایش لینک تغییر یافت' : 'Link visibility updated');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
        <LinkIcon className="w-4 h-4 text-[#144AE0] dark:text-[#A6D6FE] shrink-0" />
        <span>
          {isRtl
            ? 'با کشیدن دستگیره سمت راست هر آیتم می‌توانید ترتیب نمایش لینک‌ها را در هدر سایت و دسترسی سریع فوتر به‌صورت آنی تغییر دهید.'
            : 'Drag any row using the handle to reorder navigation items in both the main header and footer.'}
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={navLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {navLinks.map((link) => (
              <SortableLinkRow
                key={link.id}
                link={link}
                language={language}
                onUpdateLabel={handleUpdateLabel}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
