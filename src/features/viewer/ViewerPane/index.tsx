import { useMemo } from 'react';
import type { ViewerContext } from '../../../shared/types/context';
import type { Metadata } from '../../../shared/types/metadata';

import metadataJson from '../../../data/metadata.json';

import { DrawingCanvas } from './DrawingCanvas';
import { getBaseImageSrc, getOverlayImage } from '../../../entities/drawing/selectors';

import { ViewerContextSurface } from './ViewerContextSurface';
import { ViewerSelectSection } from './sections/ViewerSelectSection';
import { ViewerContextSection } from './sections/ViewerContextSections';
import { GridSurface } from './layout/GridSurface';
import { useViewerDerivedState } from './hooks/useViewerDerivedState';

import styles from './ViewerPane.module.css';
import { ContextCard } from './layout/ContextCard';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
  layout?: 'top' | 'side';
};

export const ViewerPane = ({ context, setContext, layout = 'top' }: Props) => {
  const rootDrawing = useMemo(
    () => Object.values(metadata.drawings).find((d) => d.parent === null) ?? null,
    [],
  );

  const activeDrawing = useMemo(() => {
    if (!context.activeDrawingId) return null;
    return metadata.drawings[context.activeDrawingId] ?? null;
  }, [context.activeDrawingId]);

  const drawingForView = activeDrawing ?? rootDrawing;

  const derived = useViewerDerivedState(context, drawingForView);

  const baseSrc =
    drawingForView &&
    getBaseImageSrc({
      drawing: drawingForView,
      activeDiscipline: derived.normalized.discipline,
      activeRegion: derived.normalized.region,
      activeRevision: derived.normalized.revision,
    });

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

  return (
    <div className={styles.viewerRoot}>
      {drawingForView?.disciplines && (
        <ViewerContextSurface layout={layout}>
          {layout === 'top' ? (
            <>
              <ContextCard>
                <GridSurface rows={4}>
                  <ViewerSelectSection state={derived} setContext={setContext} />
                </GridSurface>
              </ContextCard>

              <ContextCard>
                <GridSurface rows={4}>
                  <ViewerContextSection context={context} revision={derived.activeRevisionData} />
                </GridSurface>
              </ContextCard>
            </>
          ) : (
            <>
              <ContextCard>
                <ViewerSelectSection state={derived} setContext={setContext} />
              </ContextCard>

              <ContextCard>
                <ViewerContextSection context={context} revision={derived.activeRevisionData} />
              </ContextCard>
            </>
          )}
        </ViewerContextSurface>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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
