/**
 * Safely navigates a customizable CTA button link (internal section #id, modal trigger, or external URL)
 * without using window.open.
 */
export function triggerCtaLink(
  link: string | undefined,
  fallback: () => void,
  onOpenConsultation?: () => void
) {
  const target = (link || '').trim();
  if (!target || target === '#default') {
    fallback();
    return;
  }

  if (target === '#consultation-modal' || target === '#consultation') {
    if (onOpenConsultation) {
      onOpenConsultation();
    } else {
      fallback();
    }
    return;
  }

  if (target.startsWith('#')) {
    const id = target.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    fallback();
    return;
  }

  if (target.startsWith('tel:') || target.startsWith('mailto:')) {
    window.location.href = target;
    return;
  }

  // External or relative URL via programmatic anchor (avoids window.open)
  const anchor = document.createElement('a');
  anchor.href = target;
  if (target.startsWith('http://') || target.startsWith('https://')) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  }
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
