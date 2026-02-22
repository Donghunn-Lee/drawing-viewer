import { useEffect, useState } from 'react';
import type { ViewerContext } from '../../shared/types/context';
import type { Metadata } from '../../shared/types/metadata';
import metadataJson from '../../data/metadata.json';
import { getBaseImageSrc, getOverlayImageSrc } from '../../entities/drawing/selectors';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ViewerPane = ({ context, setContext }: Props) => {
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeRevision, setActiveRevision] = useState<string | null>(null);
  const [overlayDiscipline, setOverlayDiscipline] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const activeDrawingId = context.activeDrawingId;
  const drawing = activeDrawingId ? metadata.drawings[activeDrawingId] : null;

  const onSelectDiscipline = (discipline: string) => {
    setActiveDiscipline(discipline);
    setActiveRevision(null);

    setContext((prev) => ({
      ...prev,
      activeDiscipline: discipline,
      activeRevision: null,
    }));
  };

  const onSelectRevision = (revision: string) => {
    setActiveRevision(revision);

    setContext((prev) => ({
      ...prev,
      activeRevision: revision,
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

  if (!drawing) {
    return <div style={{ flex: 1, background: '#f5f5f5' }} />;
  }

  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];
  const disciplineData = activeDiscipline ? drawing.disciplines?.[activeDiscipline] : null;
  const revisions = disciplineData?.revisions ?? [];

  const baseSrc = getBaseImageSrc({ drawing, activeDiscipline, activeRevision });
  const overlaySrc = getOverlayImageSrc(drawing, overlayDiscipline);

  return (
    <div>
      <button onClick={() => setOverlayDiscipline('소방')}>소방 겹쳐보기</button>

      <div style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {disciplines.map((d) => (
            <button
              key={d}
              onClick={() => onSelectDiscipline(d)}
              style={{
                background: d === activeDiscipline ? '#444' : 'transparent',
                color: d === activeDiscipline ? '#fff' : '#000',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {activeDiscipline && revisions.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            {revisions.map((r) => (
              <button
                key={r.version}
                onClick={() => onSelectRevision(r.version)}
                style={{
                  background: r.version === activeRevision ? '#444' : 'transparent',
                  color: r.version === activeRevision ? '#fff' : '#000',
                  fontSize: 12,
                }}
              >
                {r.version}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <img src={baseSrc} style={{ width: '100%' }} />

        {overlaySrc && (
          <img
            src={overlaySrc}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: overlayOpacity,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
