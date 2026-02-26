import { getOverlayImage } from '../../../../entities/drawing/selectors';

import type { ViewerContext } from '../../../../shared/types/context';
import type { Drawing } from '../../../../shared/types/metadata';

import { ControlCheckboxCell } from '../cells/ControlcheckboxCell';
import { ControlSelectCell } from '../cells/ControlSelectCell';

import type { SelectOption, ViewerDerivedState } from '../hooks/useViewerDerivedState';

import styles from '../ViewerPane.module.css';

type Props = {
  state: ViewerDerivedState;
  siteOptions: SelectOption[];
  drawing: Drawing | null;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ViewerSelectSection = ({ state, siteOptions, drawing, setContext }: Props) => {
  const { normalized, options, availability, activeRevisionData } = state;

  const revisionSelectValue = normalized.revision ?? activeRevisionData?.version ?? null;

  const overlayInfo =
    drawing &&
    getOverlayImage({
      drawing,
      activeDiscipline: normalized.discipline,
      activeRegion: normalized.region,
      activeRevision: normalized.revision,
    });

  const overlayFileName = overlayInfo ? overlayInfo.src.replace('/drawings/', '') : undefined;

  const overlayOpacity = normalized.overlay.opacity ?? 0.5;
  const overlayOpacityPercent = Math.round(overlayOpacity * 100);

  const overlayControlsDisabled = !availability.overlay || !normalized.overlay.enabled;

  return (
    <>
      <ControlSelectCell
        label="도면"
        value={normalized.site}
        options={siteOptions}
        onChange={(v) =>
          setContext((p) => ({
            ...p,
            activeDrawingId: v,
            activeDiscipline: null,
            activeRegion: null,
            activeRevision: null,
            overlay: { ...p.overlay, enabled: false, opacity: 0.5 },
          }))
        }
      />

      <ControlSelectCell
        label="공종"
        value={normalized.discipline}
        options={options.discipline}
        disabled={options.discipline.length < 1}
        onChange={(v) =>
          setContext((p) => ({
            ...p,
            activeDiscipline: v,
            activeRegion: null,
            activeRevision: null,
            overlay: { ...p.overlay, enabled: false, opacity: 0.5 },
          }))
        }
      />

      <ControlSelectCell
        label="구역"
        value={normalized.region}
        options={options.region}
        disabled={!availability.region}
        onChange={(v) =>
          setContext((p) => ({
            ...p,
            activeRegion: v,
            activeRevision: null,
            overlay: { ...p.overlay, enabled: false, opacity: 0.5 },
          }))
        }
      />

      <ControlSelectCell
        label="리비전"
        value={revisionSelectValue}
        options={options.revision}
        disabled={!availability.revision}
        onChange={(v) =>
          setContext((p) => ({
            ...p,
            activeRevision: v,
            overlay: { ...p.overlay, enabled: false, opacity: 0.5 },
          }))
        }
      />

      <ControlCheckboxCell
        label="오버레이"
        checked={normalized.overlay.enabled}
        disabled={!availability.overlay}
        description={overlayFileName}
        onChange={(v) =>
          setContext((p) => ({
            ...p,
            overlay: { ...p.overlay, enabled: v },
          }))
        }
      />

      <div
        className={styles.controlCell}
        data-disabled={overlayControlsDisabled ? 'true' : undefined}
      >
        <span className={styles.label}>블렌드</span>

        <div className={styles.blendRow}>
          <span className={styles.blendLabel}>Current</span>

          <input
            className={styles.blendSlider}
            type="range"
            min={0}
            max={100}
            step={5}
            value={overlayOpacityPercent}
            disabled={overlayControlsDisabled}
            onChange={(e) => {
              const next = Number(e.target.value) / 100;
              setContext((p) => ({
                ...p,
                overlay: { ...p.overlay, opacity: next },
              }));
            }}
            aria-label="Blend current and overlay"
          />

          <span className={styles.blendLabel}>Overlay</span>
          <span className={styles.blendValue}>{overlayOpacityPercent}%</span>
        </div>
      </div>
    </>
  );
};
