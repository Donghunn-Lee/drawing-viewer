import type { ViewerContext } from '../../shared/types/context';
import metadataJson from '../../data/metadata.json';
import type { Metadata } from '../../shared/types/metadata';
import { EntryMap } from '../EntryMap';
import { DrawingViewer } from './DrawingViewer';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ViewerPane = ({ context, setContext }: Props) => {
  if (!context.activeDrawingId) {
    return <EntryMap setContext={setContext} />;
  }

  const drawing = metadata.drawings[context.activeDrawingId];
  if (!drawing) {
    return <div style={{ flex: 1 }} />;
  }

  return <DrawingViewer drawing={drawing} context={context} setContext={setContext} />;
};
