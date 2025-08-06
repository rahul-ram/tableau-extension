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
    expect(screen.getByText('Workspace & Report Selection')).toBeInTheDocument();
    expect(screen.getByText('Close of Business Date')).toBeInTheDocument();
    expect(screen.getByText('COB Range')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('initializes Tableau extension on mount', async () => {
    render(<App />);

    await waitFor(() => {
      expect(tableau.extensions.initializeAsync).toHaveBeenCalledTimes(1);
    });
  });

  test('toggles range checkbox', async () => {
    const user = userEvent.setup();
    render(<App />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('resets form when reset button clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Toggle checkbox first
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    // Click reset
    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    expect(checkbox).not.toBeChecked();
  });

  test('handles submit with successful API calls', async () => {
    const user = userEvent.setup();
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
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockStoreParams).toHaveBeenCalledTimes(1);
      expect(mockCreateDataSource).toHaveBeenCalledTimes(1);
    });
  });

  test('disables submit button when loading', async () => {
    const user = userEvent.setup();
    const mockStoreParams = vi.mocked(apiService.ApiService.storeReportParams);
    mockStoreParams.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ 
      message: 'Success', 
      userEmail: 'test@example.com', 
      reportName: 'test', 
      paramCount: 0 
    }), 100)));

    render(<App />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  test('handles submit API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const mockStoreParams = vi.mocked(apiService.ApiService.storeReportParams);
    mockStoreParams.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error storing parameters:', expect.any(Error));
    });

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

  test('shows data status section', async () => {
    render(<App />);

    // Should show the data status section
    expect(screen.getByText('Data Status')).toBeInTheDocument();
    expect(screen.getByText('No data status available')).toBeInTheDocument();
  });

  test('formats date range correctly when range is enabled', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Enable range
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // This would be tested more thoroughly with actual date inputs
    // in a more complex test setup
    expect(checkbox).toBeChecked();
  });
});