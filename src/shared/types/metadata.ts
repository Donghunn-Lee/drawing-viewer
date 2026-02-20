export type Drawing = {
  id: string;
  name: string;
  image: string;
  parent: string | null;
  position: unknown;
};

export type Metadata = {
  project: { name: string; unit: string };
  disciplines: { name: string }[];
  drawings: Record<string, Drawing>;
};
