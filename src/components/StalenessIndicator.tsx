import React from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Warning,
  Sync,
} from '@mui/icons-material';

import type { ReportStatus } from '../types';

interface StalenessIndicatorProps {
  status: ReportStatus | null;
  checkStaleness: () => void;
}

const StalenessIndicator: React.FC<StalenessIndicatorProps> = ({ status, checkStaleness }) => {
  const [isChecking, setIsChecking] = React.useState(false);

  const handleCheckStaleness = async () => {
    setIsChecking(true);
    await checkStaleness();
    setIsChecking(false);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };



  const getStatusIcon = (isStale: boolean) => {
    return isStale ? <Warning /> : <CheckCircle />;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTime color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            Data Status
          </Typography>
          {isChecking && (
            <CircularProgress size={16} sx={{ ml: 1 }} />
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={handleCheckStaleness}
          disabled={isChecking}
          startIcon={<Sync />}
        >
          Check Status
        </Button>
      </Box>

      {status ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={getStatusIcon(status.isStale)}
            label={status.isStale ? 'Data Stale' : 'Data Fresh'}
            color={status.isStale ? 'error' : 'success'}
            variant="filled"
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Sync sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Last updated: {formatTimestamp(status.timestamp)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<Warning />}
            label="No data status available"
            color="warning"
            variant="outlined"
          />
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click "Check Status" to verify data freshness
      </Typography>
    </Box>
  );
};

export default StalenessIndicator;