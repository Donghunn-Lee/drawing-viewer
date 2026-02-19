import type { ViewerContext } from '../../shared/types/context';

type Props = {
  context: ViewerContext;
};

export default function ContextPanel({ context }: Props) {
  return (
    <div style={{ width: 250, borderLeft: '1px solid #ddd', padding: 12 }}>
      <div>공간: {context.site}</div>
      <div>공종: {context.discipline}</div>
      <div>리비전: {context.revision}</div>
    </div>
  );
}
