import type { Drawing, Metadata } from '../../shared/types/metadata';

export const getSiteList = (metadata: Metadata): string[] => {
  const root = Object.values(metadata.drawings).find((d: Drawing) => d.parent === null);
  if (!root) return [];

  return Object.values(metadata.drawings)
    .filter((d: Drawing) => d.parent === root.id)
    .map((d: Drawing) => d.name);
};

export const getDisciplinesBySite = (metadata: Metadata, siteName: string): string[] => {
  const site = Object.values(metadata.drawings).find(
    (d: Drawing) => d.parent === null && d.name === siteName,
  );

  if (!site || !('disciplines' in site)) return [];
  return Object.keys((site as any).disciplines);
};
