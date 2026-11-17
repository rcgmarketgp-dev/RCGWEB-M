import React from 'react';
import { Language, SectionId } from '../types';
import { SlidersHorizontal, Image as ImageIcon, Link2, Type } from 'lucide-react';

interface EditableSectionWrapperProps {
  sectionId: SectionId;
  labelFa: string;
  labelEn: string;
  isEditMode: boolean;
  language: Language;
  onEditSection: (id: SectionId) => void;
  children: React.ReactNode;
}

export const EditableSectionWrapper: React.FC<EditableSectionWrapperProps> = ({
  sectionId,
  labelFa,
  labelEn,
  isEditMode,
  language,
  onEditSection,
  children,
}) => {
  if (!isEditMode) {
    return <>{children}</>;
  }

  const isRtl = language === 'fa';

  return (
    <div
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEditSection(sectionId);
      }}
      className="relative group/editable cursor-pointer"
      title={isRtl ? `کلیک برای ویرایش بخش ${labelFa}` : `Click to edit ${labelEn}`}
    >
      {children}

      {/* Interactive Edit Frame Overlay */}
      <div className="absolute inset-0 z-30 border-2 border-dashed border-[#144AE0]/45 group-hover/editable:border-[#FD5202] group-hover/editable:bg-[#144AE0]/[0.05] transition-all duration-200 pointer-events-auto flex items-start justify-end p-3 sm:p-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#091A42]/95 group-hover/editable:bg-[#FD5202] text-white text-xs font-bold shadow-lg border border-blue-400/40 group-hover/editable:border-orange-300 transition-all backdrop-blur-md">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            {isRtl ? `تنظیمات بخش: ${labelFa}` : `Edit: ${labelEn}`}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] opacity-85 border-s border-white/25 ps-2">
            <Type className="w-3 h-3" />
            <ImageIcon className="w-3 h-3" />
            <Link2 className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
