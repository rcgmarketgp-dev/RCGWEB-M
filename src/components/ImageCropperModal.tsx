import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '../types';
import {
  CropPresetSpec,
  OptimizedImageResult,
  computeCropGeometry,
  loadImageElement,
  renderCroppedOptimizedImage,
} from '../utils/imageOptimize';
import { formatAssetBytes } from '../utils/assetCategories';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Move,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  sourceUrl: string;
  titleLabel: string;
  originalSizeBytes?: number;
  preset: CropPresetSpec;
  language: Language;
  onConfirm: (result: OptimizedImageResult) => void;
  onClose: () => void;
}

interface RatioChoice {
  id: string;
  labelFa: string;
  labelEn: string;
  ratio: number | null; // null = natural
}

const RATIO_CHOICES: RatioChoice[] = [
  { id: 'recommended', labelFa: 'پیشنهادی بخش', labelEn: 'Recommended', ratio: -1 },
  { id: '16_11', labelFa: '۱۶:۱۱ هیرو', labelEn: '16:11 Hero', ratio: 16 / 11 },
  { id: '16_7', labelFa: '۱۶:۷ رکن اصلی', labelEn: '16:7 Dept Banner', ratio: 16 / 7 },
  { id: '4_3', labelFa: '۴:۳ زیرکارت', labelEn: '4:3 Sub-Card', ratio: 4 / 3 },
  { id: '16_10', labelFa: '۱۶:۱۰ معرفی', labelEn: '16:10 Showcase', ratio: 16 / 10 },
  { id: '16_9', labelFa: '۱۶:۹ واید', labelEn: '16:9 Wide', ratio: 16 / 9 },
  { id: '1_1', labelFa: '۱:۱ مربع', labelEn: '1:1 Square', ratio: 1 },
  { id: 'original', labelFa: 'نسبت اصلی عکس', labelEn: 'Original Ratio', ratio: null },
];

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  sourceUrl,
  titleLabel,
  originalSizeBytes,
  preset,
  language,
  onConfirm,
  onClose,
}) => {
  const isRtl = language === 'fa';
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stageWidth, setStageWidth] = useState(520);
  const [selectedRatioId, setSelectedRatioId] = useState<string>('recommended');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(
    null
  );
  const [processing, setProcessing] = useState(false);

  // Measure available container width for 1:1 responsive drag math
  useEffect(() => {
    if (!isOpen) return;
    const el = stageContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = Math.max(240, Math.min(540, el.clientWidth - 24));
      setStageWidth(w);
    };
    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  // Load source image when modal opens
  useEffect(() => {
    if (!isOpen || !sourceUrl) return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    setLoadedImg(null);
    setSelectedRatioId('recommended');
    setZoom(1);
    setPan({ x: 0, y: 0 });

    loadImageElement(sourceUrl)
      .then((img) => {
        if (!active) return;
        setLoadedImg(img);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(
          isRtl
            ? 'بارگذاری تصویر برای برش با محدودیت دسترسی یا خطا مواجه شد. لطفاً تصویر را از سیستم آپلود کنید.'
            : 'Unable to load image for canvas cropping (external CORS restriction or invalid image). Please upload directly from your device.'
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, sourceUrl, isRtl]);

  const naturalWidth = loadedImg ? loadedImg.naturalWidth || loadedImg.width : 1200;
  const naturalHeight = loadedImg ? loadedImg.naturalHeight || loadedImg.height : 800;
  const naturalAspect = naturalWidth / Math.max(1, naturalHeight);

  const activeAspect = useMemo(() => {
    if (selectedRatioId === 'recommended') {
      return preset.aspectRatio ?? naturalAspect;
    }
    const found = RATIO_CHOICES.find((c) => c.id === selectedRatioId);
    if (!found || found.ratio === null) return naturalAspect;
    return found.ratio;
  }, [selectedRatioId, preset.aspectRatio, naturalAspect]);

  // Fit crop frame inside stageWidth x maxStageHeight cleanly
  const { cropBoxWidth, cropBoxHeight } = useMemo(() => {
    const maxW = stageWidth;
    const maxH = 310;
    let w = maxW;
    let h = w / Math.max(0.25, activeAspect);
    if (h > maxH) {
      h = maxH;
      w = h * Math.max(0.25, activeAspect);
    }
    return {
      cropBoxWidth: Math.round(w),
      cropBoxHeight: Math.round(h),
    };
  }, [stageWidth, activeAspect]);

  const geom = useMemo(
    () =>
      computeCropGeometry({
        naturalWidth,
        naturalHeight,
        cropBoxWidth,
        cropBoxHeight,
        zoom,
        panX: pan.x,
        panY: pan.y,
      }),
    [naturalWidth, naturalHeight, cropBoxWidth, cropBoxHeight, zoom, pan]
  );

  // Estimate output resolution for live badge
  const targetDimensions = useMemo(() => {
    const ratio = Math.min(1, preset.maxWidth / geom.sw, preset.maxHeight / geom.sh);
    let outW = Math.max(1, Math.round(geom.sw * ratio));
    let outH = Math.max(1, Math.round(outW / Math.max(0.1, activeAspect)));
    if (outH > preset.maxHeight) {
      outH = preset.maxHeight;
      outW = Math.max(1, Math.round(outH * activeAspect));
    }
    return { outW, outH };
  }, [geom.sw, geom.sh, preset.maxWidth, preset.maxHeight, activeAspect]);

  // Keep pan clamped when zoom or aspect changes
  useEffect(() => {
    setPan((prev) => ({
      x: Math.max(-geom.maxPanX, Math.min(geom.maxPanX, prev.x)),
      y: Math.max(-geom.maxPanY, Math.min(geom.maxPanY, prev.y)),
    }));
  }, [geom.maxPanX, geom.maxPanY]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!loadedImg || loading || loadError) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: geom.clampedPanX,
      panY: geom.clampedPanY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    setPan({
      x: Math.max(-geom.maxPanX, Math.min(geom.maxPanX, dragStartRef.current.panX + dx)),
      y: Math.max(-geom.maxPanY, Math.min(geom.maxPanY, dragStartRef.current.panY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!loadedImg || loading) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((z) => Math.max(1, Math.min(3.5, Number((z + delta).toFixed(2)))));
  };

  const handleApplyCrop = () => {
    if (!loadedImg) return;
    setProcessing(true);
    setLoadError(null);

    try {
      const result = renderCroppedOptimizedImage({
        image: loadedImg,
        cropBoxWidth,
        cropBoxHeight,
        zoom,
        panX: geom.clampedPanX,
        panY: geom.clampedPanY,
        targetAspectRatio: activeAspect,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
        preserveTransparency: preset.preserveTransparency,
      });
      onConfirm(result);
    } catch {
      setLoadError(
        isRtl
          ? 'مرورگر امکان خروجی گرفتن از این آدرس خارجی (CORS) را نداد. لطفاً فایل تصویر را از سیستم خود آپلود کنید.'
          : 'Browser blocked canvas export on this remote URL due to CORS. Please upload the image file from your device.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-md"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-[#060F26] border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#FD5202] text-white shrink-0">
              <Crop className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-black text-[#091A42] dark:text-white truncate">
                {isRtl ? 'برش هوشمند و بهینه‌سازی تصویر' : 'Crop & Optimize Image'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-[#A6D6FE] truncate">
                {titleLabel} — {isRtl ? preset.aspectLabelFa : preset.aspectLabelEn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-800 text-slate-500 hover:text-[#FD5202] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
          {/* Interactive Crop Viewport */}
          <div
            ref={stageContainerRef}
            className="w-full flex flex-col items-center justify-center p-3 rounded-2xl bg-[#050B18] border border-blue-900/70 select-none"
          >
            {loading ? (
              <div className="h-[260px] flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
                <div className="w-7 h-7 border-2 border-[#FD5202] border-t-transparent rounded-full animate-spin" />
                <span>{isRtl ? 'در حال آماده‌سازی تصویر...' : 'Loading image canvas...'}</span>
              </div>
            ) : loadError ? (
              <div className="h-[240px] flex flex-col items-center justify-center gap-2.5 text-center px-4">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <p className="text-xs text-amber-200 leading-relaxed max-w-md">{loadError}</p>
              </div>
            ) : (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                style={{
                  width: cropBoxWidth,
                  height: cropBoxHeight,
                  touchAction: 'none',
                }}
                className={`relative overflow-hidden rounded-xl border-2 border-[#FD5202] shadow-[0_0_0_9999px_rgba(3,7,18,0.45)] ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                } ${
                  preset.preserveTransparency
                    ? 'bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]'
                    : 'bg-slate-950'
                }`}
              >
                {loadedImg && (
                  <img
                    src={sourceUrl}
                    alt="Crop target"
                    draggable={false}
                    style={{
                      width: geom.dispW,
                      height: geom.dispH,
                      maxWidth: 'none',
                      maxHeight: 'none',
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${geom.clampedPanX}px), calc(-50% + ${geom.clampedPanY}px))`,
                    }}
                    className="absolute pointer-events-none select-none"
                  />
                )}

                {/* Rule of Thirds Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="border border-white/15" />
                  ))}
                </div>

                {/* Corner Brackets */}
                <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white pointer-events-none" />
              </div>
            )}

            {!loading && !loadError && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-300">
                <Move className="w-3.5 h-3.5 text-[#A6D6FE]" />
                <span>
                  {isRtl
                    ? 'تصویر را بکشید تا کادر دقیق تنظیم شود • با اسکرول یا اسلایدر زوم کنید'
                    : 'Drag image to reposition frame • Scroll or use slider to zoom'}
                </span>
              </div>
            )}
          </div>

          {/* Zoom & Reset Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060F26] border border-slate-200 dark:border-blue-900/60 space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 hover:border-[#FD5202] cursor-pointer"
                title={isRtl ? 'کوچک‌نمایی' : 'Zoom out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={1}
                max={3.5}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 min-w-[110px] accent-[#FD5202] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.15).toFixed(2))))}
                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-slate-600 dark:text-slate-300 hover:border-[#FD5202] cursor-pointer"
                title={isRtl ? 'بزرگ‌نمایی' : 'Zoom in'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-[#091A42] dark:text-[#A6D6FE] w-11 text-center">
                {zoom.toFixed(1)}x
              </span>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white dark:bg-[#091A42] border border-slate-200 dark:border-blue-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-[#144AE0] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'بازنشانی' : 'Reset'}</span>
              </button>
            </div>

            {/* Aspect Ratio Selector Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                {isRtl ? 'نسبت ابعاد کادر:' : 'Target Aspect Ratio:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {RATIO_CHOICES.map((choice) => {
                  const isActive = selectedRatioId === choice.id;
                  const label =
                    choice.id === 'recommended'
                      ? `${isRtl ? choice.labelFa : choice.labelEn} (${preset.shortBadge})`
                      : isRtl
                      ? choice.labelFa
                      : choice.labelEn;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        setSelectedRatioId(choice.id);
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#144AE0] text-white border-[#144AE0] shadow-xs'
                          : 'bg-white dark:bg-[#091A42] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-900 hover:border-[#FD5202]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Optimization Metrics Summary */}
          {!loading && !loadError && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <Sparkles className="w-4 h-4 text-[#FD5202]" />
                <span>
                  {isRtl
                    ? `خروجی بهینه: ${targetDimensions.outW}×${targetDimensions.outH} پیکسل`
                    : `Optimized Output: ${targetDimensions.outW}×${targetDimensions.outH} px`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-mono">
                <span>
                  {isRtl ? 'اصلی:' : 'Src:'} {naturalWidth}×{naturalHeight}
                  {originalSizeBytes ? ` (${formatAssetBytes(originalSizeBytes)})` : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-[#060F26] border-t border-slate-200 dark:border-blue-900/60 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 min-h-[40px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer text-center"
          >
            {isRtl ? 'انصراف' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={loading || !!loadError || processing}
            onClick={handleApplyCrop}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 min-h-[40px] rounded-xl bg-[#FD5202] hover:bg-[#E04600] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {processing
                ? isRtl
                  ? 'در حال بهینه‌سازی...'
                  : 'Optimizing...'
                : isRtl
                ? 'برش و تایید نهایی'
                : 'Crop & Apply'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
