import type { Drawing } from '../../../shared/types/metadata';
import type { ViewerContext } from '../../../shared/types/context';

type Props = {
  drawing: Drawing;
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const DrawingControls = ({ drawing, context, setContext }: Props) => {
  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];

  const disciplineData = context.activeDiscipline
    ? drawing.disciplines?.[context.activeDiscipline]
    : null;

  const regions = disciplineData?.regions ?? null;
  const regionKeys = regions ? Object.keys(regions) : [];

  const revisions =
    context.activeRegion && disciplineData?.regions
      ? (disciplineData.regions[context.activeRegion]?.revisions ?? [])
      : (disciplineData?.revisions ?? []);

  const toggleOverlay = () => {
    setContext((prev) => ({
      ...prev,
      overlay: {
        ...prev.overlay,
        enabled: !prev.overlay?.enabled,
      },
    }));
  };

  const onChangeDiscipline = (value: string) => {
    const next = value === '__none__' ? null : value;
    setContext((prev) => ({
      ...prev,
      activeDiscipline: next,
      activeRegion: null,
      activeRevision: null,
    }));
  };

  const onChangeRegion = (value: string) => {
    const next = value === '__none__' ? null : value;
    setContext((prev) => ({
      ...prev,
      activeRegion: next,
      activeRevision: null,
    }));
  };

  const onChangeRevision = (value: string) => {
    const next = value === '__none__' ? null : value;
    setContext((prev) => ({
      ...prev,
      activeRevision: next,
    }));
  };

  const sortedRevisions = [...revisions].sort((a, b) => {
    // REV2 > REV1 같은 케이스 대응
    const getNum = (v: string) => {
      const m = v.match(/\d+/);
      return m ? Number(m[0]) : 0;
    };
    return getNum(b.version) - getNum(a.version);
  });

  const overlayEnabled = Boolean(context.overlay?.enabled);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '8px 0',
      }}
    >
      {/* overlay toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={overlayEnabled} onChange={toggleOverlay} />
        Show architectural reference
      </label>

      {/* selects row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Discipline */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.8, fontSize: 12 }}>공종</span>
          <select
            value={context.activeDiscipline ?? '__none__'}
            onChange={(e) => onChangeDiscipline(e.target.value)}
            style={{ height: 32 }}
          >
            <option value="__none__">전체</option>
            {disciplines.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        {/* Region (only when available) */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.8, fontSize: 12 }}>구역</span>
          <select
            value={context.activeRegion ?? '__none__'}
            onChange={(e) => onChangeRegion(e.target.value)}
            disabled={regionKeys.length === 0}
            style={{ height: 32, opacity: regionKeys.length === 0 ? 0.5 : 1 }}
          >
            {regionKeys.length === 0 ? (
              <option value="__none__">해당 없음</option>
            ) : (
              <>
                <option value="__none__">전체</option>
                {regionKeys.map((rk) => (
                  <option key={rk} value={rk}>
                    {rk}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        {/* Revision (only when available) */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.8, fontSize: 12 }}>리비전</span>
          <select
            value={context.activeRevision ?? '__none__'}
            onChange={(e) => onChangeRevision(e.target.value)}
            disabled={sortedRevisions.length === 0}
            style={{ height: 32, opacity: sortedRevisions.length === 0 ? 0.5 : 1 }}
          >
            {revisions.length === 0 ? (
              <option value="__none__">선택 불가</option>
            ) : (
              <>
                {sortedRevisions.map((rv, index) => (
                  <option key={rv.version} value={rv.version}>
                    {rv.version}
                    {index === 0 ? ' (최신)' : ''}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
      </div>
    </div>
  );
};
