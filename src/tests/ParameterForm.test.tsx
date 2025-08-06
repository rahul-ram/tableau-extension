import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTableauTheme } from '../theme/tableauTheme';
import ParameterForm from '../components/ParameterForm';
import * as apiService from '../api/apiService';

// Mock the API service
vi.mock('../api/apiService', () => ({
  ApiService: {
    getWorkspaces: vi.fn(),
    getReports: vi.fn(),
    getReportParams: vi.fn(),
  },
  withErrorHandling: vi.fn((fn) => fn()),
}));

// Wrapper component to provide theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={createTableauTheme()}>
    {children}
  </ThemeProvider>
);

describe('ParameterForm', () => {
  const defaultProps = {
    userEmail: 'test@example.com',
    selectedWorkspace: '',
    setSelectedWorkspace: vi.fn(),
    selectedReport: '',
    setSelectedReport: vi.fn(),
    reportParams: [],
    setReportParams: vi.fn(),
    paramValues: {},
    setParamValues: vi.fn(),
    isRange: false,
    setIsRange: vi.fn(),
    cobDateFrom: '',
    setCobDateFrom: vi.fn(),
    cobDateTo: '',
    setCobDateTo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly with initial state', () => {
    render(<ParameterForm {...defaultProps} />, { wrapper: TestWrapper });

    expect(screen.getByText('Workspace & Report')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /report/i })).toBeInTheDocument();
  });

  test('fetches workspaces on mount', async () => {
    const mockGetWorkspaces = vi.mocked(apiService.ApiService.getWorkspaces);
    mockGetWorkspaces.mockResolvedValueOnce({
      workspaces: ['HISTSIM', 'FRTB', 'SANDBOX']
    });

    render(<ParameterForm {...defaultProps} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockGetWorkspaces).toHaveBeenCalledTimes(1);
    });
  });

  test('fetches reports when workspace is selected', async () => {
    const mockGetReports = vi.mocked(apiService.ApiService.getReports);
    mockGetReports.mockResolvedValueOnce({
      reports: ['Report1', 'Report2']
    });

    const props = { ...defaultProps, selectedWorkspace: 'HISTSIM' };
    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockGetReports).toHaveBeenCalledWith('HISTSIM');
    });
  });

  test('fetches report parameters when report is selected', async () => {
    const mockGetReportParams = vi.mocked(apiService.ApiService.getReportParams);
    mockGetReportParams.mockResolvedValueOnce({
      parameters: [
        { param_name: 'SNAPTYPE', data_type: 'string' },
        { param_name: 'RISKCLASS', data_type: 'string' }
      ]
    });

    const props = { ...defaultProps, selectedReport: 'TestReport', selectedWorkspace: 'TestWorkspace' };
    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockGetReportParams).toHaveBeenCalledWith('TestWorkspace', 'TestReport');
    });
  });

  test('renders parameter fields dynamically', () => {
    const props = {
      ...defaultProps,
      reportParams: [
        { param_name: 'SNAPTYPE', data_type: 'string' as const },
        { param_name: 'RISKCLASS', data_type: 'string' as const }
      ],
      paramValues: { SNAPTYPE: 'EOD', RISKCLASS: 'EQUITY' }
    };

    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EOD')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EQUITY')).toBeInTheDocument();
  });

  test('shows COB Date To field when isRange is true', () => {
    const props = { ...defaultProps, isRange: true };
    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    expect(screen.getByRole('textbox', { name: /cob date to/i })).toBeInTheDocument();
  });

  test('formats date correctly', async () => {
    const user = userEvent.setup();
    render(<ParameterForm {...defaultProps} />, { wrapper: TestWrapper });

    const dateInput = screen.getByRole('textbox', { name: /cob date from/i });
    await user.clear(dateInput);
    await user.type(dateInput, '2023-12-31');

    await waitFor(() => {
      expect(defaultProps.setCobDateFrom).toHaveBeenCalledWith('20231231');
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const mockGetWorkspaces = vi.mocked(apiService.ApiService.getWorkspaces);
    mockGetWorkspaces.mockRejectedValueOnce(new Error('API Error'));

    render(<ParameterForm {...defaultProps} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching workspaces:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});