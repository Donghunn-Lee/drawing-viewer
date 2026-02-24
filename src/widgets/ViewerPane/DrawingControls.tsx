import type { Drawing } from '../../shared/types/metadata';
import type { ViewerContext } from '../../shared/types/context';
import { useEffect } from 'react';

type Props = {
  drawing: Drawing;
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const DrawingControls = ({ drawing, context, setContext }: Props) => {
  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];

  // 1) drawing 변경 시: 선택 상태 초기화 (이전 DrawingViewer의 [drawing.id] 효과 복구)
  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      activeDiscipline: null,
      activeRegion: null,
      activeRevision: null,
      overlay: {
        ...prev.overlay,
        enabled: false, // drawing 전환 시 overlay off (기존 동작 유지)
      },
    }));
  }, [drawing.id, setContext]);

  // 현재 선택 discipline이 drawing에 존재하지 않으면 null로 정리
  useEffect(() => {
    if (!context.activeDiscipline) return;
    if (drawing.disciplines?.[context.activeDiscipline]) return;

    setContext((prev) => ({
      ...prev,
      activeDiscipline: null,
      activeRegion: null,
      activeRevision: null,
    }));
  }, [context.activeDiscipline, drawing, setContext]);

  const disciplineData = context.activeDiscipline
    ? drawing.disciplines?.[context.activeDiscipline]
    : null;

  const regions = disciplineData?.regions ?? null;
  const regionKeys = regions ? Object.keys(regions) : [];

  // 2) discipline 변경 시: region/revision 초기화 (이전 DrawingViewer의 [activeDiscipline] 효과 복구)
  useEffect(() => {
    // discipline이 null이면 이미 초기 상태
    if (!context.activeDiscipline) {
      if (context.activeRegion === null && context.activeRevision === null) return;
    }

    setContext((prev) => ({
      ...prev,
      activeRegion: null,
      activeRevision: null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.activeDiscipline]);

  // region 유효성 보정
  useEffect(() => {
    if (!context.activeRegion) return;
    if (!disciplineData?.regions?.[context.activeRegion]) {
      setContext((prev) => ({
        ...prev,
        activeRegion: null,
        activeRevision: null,
      }));
    }
  }, [context.activeRegion, disciplineData, setContext]);

  const revisions =
    context.activeRegion && disciplineData?.regions
      ? (disciplineData.regions[context.activeRegion]?.revisions ?? [])
      : (disciplineData?.revisions ?? []);

  // revision 유효성 보정
  useEffect(() => {
    if (!context.activeRevision) return;
    const exists = revisions.some((rv) => rv.version === context.activeRevision);
    if (exists) return;

    setContext((prev) => ({
      ...prev,
      activeRevision: null,
    }));
  }, [context.activeRevision, revisions, setContext]);

  const toggleOverlay = () => {
    setContext((prev) => ({
      ...prev,
      overlay: {
        ...prev.overlay,
        enabled: !prev.overlay.enabled,
      },
    }));
  };

  return (
    <div style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
      {/* overlay toggle */}
      <div style={{ marginBottom: 8 }}>
        <label>
          <input type="checkbox" checked={context.overlay.enabled} onChange={toggleOverlay} />
          Show architectural reference
        </label>
      </div>

      {/* discipline */}
      <div style={{ display: 'flex', gap: 8 }}>
        {disciplines.map((d) => (
          <button
            key={d}
            onClick={() =>
              setContext((prev) => ({
                ...prev,
                activeDiscipline: d,
                activeRegion: null,
                activeRevision: null,
              }))
            }
          >
            {d}
          </button>
        ))}
      </div>

      {/* region */}
      {regionKeys.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          {regionKeys.map((rk) => (
            <button
              key={rk}
              onClick={() =>
                setContext((prev) => ({
                  ...prev,
                  activeRegion: rk,
                  activeRevision: null,
                }))
              }
            >
              {rk}
            </button>
          ))}
        </div>
      )}

      {/* revision */}
      {revisions.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          {revisions.map((rv) => (
            <button
              key={rv.version}
              onClick={() =>
                setContext((prev) => ({
                  ...prev,
                  activeRevision: rv.version,
                }))
              }
            >
              {rv.version}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
