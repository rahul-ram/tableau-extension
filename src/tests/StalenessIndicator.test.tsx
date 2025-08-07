import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    expect(screen.getByText('Data Stale')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('renders with fresh status', () => {
    const status = { timestamp: '2023-10-01T10:30:00Z', isStale: false };
    const checkStaleness = vi.fn();

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    expect(screen.getByText('Data Current')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('renders unknown status when status is null', () => {
    const checkStaleness = vi.fn();

    render(<StalenessIndicator status={null} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    expect(screen.getByText('Unknown Status')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('calls checkStaleness when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const checkStaleness = vi.fn().mockResolvedValue(undefined);
    const status = { timestamp: '2023-10-01T00:00:00Z', isStale: true };

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    const refreshButton = screen.getByRole('button');
    await user.click(refreshButton);

    await waitFor(() => {
      expect(checkStaleness).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  test('displays tooltip with correct information', () => {
    const checkStaleness = vi.fn();
    const status = { timestamp: '2023-10-01T00:00:00Z', isStale: true };

    render(<StalenessIndicator status={status} checkStaleness={checkStaleness} />, { wrapper: TestWrapper });

    const refreshButton = screen.getByRole('button');
    expect(refreshButton).toHaveAttribute('aria-label', expect.stringContaining('Check if there is a newer version'));
  });
});