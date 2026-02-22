import { useEffect, useState } from 'react';
import type { ViewerContext } from '../../shared/types/context';
import type { Metadata } from '../../shared/types/metadata';
import metadataJson from '../../data/metadata.json';
import { getBaseImageSrc, getOverlayImage } from '../../entities/drawing/selectors';
import { CanvasStage } from '../../shared/ui/CanvasStage';
import { EntryMap } from '../EntryMap';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

type OverlayState = {
  enabled: boolean;
  opacity: number;
};

export const ViewerPane = ({ context, setContext }: Props) => {
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeRevision, setActiveRevision] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>({
    enabled: false,
    opacity: 0.5,
  });

  const activeDrawingId = context.activeDrawingId;
  const drawing = activeDrawingId ? metadata.drawings[activeDrawingId] : null;

  const selectDiscipline = (discipline: string) => {
    setActiveDiscipline(discipline);
    setActiveRegion(null);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeDiscipline: discipline,
      activeRevision: null,
    }));
  };

  const selectRegion = (region: string) => {
    setActiveRegion(region);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeRegion: region,
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
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeDiscipline: null,
      activeRevision: null,
    }));
  }, [activeDrawingId]);

  useEffect(() => {
    setActiveRevision(null);
  }, [activeDiscipline]);

  if (!context.activeDrawingId) {
    return <EntryMap setContext={setContext} />;
  }

  if (!drawing) {
    return <div style={{ flex: 1, background: '#f5f5f5' }} />;
  }

  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];
  const disciplineData = activeDiscipline ? drawing.disciplines?.[activeDiscipline] : null;

  const regions = disciplineData?.regions || null;
  const regionKeys = regions ? Object.keys(regions) : [];

  const revisions =
    activeRegion && disciplineData?.regions
      ? (disciplineData.regions[activeRegion]?.revisions ?? [])
      : (disciplineData?.revisions ?? []);

  const baseSrc = getBaseImageSrc({ drawing, activeDiscipline, activeRegion, activeRevision });
  const overlayInfo = overlay.enabled
    ? getOverlayImage({ drawing, activeDiscipline, activeRegion, activeRevision })
    : null;

  const stageBaseSrc = overlayInfo ? overlayInfo.src : baseSrc;
  const stageOverlays = overlayInfo
    ? [
        {
          src: baseSrc, // active drawing
          opacity: overlay.opacity,
          imageTransform: overlayInfo.imageTransform, // align active onto reference
        },
      ]
    : [];

  return (
    <div>
      <div>
        <label>
          <input type="checkbox" checked={overlay.enabled} onChange={toggleOverlay} />
          Show architectural reference
        </label>
      </div>

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
            {regionKeys.map((regionKey) => (
              <button
                key={regionKey}
                onClick={() => selectRegion(regionKey)}
                style={{
                  background: regionKey === activeRegion ? '#444' : 'transparent',
                  color: regionKey === activeRegion ? '#fff' : '#000',
                  fontSize: 12,
                }}
              >
                {regionKey}
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

      <div style={{ position: 'relative' }}>
        <CanvasStage
          width={900} // 임시: 부모 width를 재서 넣는 건 다음 단계
          height={600}
          baseSrc={stageBaseSrc}
          overlays={stageOverlays}
          polygons={[]}
        />
      </div>
    </div>
  );
};
