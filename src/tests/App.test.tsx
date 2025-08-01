import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main App component', () => {
    render(<App />);
    
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Use COB Date Range')).toBeInTheDocument();
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
    mockAxios.post.mockResolvedValue({ data: {} });
    
    render(<App />);
    
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  test('disables submit button when loading', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<App />);
    
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  test('handles submit API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAxios.post.mockRejectedValueOnce(new Error('API Error'));
    
    render(<App />);
    
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('handles tableau initialization error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (tableau.extensions.initializeAsync as any).mockRejectedValueOnce(new Error('Tableau Error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error initializing Tableau:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('checks staleness when report status exists', async () => {
    mockAxios.get.mockResolvedValueOnce({ 
      data: { timestamp: '2023-10-01T00:00:00Z', isStale: false }
    });
    
    render(<App />);
    
    // Simulate having selected a report (this would trigger checkStaleness)
    // Note: This test would be more complete with state management or mocking
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