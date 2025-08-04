import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { createTableauTheme } from '../theme/tableauTheme';
import ParameterForm from '../components/ParameterForm';

const mockAxios = axios as any;

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

    expect(screen.getByText('Workspace & Report Selection')).toBeInTheDocument();
    expect(screen.getByText('Close of Business Date')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /report/i })).toBeInTheDocument();
  });

  test('fetches workspaces on mount', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { workspaces: ['HISTSIM', 'FRTB', 'SANDBOX'] }
    });

    render(<ParameterForm {...defaultProps} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/reportsApi/getWorkspace'),
        { params: { userEmail: 'test@example.com' } }
      );
    });
  });

  test('fetches reports when workspace is selected', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { reports: ['Report1', 'Report2'] }
    });

    const props = { ...defaultProps, selectedWorkspace: 'HISTSIM' };
    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/reportsApi/getReports'),
        { params: { userEmail: 'test@example.com', workspaceName: 'HISTSIM' } }
      );
    });
  });

  test('fetches report parameters when report is selected', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { parameters: ['SNAPTYPE', 'RISKCLASS'] }
    });

    const props = { ...defaultProps, selectedReport: 'TestReport' };
    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/reportsApi/getReportParams'),
        { params: { reportName: 'TestReport' } }
      );
    });
  });

  test('renders parameter fields dynamically', () => {
    const props = {
      ...defaultProps,
      reportParams: ['SNAPTYPE', 'RISKCLASS'],
      paramValues: { SNAPTYPE: 'EOD', RISKCLASS: 'EQUITY' }
    };

    render(<ParameterForm {...props} />, { wrapper: TestWrapper });

    expect(screen.getByText('Report Parameters')).toBeInTheDocument();
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
    mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<ParameterForm {...defaultProps} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching workspaces:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});