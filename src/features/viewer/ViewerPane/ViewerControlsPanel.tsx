import { useEffect, useState } from 'react';
import styles from './ViewerPane.module.css';

type Props = {
  children: React.ReactNode;
};

export const ViewerControlsPanel = ({ children }: Props) => {
  const [layout, setLayout] = useState<'top' | 'side'>(() =>
    window.innerWidth / window.innerHeight > 1.2 ? 'side' : 'top',
  );

  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth / window.innerHeight > 1.2;
      setLayout(isLandscape ? 'side' : 'top');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={layout === 'side' ? styles.controlsSide : styles.controlsTop}>{children}</div>
  );
};
