import { useEffect, useState } from 'react';
import type { ViewerContext } from '../../shared/types/context';
import type { Metadata } from '../../shared/types/metadata';
import metadataJson from '../../data/metadata.json';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
};

export const ViewerPane = ({ context }: Props) => {
  const [activeDiscipline, setActiveDiscipline] = useState<string | null>(null);
  const [activeRevision, setActiveRevision] = useState<string | null>(null);

  const activeDrawingId = context.activeDrawingId;
  const drawing = activeDrawingId ? metadata.drawings[activeDrawingId] : null;

  useEffect(() => {
    setActiveDiscipline(null);
    setActiveRevision(null);
  }, [context.activeDrawingId]);

  useEffect(() => {
    setActiveRevision(null);
  }, [activeDiscipline]);

  if (!drawing) {
    return <div style={{ flex: 1, background: '#f5f5f5' }} />;
  }

  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];
  const disciplineData = activeDiscipline ? drawing.disciplines?.[activeDiscipline] : null;

  const revisions = disciplineData?.revisions ?? [];

  let imageSrc = `/drawings/${drawing.image}`;

  if (activeDiscipline && disciplineData) {
    if (activeRevision) {
      const selected = revisions.find((r) => r.version === activeRevision);
      if (selected) imageSrc = `/drawings/${selected.image}`;
    } else if (revisions.length > 0) {
      imageSrc = `/drawings/${revisions[revisions.length - 1].image}`;
    } else if (disciplineData.image) {
      imageSrc = `/drawings/${disciplineData.image}`;
    }
  }

  return (
    <>
      <div style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {disciplines.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDiscipline(d)}
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
                onClick={() => setActiveRevision(r.version)}
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

      <div style={{ flex: 1, background: '#f5f5f5' }}>
        <img src={imageSrc} style={{ width: '100%' }} />
      </div>
    </>
  );
};
