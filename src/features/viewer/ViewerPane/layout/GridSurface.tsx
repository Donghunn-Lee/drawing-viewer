import { Children } from 'react';

type Props = {
  rows: number;
  children: React.ReactNode;
};

export const GridSurface = ({ rows, children }: Props) => {
  const items = Children.toArray(children);

  const filled = [...items];
  while (filled.length < rows) {
    filled.push(<div key={`placeholder-${filled.length}`} />);
  }

  return <>{filled}</>;
};
