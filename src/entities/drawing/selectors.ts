import type { Metadata } from '../../shared/types/metadata';

export function getSiteList(metadata: Metadata) {
  return Object.values(metadata.drawings)
    .filter((d) => d.parent === null)
    .map((d) => d.name);
}
