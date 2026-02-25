export type ViewerLayout =
  | { mode: 'top'; open: boolean }
  | { mode: 'side'; side: 'left' | 'right'; open: boolean };
