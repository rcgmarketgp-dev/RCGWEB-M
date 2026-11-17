import React from 'react';
import { Language, SectionId, UiInteractionMode } from '../types';
import { SlidersHorizontal, Image as ImageIcon, Link2, Type } from 'lucide-react';
import { motion } from 'motion/react';

interface EditableSectionWrapperProps {
  sectionId: SectionId;
  labelFa: string;
  labelEn: string;
  isEditMode: boolean;
  language: Language;
  uiInteraction?: UiInteractionMode;
  onEditSection: (id: SectionId) => void;
  children: React.ReactNode;
}

function getSectionTransition(mode: UiInteractionMode = 'corporate-smooth', isHero: boolean) {
  if (mode === 'reduced-instant') {
    return { duration: 0.01 };
  }
  if (mode === 'snappy-tech') {
    return { duration: isHero ? 0.35 : 0.38, ease: [0.2, 0.8, 0.2, 1] as const };
  }
  if (mode === 'spring-playful') {
    return {
      type: 'spring' as const,
      stiffness: 180,
      damping: 22,
      mass: 0.85,
    };
  }
  return {
    duration: isHero ? 0.55 : 0.62,
    ease: [0.16, 1, 0.3, 1] as const,
  };
}

export const EditableSectionWrapper: React.FC<EditableSectionWrapperProps> = ({
  sectionId,
  labelFa,
  labelEn,
  isEditMode,
  language,
  uiInteraction = 'corporate-smooth',
  onEditSection,
  children,
}) => {
  const isRtl = language === 'fa';
  const isHero = sectionId === 'hero';
  const instant = uiInteraction === 'reduced-instant';
  const transition = getSectionTransition(uiInteraction, isHero);

  const motionProps = isHero
    ? {
        initial: instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition,
      }
    : {
        initial: instant ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 22, scale: 0.992 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 'some' as const, margin: '80px 0px -24px 0px' },
        transition,
      };

  const snapClass = sectionId === 'footer' ? 'snap-end scroll-mt-20' : 'snap-start scroll-mt-20';

  if (!isEditMode) {
    return (
      <motion.div
        {...motionProps}
        className={`w-full ${snapClass}`}
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
      className={`relative group/editable cursor-pointer w-full ${snapClass}`}
      title={isRtl ? `کلیک برای ویرایش بخش ${labelFa}` : `Click to edit ${labelEn}`}
    >
      {children}

      {/* Interactive Edit Frame Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-30 border-2 border-dashed border-[#144AE0]/45 group-hover/editable:border-[#FD5202] group-hover/editable:bg-[#144AE0]/[0.05] transition-all duration-200 pointer-events-auto flex items-start justify-end p-2 sm:p-5"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#091A42]/95 group-hover/editable:bg-[#FD5202] text-white text-[11px] sm:text-xs font-bold shadow-lg border border-blue-400/40 group-hover/editable:border-orange-300 transition-colors backdrop-blur-md"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
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
