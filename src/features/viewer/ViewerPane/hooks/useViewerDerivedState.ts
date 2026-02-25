import { useMemo } from 'react';
import type { ViewerContext } from '../../../../shared/types/context';
import type { Drawing } from '../../../../shared/types/metadata';

type Params = {
  context: ViewerContext;
  drawing: Drawing | null;
};

export type SelectOption = { value: string; label: string };

export type ViewerDerivedState = ReturnType<typeof useViewerDerivedState>;

export const useViewerDerivedState = ({ context, drawing }: Params) => {
  const normalized = {
    site: context.activeDrawingId ?? null,
    discipline: context.activeDiscipline ?? null,
    region: context.activeRegion ?? null,
    revision: context.activeRevision ?? null,
    overlay: context.overlay ?? { enabled: false, opacity: 0.5 },
  };

  const disciplineOptions: SelectOption[] = useMemo(() => {
    if (!drawing?.disciplines) return [];
    return Object.keys(drawing.disciplines).map((d) => ({ value: d, label: d }));
  }, [drawing]);

  const activeDisciplineData = useMemo(() => {
    if (!drawing?.disciplines || !normalized.discipline) return null;
    return drawing.disciplines[normalized.discipline] ?? null;
  }, [drawing, normalized.discipline]);

  const regionOptions: SelectOption[] = useMemo(() => {
    const regions = activeDisciplineData?.regions;
    if (!regions) return [];
    return Object.keys(regions).map((r) => ({ value: r, label: r }));
  }, [activeDisciplineData]);

  const revisionOptions: SelectOption[] = useMemo(() => {
    if (!activeDisciplineData) return [];

    const revisions =
      activeDisciplineData.regions && normalized.region
        ? (activeDisciplineData.regions[normalized.region]?.revisions ?? [])
        : (activeDisciplineData.revisions ?? []);

    const getNum = (v: string) => Number(v.match(/\d+/)?.[0] ?? 0);

    return [...revisions]
      .sort((a, b) => getNum(b.version) - getNum(a.version))
      .map((r, i) => ({
        value: r.version,
        label: `${r.version}${i === 0 ? ' (최신)' : ''}`,
      }));
  }, [activeDisciplineData, normalized.region]);

  const activeRevisionData = useMemo(() => {
    if (!activeDisciplineData) return null;

    const revisions =
      activeDisciplineData.regions && normalized.region
        ? (activeDisciplineData.regions[normalized.region]?.revisions ?? [])
        : (activeDisciplineData.revisions ?? []);

    if (revisions.length === 0) return null;

    if (!normalized.revision) {
      return [...revisions].sort((a, b) => {
        const getNum = (v: string) => Number(v.match(/\d+/)?.[0] ?? 0);
        return getNum(b.version) - getNum(a.version);
      })[0];
    }

    return revisions.find((r) => r.version === normalized.revision) ?? null;
  }, [activeDisciplineData, normalized.region, normalized.revision]);

  return {
    normalized,
    options: {
      discipline: disciplineOptions,
      region: regionOptions,
      revision: revisionOptions,
    },
    availability: {
      region: Boolean(activeDisciplineData?.regions),
      revision:
        Boolean(activeDisciplineData) &&
        (!activeDisciplineData?.regions || Boolean(normalized.region)),
    },
    activeRevisionData,
  };
};
