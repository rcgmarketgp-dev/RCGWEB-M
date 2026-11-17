export interface CropPresetSpec {
  id: string;
  aspectRatio: number | null; // null = original / free aspect ratio (e.g. custom logos)
  aspectLabelFa: string;
  aspectLabelEn: string;
  shortBadge: string;
  maxWidth: number;
  maxHeight: number;
  preserveTransparency?: boolean;
}

export const CROP_PRESETS = {
  HERO_SLIDE_16_11: {
    id: 'hero_slide',
    aspectRatio: 16 / 11,
    aspectLabelFa: 'کادر اسلاید هیرو (۱۶:۱۱)',
    aspectLabelEn: 'Hero Showcase (16:11)',
    shortBadge: '16:11',
    maxWidth: 1280,
    maxHeight: 880,
  } as CropPresetSpec,

  HERO_BACKDROP_16_9: {
    id: 'hero_backdrop',
    aspectRatio: 16 / 9,
    aspectLabelFa: 'پس‌زمینه عریض هیرو (۱۶:۹)',
    aspectLabelEn: 'Hero Backdrop (16:9)',
    shortBadge: '16:9',
    maxWidth: 1440,
    maxHeight: 810,
  } as CropPresetSpec,

  DEPT_MAIN_16_7: {
    id: 'dept_main',
    aspectRatio: 16 / 7,
    aspectLabelFa: 'بنر اصلی رکن دپارتمان (۱۶:۷)',
    aspectLabelEn: 'Department Main Banner (16:7)',
    shortBadge: '16:7',
    maxWidth: 1280,
    maxHeight: 560,
  } as CropPresetSpec,

  DEPT_SUBCARD_4_3: {
    id: 'dept_subcard',
    aspectRatio: 4 / 3,
    aspectLabelFa: 'تصویر زیرکارت دپارتمان (۴:۳)',
    aspectLabelEn: 'Department Sub-Card (4:3)',
    shortBadge: '4:3',
    maxWidth: 800,
    maxHeight: 600,
  } as CropPresetSpec,

  ABOUT_16_10: {
    id: 'about',
    aspectRatio: 16 / 10,
    aspectLabelFa: 'تصویر معرفی مجموعه (۱۶:۱۰)',
    aspectLabelEn: 'Facility Showcase (16:10)',
    shortBadge: '16:10',
    maxWidth: 1200,
    maxHeight: 750,
  } as CropPresetSpec,

  BANNER_16_9: {
    id: 'banner',
    aspectRatio: 16 / 9,
    aspectLabelFa: 'بنر استاندارد (۱۶:۹)',
    aspectLabelEn: 'Standard Widescreen (16:9)',
    shortBadge: '16:9',
    maxWidth: 1280,
    maxHeight: 720,
  } as CropPresetSpec,

  LOGO_FREE: {
    id: 'logo',
    aspectRatio: null,
    aspectLabelFa: 'لوگو (کادر اصلی + حفظ شفافیت)',
    aspectLabelEn: 'Brand Logo (Original / Transparent)',
    shortBadge: 'Logo / PNG',
    maxWidth: 640,
    maxHeight: 240,
    preserveTransparency: true,
  } as CropPresetSpec,
};

export interface CropGeometry {
  dispW: number;
  dispH: number;
  displayScale: number;
  maxPanX: number;
  maxPanY: number;
  clampedPanX: number;
  clampedPanY: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function computeCropGeometry(params: {
  naturalWidth: number;
  naturalHeight: number;
  cropBoxWidth: number;
  cropBoxHeight: number;
  zoom: number;
  panX: number;
  panY: number;
}): CropGeometry {
  const { naturalWidth, naturalHeight, cropBoxWidth, cropBoxHeight, zoom, panX, panY } = params;
  const safeNW = Math.max(1, naturalWidth);
  const safeNH = Math.max(1, naturalHeight);
  const safeCW = Math.max(1, cropBoxWidth);
  const safeCH = Math.max(1, cropBoxHeight);
  const safeZoom = Math.max(1, zoom);

  // At zoom=1, the image fully covers the crop frame
  const baseScale = Math.max(safeCW / safeNW, safeCH / safeNH);
  const displayScale = baseScale * safeZoom;

  const dispW = safeNW * displayScale;
  const dispH = safeNH * displayScale;

  const maxPanX = Math.max(0, (dispW - safeCW) / 2);
  const maxPanY = Math.max(0, (dispH - safeCH) / 2);

  const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, panX));
  const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, panY));

  const imgLeft = safeCW / 2 + clampedPanX - dispW / 2;
  const imgTop = safeCH / 2 + clampedPanY - dispH / 2;

  const rawSx = -imgLeft / displayScale;
  const rawSy = -imgTop / displayScale;
  const rawSw = safeCW / displayScale;
  const rawSh = safeCH / displayScale;

  const sx = Math.max(0, Math.min(safeNW - 1, rawSx));
  const sy = Math.max(0, Math.min(safeNH - 1, rawSy));
  const sw = Math.max(1, Math.min(safeNW - sx, rawSw));
  const sh = Math.max(1, Math.min(safeNH - sy, rawSh));

  return {
    dispW,
    dispH,
    displayScale,
    maxPanX,
    maxPanY,
    clampedPanX,
    clampedPanY,
    sx,
    sy,
    sw,
    sh,
  };
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl.length;
  const base64 = dataUrl.slice(commaIdx + 1);
  // Base64 encodes 3 bytes per 4 chars
  return Math.round((base64.length * 3) / 4);
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isRemote =
      /^https?:\/\//i.test(src) &&
      typeof window !== 'undefined' &&
      !src.startsWith(window.location.origin);

    if (isRemote) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
    img.src = src;
  });
}

