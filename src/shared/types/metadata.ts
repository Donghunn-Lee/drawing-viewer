export type Transform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  relativeTo?: string; // discipline/revision의 imageTransform에만 존재
};

export type Polygon = {
  vertices: number[][];
  polygonTransform?: Transform;
};

export type Revision = {
  version: string;
  image: string;
  date: string;
  description: string;
  changes: string[];
  imageTransform?: Transform;
  polygon?: Polygon;
};

export type Region = {
  polygon?: Polygon;
  revisions: Revision[];
};

export type Discipline = {
  image?: string;
  imageTransform?: Transform;
  polygon?: Polygon;
  regions?: Record<string, Region>;
  revisions?: Revision[];
};

export type Position = {
  vertices: number[][];
  imageTransform: Omit<Transform, 'relativeTo'>;
};

export type Drawing = {
  id: string;
  name: string;
  image: string;
  parent: string | null;
  position: Position | null;
  disciplines?: Record<string, Discipline>; // ✅ 핵심: discipline? 말고 disciplines
};

export type Metadata = {
  project: { name: string; unit: string };
  disciplines: { name: string }[];
  drawings: Record<string, Drawing>;
};
