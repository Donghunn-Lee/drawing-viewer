import type {
  Drawing,
  Metadata,
  Transform,
  Discipline,
  Revision,
} from '../../shared/types/metadata';
import type { ViewerContext } from '../../shared/types/context';

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

// -----------------------------------------------------------------------------
// Base image selection
// -----------------------------------------------------------------------------

// Resolves the base drawing image to render based on the current viewer context.
// This logic is rendering-oriented and may differ from domain-level "latest" rules.
export const getBaseImageSrc = ({
  drawing,
  activeDiscipline,
  activeRegion,
  activeRevision,
}: GetImageSrcParams): string => {
  // No discipline selected: fall back to the drawing image
  if (!activeDiscipline) {
    return `/drawings/${drawing.image}`;
  }

  const discipline = drawing.disciplines?.[activeDiscipline];
  if (!discipline) {
    return `/drawings/${drawing.image}`;
  }

  // Region-based discipline (e.g. structural drawings)
  if (discipline.regions && activeRegion) {
    const region = discipline.regions[activeRegion];
    if (!region) {
      return `/drawings/${drawing.image}`;
    }

    const revisions = region.revisions ?? [];

    // Prefer explicitly selected revision
    if (activeRevision) {
      const selected = revisions.find((r) => r.version === activeRevision);
      if (selected) {
        return `/drawings/${selected.image}`;
      }
    }

    // Fallback to the last revision for rendering purposes
    if (revisions.length > 0) {
      return `/drawings/${revisions[revisions.length - 1].image}`;
    }

    // If the region has no revisions, fall back to the discipline image
    if (discipline.image) {
      return `/drawings/${discipline.image}`;
    }
  }

  const revisions = discipline.revisions ?? [];

  // Prefer explicitly selected revision
  if (activeRevision) {
    const selected = revisions.find((r) => r.version === activeRevision);
    if (selected) {
      return `/drawings/${selected.image}`;
    }
  }

  // Fallback to the last revision
  if (revisions.length > 0) {
    return `/drawings/${revisions[revisions.length - 1].image}`;
  }

  // No revisions: use discipline image if available
  if (discipline.image) {
    return `/drawings/${discipline.image}`;
  }

  // Final fallback: drawing image
  return `/drawings/${drawing.image}`;
};

// -----------------------------------------------------------------------------
// Overlay image resolution
// -----------------------------------------------------------------------------

// Resolves the reference image used as an overlay and its transform.
// The overlay represents the image referenced by `relativeTo`, and the transform
// is applied when aligning the active drawing image to that reference.
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

  // Region-based discipline
  if (discipline.regions && activeRegion) {
    const region = discipline.regions[activeRegion];
    if (!region) return null;

    const revisions = region.revisions ?? [];

    // Prefer selected revision
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

    // Fallback to the last revision
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

  // Discipline-level reference image
  const relativeTo = discipline.imageTransform?.relativeTo;
  if (!relativeTo) return null;

  return {
    src: `/drawings/${relativeTo}`,
    imageTransform: discipline.imageTransform,
  };
};

// -----------------------------------------------------------------------------
// ContextPanel support selectors
// -----------------------------------------------------------------------------

type ResolvedRevisionContext =
  | { kind: 'empty'; message: string }
  | {
      kind: 'ok';
      drawingName: string;
      disciplineName: string | null;
      regionName: string | null;
      selectedRevision: Revision | null;
      latestRevision: Revision | null;
      message?: string;
    };

// Parses a revision date string into a comparable timestamp.
// Invalid dates are treated as missing.
const parseDate = (date: string) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

// Determines the latest revision by date.
// Used for context display, not for rendering fallback.
const getLatestByDate = (revisions: Revision[]): Revision | null => {
  if (revisions.length === 0) return null;

  return [...revisions].sort((a, b) => {
    return (parseDate(b.date) ?? -Infinity) - (parseDate(a.date) ?? -Infinity);
  })[0];
};

export const resolveRevisionContext = (
  metadata: Metadata,
  context: ViewerContext,
): ResolvedRevisionContext => {
  const { activeDrawingId, activeDiscipline, activeRegion, activeRevision } = context;

  if (!activeDrawingId) {
    return { kind: 'empty', message: 'Please select a drawing.' };
  }

  const drawing = metadata.drawings[activeDrawingId];
  if (!drawing) {
    return { kind: 'empty', message: 'Drawing data not found.' };
  }

  if (!activeDiscipline) {
    return {
      kind: 'ok',
      drawingName: drawing.name,
      disciplineName: null,
      regionName: null,
      selectedRevision: null,
      latestRevision: null,
      message: 'Select a discipline to view revision information.',
    };
  }

  const discipline: Discipline | undefined = drawing.disciplines?.[activeDiscipline];
  if (!discipline) {
    return {
      kind: 'ok',
      drawingName: drawing.name,
      disciplineName: activeDiscipline,
      regionName: null,
      selectedRevision: null,
      latestRevision: null,
      message: 'No data available for the selected discipline.',
    };
  }

  // Region-based discipline
  if (discipline.regions) {
    if (!activeRegion) {
      return {
        kind: 'ok',
        drawingName: drawing.name,
        disciplineName: activeDiscipline,
        regionName: null,
        selectedRevision: null,
        latestRevision: null,
        message: 'This discipline requires a region selection.',
      };
    }

    const region = discipline.regions[activeRegion];
    const revisions = region?.revisions ?? [];

    const latest = getLatestByDate(revisions);
    const selected =
      !activeRevision || activeRevision === 'Latest'
        ? latest
        : (revisions.find((r) => r.version === activeRevision) ?? latest);

    return {
      kind: 'ok',
      drawingName: drawing.name,
      disciplineName: activeDiscipline,
      regionName: activeRegion,
      selectedRevision: selected,
      latestRevision: latest,
    };
  }

  // Non-region discipline
  const revisions = discipline.revisions ?? [];
  const latest = getLatestByDate(revisions);
  const selected =
    !activeRevision || activeRevision === 'Latest'
      ? latest
      : (revisions.find((r) => r.version === activeRevision) ?? latest);

  return {
    kind: 'ok',
    drawingName: drawing.name,
    disciplineName: activeDiscipline,
    regionName: null,
    selectedRevision: selected,
    latestRevision: latest,
  };
};
