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

  const activeDrawingId = context.activeDrawingId;
  const drawing = activeDrawingId ? metadata.drawings[activeDrawingId] : null;

  useEffect(() => {
    setActiveDiscipline(null);
  }, [context.activeDrawingId]);

  if (!drawing) {
    return <div style={{ flex: 1, background: '#f5f5f5' }} />;
  }

  const disciplines = drawing.disciplines ? Object.keys(drawing.disciplines) : [];
  const disciplineData = activeDiscipline ? drawing.disciplines?.[activeDiscipline] : null;

  let imageSrc = `/drawings/${drawing.image}`;

  if (activeDiscipline && disciplineData) {
    const revisionImage =
      disciplineData.revisions && disciplineData.revisions.length > 0
        ? disciplineData.revisions[disciplineData.revisions.length - 1].image
        : null;

    imageSrc = disciplineData.image
      ? `/drawings/${disciplineData.image}`
      : revisionImage
        ? `/drawings/${revisionImage}`
        : imageSrc;
  }

  return (
    <>
      <div style={{ padding: 8, borderBottom: '1px solid #ddd', display: 'flex', gap: 8 }}>
        {disciplines.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDiscipline(d)}
            style={{
              background: d === activeDiscipline ? '#444444' : 'transparent',
              color: d === activeDiscipline ? '#fff' : '#000',
            }}
          >
            {d}
          </button>
        ))}
        {disciplines.length === 0 && <div>선택 가능한 공종 없음</div>}
      </div>

      <div style={{ flex: 1, background: '#f5f5f5' }}>
        <img src={imageSrc} style={{ width: '100%' }} />
      </div>
    </>
  );
};
