import { ControlSelectCell } from '../cells/ControlSelectCell';
import { ControlCheckboxCell } from '../cells/ControlcheckboxCell';

export const ViewerSelectSection = ({ state, setContext }: any) => {
  const { normalized, options, availability } = state;

  return (
    <>
      <ControlSelectCell
        label="공종"
        value={normalized.discipline}
        options={options.discipline}
        onChange={(v) =>
          setContext((p: any) => ({
            ...p,
            activeDiscipline: v,
            activeRegion: null,
            activeRevision: null,
          }))
        }
      />

      <ControlSelectCell
        label="구역"
        value={normalized.region}
        options={options.region}
        disabled={!availability.region}
        onChange={(v) =>
          setContext((p: any) => ({
            ...p,
            activeRegion: v,
            activeRevision: null,
          }))
        }
      />

      <ControlSelectCell
        label="리비전"
        value={normalized.revision}
        options={options.revision}
        disabled={!availability.revision}
        onChange={(v) => setContext((p: any) => ({ ...p, activeRevision: v }))}
      />

      <ControlCheckboxCell
        label="오버레이"
        checked={normalized.overlay.enabled}
        onChange={(v) =>
          setContext((p: any) => ({
            ...p,
            overlay: { ...p.overlay, enabled: v },
          }))
        }
      />
    </>
  );
};
