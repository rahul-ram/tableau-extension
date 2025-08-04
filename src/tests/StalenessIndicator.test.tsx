import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTableauTheme } from '../theme/tableauTheme';
import StalenessIndicator from '../components/StalenessIndicator';

// Wrapper component to provide theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={createTableauTheme()}>
    {children}
  </ThemeProvider>
);

describe('StalenessIndicator', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('renders with stale status', () => {
    const status = { timestamp: '2023-10-01T00:00:00Z', isStale: true };
    const checkStaleness = vi.fn();

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    expect(screen.getByText('Data Status')).toBeInTheDocument();
    expect(screen.getByText('Data Stale')).toBeInTheDocument();
  });

  test('renders with fresh status', () => {
    const status = { timestamp: '2023-10-01T10:30:00Z', isStale: false };
    const checkStaleness = vi.fn();

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    expect(screen.getByText('Data Status')).toBeInTheDocument();
    expect(screen.getByText('Data Fresh')).toBeInTheDocument();
  });

  test('renders no data status message when status is null', () => {
    const checkStaleness = vi.fn();

    render(<StalenessIndicator status={null} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    expect(screen.getByText('No data status available')).toBeInTheDocument();
  });

  test('calls checkStaleness on mount', () => {
    const checkStaleness = vi.fn();
    const status = { timestamp: '2023-10-01T00:00:00Z', isStale: true };

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    expect(checkStaleness).toHaveBeenCalledTimes(1);
  });

  test('sets up interval to check staleness every 60 seconds', () => {
    const checkStaleness = vi.fn();
    const status = { timestamp: '2023-10-01T00:00:00Z', isStale: true };

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    // Initial call
    expect(checkStaleness).toHaveBeenCalledTimes(1);

    // After 60 seconds
    vi.advanceTimersByTime(60000);
    expect(checkStaleness).toHaveBeenCalledTimes(2);

    // After another 60 seconds
    vi.advanceTimersByTime(60000);
    expect(checkStaleness).toHaveBeenCalledTimes(3);
  });

  test('cleans up interval on unmount', () => {
    const checkStaleness = vi.fn();
    const status = { timestamp: '2023-10-01T00:00:00Z', isStale: true };

    const { unmount } = render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />);

    unmount();

    // Should not call checkStaleness after unmount
    vi.advanceTimersByTime(60000);
    expect(checkStaleness).toHaveBeenCalledTimes(1); // Only the initial call
  });
});