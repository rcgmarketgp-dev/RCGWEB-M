import React from 'react';
import { Language, SectionId } from '../types';
import { SlidersHorizontal, Image as ImageIcon, Link2, Type } from 'lucide-react';
import { motion } from 'motion/react';

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
  const isRtl = language === 'fa';
  const isHero = sectionId === 'hero';

  const motionProps = isHero
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
      }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.04 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      };

  if (!isEditMode) {
    return (
      <motion.div
        {...motionProps}
        className="w-full"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      {...motionProps}
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEditSection(sectionId);
      }}
      className="relative group/editable cursor-pointer w-full"
      title={isRtl ? `کلیک برای ویرایش بخش ${labelFa}` : `Click to edit ${labelEn}`}
    >
      {children}

      {/* Interactive Edit Frame Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-30 border-2 border-dashed border-[#144AE0]/45 group-hover/editable:border-[#FD5202] group-hover/editable:bg-[#144AE0]/[0.05] transition-all duration-200 pointer-events-auto flex items-start justify-end p-3 sm:p-5"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#091A42]/95 group-hover/editable:bg-[#FD5202] text-white text-xs font-bold shadow-lg border border-blue-400/40 group-hover/editable:border-orange-300 transition-colors backdrop-blur-md"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            {isRtl ? `تنظیمات بخش: ${labelFa}` : `Edit: ${labelEn}`}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] opacity-85 border-s border-white/25 ps-2">
            <Type className="w-3 h-3" />
            <ImageIcon className="w-3 h-3" />
            <Link2 className="w-3 h-3" />
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
