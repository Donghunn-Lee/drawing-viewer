import { useMemo } from 'react';
import type { ViewerContext } from '../../shared/types/context';
import metadataJson from '../../data/metadata.json';
import type { Metadata } from '../../shared/types/metadata';

import { DrawingControls } from './DrawingControls';
import { DrawingCanvas } from './DrawingCanvas';
import { getBaseImageSrc, getOverlayImage } from '../../entities/drawing/selectors';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ViewerPane = ({ context, setContext }: Props) => {
  const root = useMemo(
    () => Object.values(metadata.drawings).find((d) => d.parent === null) ?? null,
    [],
  );

  const activeDrawing = useMemo(() => {
    if (!context.activeDrawingId) return null;
    return metadata.drawings[context.activeDrawingId] ?? null;
  }, [context.activeDrawingId]);

  const drawingForView = activeDrawing ?? root;

  const baseSrc = drawingForView
    ? getBaseImageSrc({
        drawing: drawingForView,
        activeDiscipline: context.activeDiscipline,
        activeRegion: context.activeRegion,
        activeRevision: context.activeRevision,
      })
    : null;

  const overlayInfo =
    context.overlay.enabled && drawingForView
      ? getOverlayImage({
          drawing: drawingForView,
          activeDiscipline: context.activeDiscipline,
          activeRegion: context.activeRegion,
          activeRevision: context.activeRevision,
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Controls: drawing에 discipline이 있을 때만 */}
      {drawingForView?.disciplines && (
        <DrawingControls drawing={drawingForView} context={context} setContext={setContext} />
      )}

      {/* Canvas */}
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
