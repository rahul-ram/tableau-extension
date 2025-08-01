import React, { useEffect } from 'react';
// Using basic HTML elements since Box and Typography are not available in tableau-ui
import type { ReportStatus } from '../types';

interface StalenessIndicatorProps {
  status: ReportStatus | null;
  checkStaleness: () => void;
}

const StalenessIndicator: React.FC<StalenessIndicatorProps> = ({ status, checkStaleness }) => {
  useEffect(() => {
    checkStaleness();
    const interval = setInterval(checkStaleness, 60000);
    return () => clearInterval(interval);
  }, [checkStaleness]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <p style={{ color: 'white', margin: 0 }}>
        {status ? `Data last updated: ${status.timestamp} (${status.isStale ? 'Stale' : 'Fresh'})` : 'No data status available'}
      </p>
    </div>
  );
};

export default StalenessIndicator;