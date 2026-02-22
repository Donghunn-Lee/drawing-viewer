import type { Drawing, Metadata } from '../../shared/types/metadata';

type GetBaseImageSrcParams = {
  drawing: Drawing;
  activeDiscipline: string | null;
  activeRevision: string | null;
};

// NOTE: legacy selector from early site-based exploration
// kept for reference during MVP iteration, may be removed later
export const getSiteList = (metadata: Metadata) => {
  const root = Object.values(metadata.drawings).find((d) => d.parent === null);
  if (!root) return [];

  return Object.values(metadata.drawings)
    .filter((d) => d.parent === root.id)
    .map((d) => ({ id: d.id, name: d.name }));
};

export function getBaseImageSrc({
  drawing,
  activeDiscipline,
  activeRevision,
}: GetBaseImageSrcParams): string {
  // basic drawing image as default
  if (!activeDiscipline) {
    return `/drawings/${drawing.image}`;
  }

  const discipline = drawing.disciplines?.[activeDiscipline];
  if (!discipline) {
    return `/drawings/${drawing.image}`;
  }

  const revisions = discipline.revisions ?? [];

  // if revision is selected, use it
  if (activeRevision) {
    const selected = revisions.find((r) => r.version === activeRevision);
    if (selected) {
      return `/drawings/${selected.image}`;
    }
  }

  // if no revision selected, fallback to latest
  if (revisions.length > 0) {
    return `/drawings/${revisions[revisions.length - 1].image}`;
  }

  // if no revisions, use discipline image
  if (discipline.image) {
    return `/drawings/${discipline.image}`;
  }

  // final fallback: drawing image
  return `/drawings/${drawing.image}`;
}

export function getOverlayImageSrc(
  drawing: Drawing,
  overlayDiscipline: string | null,
): string | null {
  if (!overlayDiscipline) return null;

  const discipline = drawing.disciplines?.[overlayDiscipline];

  if (!discipline?.imageTransform?.relativeTo) return null;

  return `/drawings/${discipline.imageTransform.relativeTo}`;
}
