import type { Drawing, Metadata } from '../../shared/types/metadata';

export const getSiteList = (metadata: Metadata) => {
  const root = Object.values(metadata.drawings).find((d) => d.parent === null);
  if (!root) return [];

  return Object.values(metadata.drawings)
    .filter((d) => d.parent === root.id)
    .map((d) => ({ id: d.id, name: d.name }));
};

export const getDisciplinesBySite = (metadata: Metadata, siteName: string): string[] => {
  const site = Object.values(metadata.drawings).find(
    (d: Drawing) => d.parent === null && d.name === siteName,
  );

  if (!site || !('disciplines' in site)) return [];
  return Object.keys((site as any).disciplines);
};