export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  byteSize: number;
  mimeType: string;
}

const FIRESTORE_SAFE_DATAURL_MAX_CHARS = 460_000;

export function renderCroppedOptimizedImage(params: {
  image: HTMLImageElement;
  cropBoxWidth: number;
  cropBoxHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  targetAspectRatio: number;
  maxWidth: number;
  maxHeight: number;
  preserveTransparency?: boolean;
}): OptimizedImageResult {
  const {
    image,
    cropBoxWidth,
    cropBoxHeight,
    zoom,
    panX,
    panY,
    targetAspectRatio,
    maxWidth,
    maxHeight,
    preserveTransparency = false,
  } = params;

  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;

  const geom = computeCropGeometry({
    naturalWidth,
    naturalHeight,
    cropBoxWidth,
    cropBoxHeight,
    zoom,
    panX,
    panY,
  });

  // Never upscale low-res assets beyond their cropped natural pixels; downscale hi-res assets cleanly
  const downscaleRatio = Math.min(1, maxWidth / geom.sw, maxHeight / geom.sh);
  let outW = Math.max(1, Math.round(geom.sw * downscaleRatio));
  let outH = Math.max(1, Math.round(outW / Math.max(0.1, targetAspectRatio)));

  if (outH > maxHeight) {
    outH = maxHeight;
    outW = Math.max(1, Math.round(outH * targetAspectRatio));
  }

  const drawCanvas = (w: number, h: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('CANVAS_UNSUPPORTED');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (!preserveTransparency) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    ctx.drawImage(image, geom.sx, geom.sy, geom.sw, geom.sh, 0, 0, w, h);
    return canvas;
  };

  let canvas = drawCanvas(outW, outH);

  // Check transparent logo path first
  if (preserveTransparency) {
    const pngUrl = canvas.toDataURL('image/png');
    if (pngUrl.length <= FIRESTORE_SAFE_DATAURL_MAX_CHARS) {
      return {
        dataUrl: pngUrl,
        width: outW,
        height: outH,
        byteSize: estimateDataUrlBytes(pngUrl),
        mimeType: 'image/png',
      };
    }

    // Fallback to transparent WebP when high-res PNG exceeds safe payload budget
    const webpCandidates = [0.9, 0.82, 0.72];
    for (const q of webpCandidates) {
      const candidate = canvas.toDataURL('image/webp', q);
      if (candidate.startsWith('data:image/webp') && candidate.length <= FIRESTORE_SAFE_DATAURL_MAX_CHARS) {
        return {
          dataUrl: candidate,
          width: outW,
          height: outH,
          byteSize: estimateDataUrlBytes(candidate),
          mimeType: 'image/webp',
        };
      }
    }
  }

  // Photographic adaptive compression (prefer WebP, fall back to JPEG)
  const testWebp = canvas.toDataURL('image/webp', 0.86);
  const preferredMime = testWebp.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  const qualitySteps = [0.86, 0.8, 0.74, 0.66, 0.58];

  for (const q of qualitySteps) {
    const candidate = canvas.toDataURL(preferredMime, q);
    if (candidate.length <= FIRESTORE_SAFE_DATAURL_MAX_CHARS) {
      return {
        dataUrl: candidate,
        width: outW,
        height: outH,
        byteSize: estimateDataUrlBytes(candidate),
        mimeType: preferredMime,
      };
    }
  }

  // Extreme resolution fallback: scale dimensions down slightly so it always passes Firestore rule < 700KB
  for (const scaleFactor of [0.8, 0.65]) {
    const reducedW = Math.max(320, Math.round(outW * scaleFactor));
    const reducedH = Math.max(180, Math.round(outH * scaleFactor));
    canvas = drawCanvas(reducedW, reducedH);
    const candidate = canvas.toDataURL(preferredMime, 0.72);
    if (candidate.length <= FIRESTORE_SAFE_DATAURL_MAX_CHARS || scaleFactor === 0.65) {
      return {
        dataUrl: candidate,
        width: reducedW,
        height: reducedH,
        byteSize: estimateDataUrlBytes(candidate),
        mimeType: preferredMime,
      };
    }
  }

  const finalFallback = canvas.toDataURL('image/jpeg', 0.68);
  return {
    dataUrl: finalFallback,
    width: outW,
    height: outH,
    byteSize: estimateDataUrlBytes(finalFallback),
    mimeType: 'image/jpeg',
  };
}
