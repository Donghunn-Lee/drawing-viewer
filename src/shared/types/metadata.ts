export type Metadata = {
  project: { name: string; unit: string };
  disciplines: { name: string }[];
  drawings: Record<string, unknown>;
};
