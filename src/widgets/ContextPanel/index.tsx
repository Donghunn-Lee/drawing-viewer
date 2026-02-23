import type { ViewerContext } from '../../shared/types/context';
import metadataJson from '../../data/metadata.json';
import type { Metadata } from '../../shared/types/metadata';
import { resolveRevisionContext } from '../../entities/drawing/selectors';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.6 }}>
      <div style={{ width: 80, color: '#666' }}>{label}</div>
      <div>{value}</div>
    </div>
  );
};

export const ContextPanel = ({ context }: Props) => {
  const resolved = resolveRevisionContext(metadata, context);

  if (resolved.kind === 'empty') {
    return <div style={{ padding: 12 }}>{resolved.message}</div>;
  }

  const { drawingName, disciplineName, regionName, selectedRevision, latestRevision, message } =
    resolved;

  return (
    <div style={{ padding: 12 }}>
      <Row label="도면" value={drawingName} />
      <Row label="공종" value={disciplineName ?? '전체'} />
      {regionName && <Row label="Region" value={regionName} />}

      <hr style={{ margin: '12px 0', borderColor: '#eee' }} />

      {message && <div style={{ fontSize: 12, color: '#999' }}>{message}</div>}

      {selectedRevision && (
        <>
          <Row label="선택 리비전" value={selectedRevision.version} />
          <Row label="발행일" value={selectedRevision.date} />
          <Row label="설명" value={selectedRevision.description} />

          {selectedRevision.changes.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>변경 사항</div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {selectedRevision.changes.map((c) => (
                  <li key={c} style={{ fontSize: 12 }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {latestRevision && (
        <>
          <hr style={{ margin: '12px 0', borderColor: '#eee' }} />
          <Row label="Latest" value={`${latestRevision.version} (${latestRevision.date})`} />
        </>
      )}
    </div>
  );
};
