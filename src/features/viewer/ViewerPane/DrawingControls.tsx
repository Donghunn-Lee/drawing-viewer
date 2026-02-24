import type { Drawing } from '../../../shared/types/metadata';
import type { ViewerContext } from '../../../shared/types/context';
import { useEffect } from 'react';

type Props = {
  drawing: Drawing;
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const DrawingControls = ({ drawing, context, setContext }: Props) => {
  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      activeDiscipline: null,
      activeRegion: null,
      activeRevision: null,
      overlay: {
        ...prev.overlay,
        enabled: false,
      },
    }));
  }, [drawing.id, setContext]);

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

  useEffect(() => {
    if (!context.activeDiscipline) {
      if (context.activeRegion === null && context.activeRevision === null) return;
    }

    setContext((prev) => ({
      ...prev,
      activeRegion: null,
      activeRevision: null,
    }));
  }, [context.activeDiscipline]);

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
