import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
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

  const getStatusText = () => {
    if (!status) return 'Unknown Status';
    return status.isStale ? 'Data Stale' : 'Data Current';
  };

  const getStatusColor = () => {
    if (!status) return 'warning';
    return status.isStale ? 'error' : 'success';
  };

  const getStatusIcon = () => {
    if (!status) return <Warning />;
    return status.isStale ? <Warning /> : <CheckCircle />;
  };

  const getTooltipText = () => {
    const baseText = 'Check if there is a newer version of data for the selected report';
    if (status) {
      return `${baseText}\nLast updated: ${formatTimestamp(status.timestamp)}`;
    }
    return baseText;
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '4px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <Fade in={!isChecking}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor() as any}
          size="small"
          variant="filled"
          sx={{
            fontSize: '0.6875rem',
            height: '24px',
            '& .MuiChip-icon': {
              fontSize: '14px',
            },
          }}
        />
      </Fade>

      <Tooltip
        title={getTooltipText()}
        placement="bottom-end"
        arrow
      >
        <IconButton
          onClick={handleCheckStaleness}
          disabled={isChecking}
          size="small"
          sx={{
            width: 24,
            height: 24,
            '&:hover': {
              backgroundColor: 'rgba(31, 119, 180, 0.1)',
            },
          }}
        >
          {isChecking ? (
            <CircularProgress size={14} />
          ) : (
            <Sync sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default StalenessIndicator;