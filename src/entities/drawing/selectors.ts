import type { Metadata } from '../../shared/types/metadata';

export function getSiteList(metadata: Metadata): string[] {
  return Object.keys(metadata.drawings);
}
