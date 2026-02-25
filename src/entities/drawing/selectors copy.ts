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
  activeRegion,
  activeRevision,
}: GetImageSrcParams): string {
  // basic drawing image as default
  if (!activeDiscipline) {
    return `/drawings/${drawing.image}`;
  }

  const discipline = drawing.disciplines?.[activeDiscipline];

  // fallback if discipline is invalid
  if (!discipline) {
    return `/drawings/${drawing.image}`;
  }

  // region-based discipline (e.g. structural drawings)
  if (discipline.regions && activeRegion) {
    const region = discipline.regions[activeRegion];

    // fallback if region is invalid
    if (!region) {
      return `/drawings/${drawing.image}`;
    }

    const regionRevisions = region.revisions ?? [];

    // if region revision is selected, use it
    if (activeRevision) {
      const selected = regionRevisions.find((r) => r.version === activeRevision);
      if (selected) {
        return `/drawings/${selected.image}`;
      }
    }

    // if no revision selected, fallback to last revision
    // NOTE: rendering fallback only, not domain-level "latest"
    if (regionRevisions.length > 0) {
      return `/drawings/${regionRevisions[regionRevisions.length - 1].image}`;
    }

    // if region has no revisions, fallback to discipline image
    if (discipline.image) {
      return `/drawings/${discipline.image}`;
    }
  }

  const revisions = discipline.revisions ?? [];

  // if revision is selected, use it
  if (activeRevision) {
    const selected = revisions.find((r) => r.version === activeRevision);
    if (selected) {
      return `/drawings/${selected.image}`;
    }
  }

  // if no revision selected, fallback to last revision
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

// NOTE: overlay always uses architectural reference image
export function getOverlayImageSrc({
  drawing,
  activeDiscipline,
  activeRegion,
  activeRevision,
}: GetImageSrcParams): string | null {
  const disciplines = drawing.disciplines;
  if (!disciplines || !activeDiscipline) return null;

  const discipline = disciplines[activeDiscipline];
  if (!discipline) return null;

  // region-based overlay (e.g. structural drawings)
  if (discipline.regions && activeRegion) {
    const region = discipline.regions[activeRegion];
    if (!region) return null;

    const revisions = region.revisions ?? [];

    // prefer selected region revision reference
    if (activeRevision) {
      const selected = revisions.find((r) => r.version === activeRevision);
      if (selected?.imageTransform?.relativeTo) {
        return `/drawings/${selected.imageTransform.relativeTo}`;
      }
    }

    // fallback to last region revision reference
    const latest = revisions[revisions.length - 1];
    if (latest?.imageTransform?.relativeTo) {
      return `/drawings/${latest.imageTransform.relativeTo}`;
    }
  }

  // discipline-level architectural reference
  if (discipline.imageTransform?.relativeTo) {
    return `/drawings/${discipline.imageTransform.relativeTo}`;
  }

  return null;
}

// Overlay reference image + transform for aligning the active drawing image.
// NOTE: overlay is the reference image pointed by relativeTo.
// imageTransform is used to draw the active image aligned onto that reference.
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

  // Region revision case (e.g. structural regions)
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

    // Fallback to last revision
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

  // Discipline-level reference
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

// NOTE: metadata date is treated as the only reliable "latest" signal
const parseDate = (date: string) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

// NOTE: used for context display, not for rendering fallback
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
    return { kind: 'empty', message: '도면을 선택해주세요.' };
  }

  const drawing = metadata.drawings[activeDrawingId];
  if (!drawing) {
    return { kind: 'empty', message: '도면 정보를 찾을 수 없습니다.' };
  }

  if (!activeDiscipline) {
    return {
      kind: 'ok',
      drawingName: drawing.name,
      disciplineName: null,
      regionName: null,
      selectedRevision: null,
      latestRevision: null,
      message: '공종을 선택하면 리비전 정보를 확인할 수 있습니다.',
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
      message: '해당 공종 데이터가 없습니다.',
    };
  }

  // region-based discipline (structural drawings)
  if (discipline.regions) {
    if (!activeRegion) {
      return {
        kind: 'ok',
        drawingName: drawing.name,
        disciplineName: activeDiscipline,
        regionName: null,
        selectedRevision: null,
        latestRevision: null,
        message: 'Region이 있는 공종입니다. Region을 선택해주세요.',
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

  // non-region discipline
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
