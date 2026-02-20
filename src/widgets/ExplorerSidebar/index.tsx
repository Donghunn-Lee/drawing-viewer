import type { ViewerContext } from '../../shared/types/context';

type Props = {
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export default function ExplorerSidebar({ setContext }: Props) {
  const selectDrawing = (site: ViewerContext['site'], discipline: ViewerContext['discipline']) => {
    setContext({
      site,
      discipline,
      revision: 'REV1',
    });
  };

  return (
    <div style={{ width: 200, borderRight: '1px solid #ddd' }}>
      <button onClick={() => selectDrawing('101동', '건축')}>101동 건축</button>

      <button onClick={() => selectDrawing('101동', '설비')}>101동 설비</button>

      <button onClick={() => selectDrawing('주차장', '소방')}>주차장 소방</button>
    </div>
  );
}
