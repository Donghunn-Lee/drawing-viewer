import type { ViewerContext } from '../../../../shared/types/context';
import { ControlSelectCell } from '../cells/ControlSelectCell';
import { ControlCheckboxCell } from '../cells/ControlcheckboxCell';
import type { SelectOption, ViewerDerivedState } from '../hooks/useViewerDerivedState';

type Props = {
  state: ViewerDerivedState;
  siteOptions: SelectOption[];
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};
export const ViewerSelectSection = ({ state, siteOptions, setContext }: Props) => {
  const { normalized, options, availability, activeRevisionData } = state;

  const revisionSelectValue = normalized.revision ?? activeRevisionData?.version ?? null;

  return (
    <>
      <ControlSelectCell
        label="도면"
        value={normalized.site}
        options={siteOptions}
        onChange={(v) =>
          setContext((p: ViewerContext) => ({
            ...p,
            activeDrawingId: v,
            activeDiscipline: null,
            activeRegion: null,
            activeRevision: null,
            overlay: { ...p.overlay, enabled: false },
          }))
        }
      />

      <ControlSelectCell
        label="공종"
        value={normalized.discipline}
        options={options.discipline}
        disabled={options.discipline.length < 1}
        onChange={(v) =>
          setContext((p: ViewerContext) => ({
            ...p,
            activeDiscipline: v,
            activeRegion: null,
            activeRevision: null,
            overlay: { ...p.overlay, enabled: false },
          }))
        }
      />

      <ControlSelectCell
        label="구역"
        value={normalized.region}
        options={options.region}
        disabled={!availability.region}
        onChange={(v) =>
          setContext((p: ViewerContext) => ({
            ...p,
            activeRegion: v,
            activeRevision: null,
            overlay: { ...p.overlay, enabled: false },
          }))
        }
      />

      <ControlSelectCell
        label="리비전"
        value={revisionSelectValue}
        options={options.revision}
        disabled={!availability.revision}
        onChange={(v) =>
          setContext((p: ViewerContext) => ({
            ...p,
            activeRevision: v,
            overlay: { ...p.overlay, enabled: false },
          }))
        }
      />

      <ControlCheckboxCell
        label="오버레이"
        checked={normalized.overlay.enabled}
        disabled={!availability.overlay}
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
