import type { ViewerContext } from '../../shared/types/context';

type Props = {
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export default function ExplorerSidebar({ setContext }: Props) {
  return (
    <div style={{ width: 200, borderRight: '1px solid #ddd' }}>
      <button
        onClick={() =>
          setContext({
            site: '101동',
            discipline: '건축',
            revision: 'REV1',
          })
        }
      >
        101동 건축
      </button>

      <button
        onClick={() =>
          setContext({
            site: '101동',
            discipline: '설비',
            revision: 'REV1',
          })
        }
      >
        101동 설비
      </button>

      <button
        onClick={() =>
          setContext({
            site: '주차장',
            discipline: '소방',
            revision: 'REV1',
          })
        }
      >
        주차장 소방
      </button>
    </div>
  );
}
