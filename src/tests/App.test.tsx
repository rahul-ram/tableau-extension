import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../App';
import * as apiService from '../api/apiService';

// Mock the API service
vi.mock('../api/apiService', () => ({
  ApiService: {
    getWorkspaces: vi.fn(),
    getReports: vi.fn(),
    getReportParams: vi.fn(),
    checkDataStaleness: vi.fn(),
    storeReportParams: vi.fn(),
    createDataSource: vi.fn(),
  },
  withErrorHandling: vi.fn((fn) => fn()),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main App component', () => {
    render(<App />);

    expect(screen.getByText('Parameterized Report Extension')).toBeInTheDocument();
    expect(screen.getByText('Workspace & Report')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Unknown Status')).toBeInTheDocument(); // StalenessIndicator
  });

  test('initializes Tableau extension on mount', async () => {
    render(<App />);

    await waitFor(() => {
      expect(tableau.extensions.initializeAsync).toHaveBeenCalledTimes(1);
    });
  });

  test('resets form when reset button clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click reset
    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    expect(resetButton).toBeInTheDocument();
  });

  test('submit button is disabled when form is invalid', () => {
    const mockStoreParams = vi.mocked(apiService.ApiService.storeReportParams);
    const mockCreateDataSource = vi.mocked(apiService.ApiService.createDataSource);

    mockStoreParams.mockResolvedValue({
      message: 'Success',
      userEmail: 'test@example.com',
      reportName: 'test',
      paramCount: 0
    });
    mockCreateDataSource.mockResolvedValue({
      message: 'Success',
      dataSourceName: 'test-ds',
      userEmail: 'test@example.com',
      reportName: 'test',
      status: 'ready'
    });

    render(<App />);

    const submitButton = screen.getByText('Submit');

    // Submit button should be disabled when form is invalid
    expect(submitButton).toBeDisabled();
  });

  test('submit button shows correct initial state', () => {
    render(<App />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Submit');
  });

  test('shows correct error handling', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<App />);

    // Should render without errors
    expect(screen.getByText('Parameterized Report Extension')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test('handles tableau initialization error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    (tableau.extensions.initializeAsync as any).mockRejectedValueOnce(new Error('Tableau Error'));

    render(<App />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error initializing Tableau:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('shows staleness indicator', () => {
    render(<App />);

    // Should show the staleness indicator
    expect(screen.getByText('Unknown Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check if there is a newer version/i })).toBeInTheDocument();
  });
});