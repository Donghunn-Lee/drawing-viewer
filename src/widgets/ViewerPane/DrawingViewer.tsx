import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Drawing } from '../../shared/types/metadata';
import type { ViewerContext } from '../../shared/types/context';
import { getBaseImageSrc, getOverlayImage } from '../../entities/drawing/selectors';
import { CanvasStage } from '../../shared/ui/CanvasStage';

type Props = {
  drawing: Drawing;
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

type OverlayState = {
  enabled: boolean;
  opacity: number;
};

export const DrawingViewer = ({ drawing, setContext }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeRevision, setActiveRevision] = useState<string | null>(null);

  const [overlay, setOverlay] = useState<OverlayState>({
    enabled: false,
    opacity: 0.5,
  });

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const selectDiscipline = (discipline: string) => {
    setActiveDiscipline(discipline);
    setActiveRegion(null);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeDiscipline: discipline,
      activeRegion: null,
      activeRevision: null,
    }));
  };

  const selectRegion = (region: string) => {
    setActiveRegion(region);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeRegion: region,
      activeRevision: null,
    }));
  };

  const selectRevision = (revision: string) => {
    setActiveRevision(revision);

    setContext((prev) => ({
      ...prev,
      activeRevision: revision,
    }));
  };

  const toggleOverlay = () => {
    setOverlay((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  useEffect(() => {
    setActiveDiscipline(null);
    setActiveRegion(null);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeDiscipline: null,
      activeRegion: null,
      activeRevision: null,
    }));
  }, [drawing.id]);

  useEffect(() => {
    setActiveRegion(null);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeRegion: null,
      activeRevision: null,
    }));
  }, [activeDiscipline]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setContainerSize((prev) =>
        prev.width === Math.floor(width) && prev.height === Math.floor(height)
          ? prev
          : {
              width: Math.floor(width),
              height: Math.floor(height),
            },
      );
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];
  const disciplineData = activeDiscipline ? drawing.disciplines?.[activeDiscipline] : null;

  const regions = disciplineData?.regions ?? null;
  const regionKeys = regions ? Object.keys(regions) : [];

  const revisions =
    activeRegion && disciplineData?.regions
      ? (disciplineData.regions[activeRegion]?.revisions ?? [])
      : (disciplineData?.revisions ?? []);

  const baseSrc = getBaseImageSrc({
    drawing,
    activeDiscipline,
    activeRegion,
    activeRevision,
  });

  const overlayInfo = overlay.enabled
    ? getOverlayImage({
        drawing,
        activeDiscipline,
        activeRegion,
        activeRevision,
      })
    : null;

  const stageBaseSrc = overlayInfo ? overlayInfo.src : baseSrc;
  const stageOverlays = overlayInfo
    ? [
        {
          src: baseSrc,
          opacity: overlay.opacity,
          imageTransform: overlayInfo.imageTransform,
        },
      ]
    : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* overlay toggle */}
      <div style={{ padding: 8 }}>
        <label>
          <input type="checkbox" checked={overlay.enabled} onChange={toggleOverlay} />
          Show architectural reference
        </label>
      </div>

      {/* discipline / region / revision controls */}
      <div style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {disciplines.map((d) => (
            <button
              key={d}
              onClick={() => selectDiscipline(d)}
              style={{
                background: d === activeDiscipline ? '#444' : 'transparent',
                color: d === activeDiscipline ? '#fff' : '#000',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {regionKeys.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            {regionKeys.map((rk) => (
              <button
                key={rk}
                onClick={() => selectRegion(rk)}
                style={{
                  background: rk === activeRegion ? '#444' : 'transparent',
                  color: rk === activeRegion ? '#fff' : '#000',
                  fontSize: 12,
                }}
              >
                {rk}
              </button>
            ))}
          </div>
        )}

        {activeDiscipline && revisions.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            {revisions.map((rv) => (
              <button
                key={rv.version}
                onClick={() => selectRevision(rv.version)}
                style={{
                  background: rv.version === activeRevision ? '#444' : 'transparent',
                  color: rv.version === activeRevision ? '#fff' : '#000',
                  fontSize: 12,
                }}
              >
                {rv.version}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* canvas area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <CanvasStage
            width={containerSize.width}
            height={containerSize.height}
            baseSrc={stageBaseSrc}
            overlays={stageOverlays}
            polygons={[]}
          />
        )}
      </div>
    </div>
  );
};
