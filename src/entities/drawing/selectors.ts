import type { Drawing, Transform } from '../../shared/types/metadata';

type GetImageSrcParams = {
  drawing: Drawing;
  activeDiscipline: string | null;
  activeRegion: string | null;
  activeRevision: string | null;
};

export type OverlayImage = {
  src: string;
  imageTransform?: Transform;
};

/**
 * Picks the image to render for the current viewer context.
 * Note: This is rendering-driven selection (not a domain "latest" rule).
 */
export const getBaseImageSrc = ({
  drawing,
  activeDiscipline,
  activeRegion,
  activeRevision,
}: GetImageSrcParams): string => {
  if (!activeDiscipline) {
    return `/drawings/${drawing.image}`;
  }

  const discipline = drawing.disciplines?.[activeDiscipline];
  if (!discipline) {
    return `/drawings/${drawing.image}`;
  }

  if (discipline.regions && activeRegion) {
    const region = discipline.regions[activeRegion];
    if (!region) {
      return `/drawings/${drawing.image}`;
    }

    const revisions = region.revisions ?? [];

    if (activeRevision) {
      const selected = revisions.find((r) => r.version === activeRevision);
      if (selected) {
        return `/drawings/${selected.image}`;
      }
    }

    if (revisions.length > 0) {
      return `/drawings/${revisions[revisions.length - 1].image}`;
    }

    if (discipline.image) {
      return `/drawings/${discipline.image}`;
    }
  }

  const revisions = discipline.revisions ?? [];

  if (activeRevision) {
    const selected = revisions.find((r) => r.version === activeRevision);
    if (selected) {
      return `/drawings/${selected.image}`;
    }
  }

  if (revisions.length > 0) {
    return `/drawings/${revisions[revisions.length - 1].image}`;
  }

  if (discipline.image) {
    return `/drawings/${discipline.image}`;
  }

  return `/drawings/${drawing.image}`;
};

/**
 * Resolves the overlay reference image and transform (if available).
 * Uses `relativeTo` as the overlay base.
 */
export const getOverlayImage = ({
  drawing,
  activeDiscipline,
  activeRegion,
  activeRevision,
}: GetImageSrcParams): OverlayImage | null => {
  const disciplines = drawing.disciplines;
  if (!disciplines || !activeDiscipline) return null;

  const discipline = disciplines[activeDiscipline];
  if (!discipline) return null;

  if (discipline.regions && activeRegion) {
    const region = discipline.regions[activeRegion];
    if (!region) return null;

    const revisions = region.revisions ?? [];

    if (activeRevision) {
      const selected = revisions.find((r) => r.version === activeRevision);
      const relativeTo = selected?.imageTransform?.relativeTo;
      if (relativeTo) {
        return {
          src: `/drawings/${relativeTo}`,
          imageTransform: selected.imageTransform,
        };
      }
    }

    const latest = revisions[revisions.length - 1];
    const relativeTo = latest?.imageTransform?.relativeTo;
    if (relativeTo) {
      return {
        src: `/drawings/${relativeTo}`,
        imageTransform: latest.imageTransform,
      };
    }

    return null;
  }

  const relativeTo = discipline.imageTransform?.relativeTo;
  if (!relativeTo) return null;

  return {
    src: `/drawings/${relativeTo}`,
    imageTransform: discipline.imageTransform,
  };
};

/**
 * Whether overlay can be enabled for the current selection.
 */
export const canUseOverlay = ({
  drawing,
  activeDiscipline,
  activeRegion,
}: {
  drawing: Drawing | null;
  activeDiscipline: string | null;
  activeRegion: string | null;
}): boolean => {
  if (!drawing || !activeDiscipline) return false;

  const discipline = drawing.disciplines?.[activeDiscipline];
  if (!discipline) return false;

  if (drawing.id === '01' && activeRegion) {
    return false;
  }

  if (discipline.regions) {
    if (!activeRegion) return false;

    const region = discipline.regions[activeRegion];
    return Boolean(region?.revisions?.some((r) => r.imageTransform?.relativeTo));
  }

  return Boolean(discipline.imageTransform?.relativeTo);
};
