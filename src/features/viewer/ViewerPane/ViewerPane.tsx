import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';

import type { ViewerContext } from '../../../shared/types/context';
import type { Metadata } from '../../../shared/types/metadata';
import type { ViewerLayout } from '../../../shared/types/viewerLayout';

import metadataJson from '../../../data/metadata.json';

import { DrawingCanvas } from './DrawingCanvas';
import { ViewerControlsPanel } from './ViewerControlsPanel';
import { ViewerSelectSection } from './sections/ViewerSelectSection';
import { ViewerContextSection } from './sections/ViewerContextSections';
import { ContextCard } from './layout/ContextCard';

import { getBaseImageSrc, getOverlayImage } from '../../../entities/drawing/selectors';
import { useViewerDerivedState } from './hooks/useViewerDerivedState';

import styles from './ViewerPane.module.css';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
  viewerLayout: ViewerLayout;
};

export const ViewerPane = ({ context, setContext, viewerLayout }: Props) => {
  const prevDrawingId = useRef<string | null>(null);

  const isTop = viewerLayout.mode === 'top';
  const isSide = viewerLayout.mode === 'side';
  const isOpen = viewerLayout.open;
  const side = viewerLayout.mode === 'side' ? viewerLayout.side : null;

  const showControls = isSide || (isTop && isOpen);

  const rootDrawing = useMemo(
    () => Object.values(metadata.drawings).find((d) => d.parent === null) ?? null,
    [],
  );

  const activeDrawing = useMemo(
    () => (context.activeDrawingId ? (metadata.drawings[context.activeDrawingId] ?? null) : null),
    [context.activeDrawingId],
  );

  const drawingForView = activeDrawing ?? rootDrawing;

  const siteOptions = useMemo(() => {
    if (!rootDrawing) return [];
    return Object.values(metadata.drawings)
      .filter((d) => d.parent === rootDrawing.id)
      .map((d) => ({ value: d.id, label: d.name }));
  }, [rootDrawing]);

  const derived = useViewerDerivedState({ context, drawing: drawingForView });

  const baseSrc =
    drawingForView &&
    (getBaseImageSrc({
      drawing: drawingForView,
      activeDiscipline: derived.normalized.discipline,
      activeRegion: derived.normalized.region,
      activeRevision: derived.normalized.revision,
    }) ??
      drawingForView.image);

  const overlayInfo =
    derived.normalized.overlay.enabled && drawingForView
      ? getOverlayImage({
          drawing: drawingForView,
          activeDiscipline: derived.normalized.discipline,
          activeRegion: derived.normalized.region,
          activeRevision: derived.normalized.revision,
        })
      : null;

  const polygons = useMemo(() => {
    if (!drawingForView || drawingForView.parent !== null) return [];
    return Object.values(metadata.drawings)
      .filter((d) => d.parent === drawingForView.id && d.position)
      .map((child) => ({
        vertices: child.position!.vertices,
        stroke: 'rgba(0,120,255,0.8)',
        fill: 'rgba(0,120,255,0.5)',
        strokeWidth: 2,
      }));
  }, [drawingForView]);

  const handlePolygonClick = (index: number) => {
    if (!drawingForView || drawingForView.parent !== null) return;

    const children = Object.values(metadata.drawings).filter(
      (d) => d.parent === drawingForView.id && d.position,
    );

    const next = children[index];
    if (!next) return;

    setContext((prev) => ({
      ...prev,
      activeDrawingId: next.id,
      activeDiscipline: null,
      activeRegion: null,
      activeRevision: null,
    }));
  };

  useEffect(() => {
    if (prevDrawingId.current && prevDrawingId.current !== context.activeDrawingId) {
      setContext((prev) => ({
        ...prev,
        activeDiscipline: null,
        activeRegion: null,
        activeRevision: null,
      }));
    }
    prevDrawingId.current = context.activeDrawingId;
  }, [context.activeDrawingId, setContext]);

  return (
    <div
      className={clsx(
        styles.viewerRoot,
        isTop && styles.viewerTop,
        isSide && styles.viewerSide,
        isSide && side === 'left' && styles.left,
        isSide && side === 'right' && styles.right,
        isSide && !isOpen && styles.closed,
      )}
    >
      {showControls && (
        <div className={styles.controlsPanel}>
          <ViewerControlsPanel layout={viewerLayout.mode}>
            <ContextCard title="Select">
              <ViewerSelectSection
                state={derived}
                siteOptions={siteOptions}
                setContext={setContext}
              />
            </ContextCard>

            <ContextCard title="Context">
              <ViewerContextSection context={context} revision={derived.activeRevisionData} />
            </ContextCard>
          </ViewerControlsPanel>
        </div>
      )}

      <div className={styles.canvasWrapper}>
        {baseSrc && (
          <DrawingCanvas
            baseSrc={overlayInfo ? overlayInfo.src : baseSrc}
            polygons={polygons}
            overlays={
              overlayInfo
                ? [
                    {
                      src: baseSrc!,
                      imageTransform: overlayInfo.imageTransform,
                      opacity: context.overlay.opacity,
                    },
                  ]
                : []
            }
            onPolygonClick={polygons.length > 0 ? handlePolygonClick : undefined}
          />
        )}
      </div>
    </div>
  );
};
