import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Language } from '../types';

interface ScrollProgressBarProps {
  language: Language;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ language }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 32,
    restDelta: 0.001,
  });

  const [inReadingZone, setInReadingZone] = useState(false);

  useEffect(() => {
    const mediaEl = document.getElementById('media');
    const aboutEl = document.getElementById('about');
    if (!mediaEl && !aboutEl) return;

    const visibleSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });
        setInReadingZone(visibleSections.size > 0);
      },
      {
        rootMargin: '-15% 0px -15% 0px',
        threshold: 0.05,
      }
    );

    if (mediaEl) observer.observe(mediaEl);
    if (aboutEl) observer.observe(aboutEl);

    return () => observer.disconnect();
  }, []);

  const isRtl = language === 'fa';

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[45] pointer-events-none bg-slate-200/35 dark:bg-blue-950/40"
      aria-hidden="true"
    >
      <motion.div
        className={`h-full transition-opacity duration-300 ${
          inReadingZone
            ? 'opacity-100 bg-gradient-to-r from-[#144AE0] via-[#FD5202] to-[#FD5202] shadow-[0_0_8px_rgba(253,82,2,0.45)]'
            : 'opacity-80 bg-gradient-to-r from-[#144AE0] to-[#FD5202]'
        }`}
        style={{
          scaleX,
          transformOrigin: isRtl ? 'right center' : 'left center',
        }}
      />
    </div>
  );
};
