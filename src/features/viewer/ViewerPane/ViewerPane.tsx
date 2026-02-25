import { useEffect, useMemo, useRef, useState } from 'react';
import type { ViewerContext } from '../../../shared/types/context';
import type { Metadata } from '../../../shared/types/metadata';

import metadataJson from '../../../data/metadata.json';

import { DrawingCanvas } from './DrawingCanvas';
import { getBaseImageSrc, getOverlayImage } from '../../../entities/drawing/selectors';

import { ViewerControlsPanel } from './ViewerControlsPanel';
import { ViewerSelectSection } from './sections/ViewerSelectSection';
import { ViewerContextSection } from './sections/ViewerContextSections';
import { useViewerDerivedState } from './hooks/useViewerDerivedState';

import styles from './ViewerPane.module.css';
import { ContextCard } from './layout/ContextCard';
import clsx from 'clsx';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
  panelOpen: boolean;
};

export const ViewerPane = ({ context, setContext, panelOpen }: Props) => {
  const prevDrawingId = useRef<string | null>(null);

  const [side, setSide] = useState<'left' | 'right'>('left');
  const [layout, setLayout] = useState<'top' | 'side'>(() =>
    window.innerWidth / window.innerHeight > 1.2 ? 'side' : 'top',
  );

  const rootDrawing = useMemo(
    () => Object.values(metadata.drawings).find((d) => d.parent === null) ?? null,
    [],
  );

  const activeDrawing = useMemo(() => {
    if (!context.activeDrawingId) return null;
    return metadata.drawings[context.activeDrawingId] ?? null;
  }, [context.activeDrawingId]);

  const drawingForView = activeDrawing ?? rootDrawing;

  const siteOptions = useMemo(() => {
    if (!rootDrawing) return [];

    return Object.values(metadata.drawings)
      .filter((d) => d.parent === rootDrawing.id)
      .map((d) => ({
        value: d.id,
        label: d.name,
      }));
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

  useEffect(() => {
    const onResize = () => {
      const isLandscape = window.innerWidth / window.innerHeight > 1.2;
      setLayout(isLandscape ? 'side' : 'top');
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      className={clsx(
        styles.viewerRoot,
        layout === 'side'
          ? panelOpen
            ? styles.viewerSide
            : styles.viewerSideClosed
          : styles.viewerTop,
      )}
    >
      <ViewerControlsPanel layout={layout} open={panelOpen} side={side}>
        <ContextCard title="Select">
          <ViewerSelectSection state={derived} siteOptions={siteOptions} setContext={setContext} />
        </ContextCard>

        <ContextCard title="Context">
          <ViewerContextSection context={context} revision={derived.activeRevisionData} />
        </ContextCard>
      </ViewerControlsPanel>

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
