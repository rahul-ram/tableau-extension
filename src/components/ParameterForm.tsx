import React, { useEffect, useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Business, Assessment, TuneOutlined } from '@mui/icons-material';
import { ApiService, withErrorHandling } from '../api/apiService';
import type { ReportParameter } from '../types';

interface ParameterFormProps {
  userEmail: string;
  selectedWorkspace: string;
  setSelectedWorkspace: (value: string) => void;
  selectedReport: string;
  setSelectedReport: (value: string) => void;
  reportParams: ReportParameter[];
  setReportParams: (params: ReportParameter[]) => void;
  paramValues: Record<string, string | number>;
  setParamValues: (values: Record<string, string | number>) => void;
  isRange: boolean;
  setIsRange: (value: boolean) => void;
  cobDateFrom: string;
  setCobDateFrom: (value: string) => void;
  cobDateTo: string;
  setCobDateTo: (value: string) => void;
}

const ParameterForm: React.FC<ParameterFormProps> = ({
  userEmail,
  selectedWorkspace,
  setSelectedWorkspace,
  selectedReport,
  setSelectedReport,
  reportParams,
  setReportParams,
  paramValues,
  setParamValues,
  isRange,
  setIsRange,
  cobDateFrom,
  setCobDateFrom,
  cobDateTo,
  setCobDateTo,
}) => {
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [reports, setReports] = useState<string[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const result = await withErrorHandling(
        () => ApiService.getWorkspaces(),
        'Error fetching workspaces'
      );
      if (result) {
        setWorkspaces(result.workspaces);
      }
    };
    
    fetchWorkspaces();
  }, [userEmail]);

  useEffect(() => {
    if (selectedWorkspace) {
      const fetchReports = async () => {
        const result = await withErrorHandling(
          () => ApiService.getReports(selectedWorkspace),
          'Error fetching reports'
        );
        if (result) {
          setReports(result.reports);
          setSelectedReport('');
          setReportParams([]);
          setParamValues({});
        }
      };
      
      fetchReports();
    }
  }, [selectedWorkspace, userEmail]);

    useEffect(() => {
    if (selectedReport && selectedWorkspace) {
      const fetchReportParams = async () => {
        const result = await withErrorHandling(
          () => ApiService.getReportParams(selectedWorkspace, selectedReport),
          'Error fetching report params'
        );
        if (result) {
          const params = result.parameters || [];
          setReportParams(params);
          setParamValues({});
          
          // Check if this report uses date ranges
          const hasDateRange = params.some((param: ReportParameter) => 
            param.param_name === 'cobdate_from' || param.param_name === 'cobdate_to'
          );
          setIsRange(hasDateRange);
        }
      };
      
      fetchReportParams();
    }
  }, [selectedReport, selectedWorkspace, setReportParams, setParamValues, setIsRange]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getInputType = (dataType: string) => {
    switch (dataType) {
      case 'date':
        return 'date';
      case 'number':
      case 'float':
        return 'number';
      default:
        return 'text';
    }
  };

  const handleParameterChange = (paramName: string, value: string, dataType: string) => {
    let processedValue: string | number = value;

    if (dataType === 'number' || dataType === 'float') {
      processedValue = value === '' ? '' : Number(value);
    } else if (dataType === 'date') {
      processedValue = formatDate(value);
    }

    setParamValues({ ...paramValues, [paramName]: processedValue });
  };

  const getDisplayValue = (paramName: string, dataType: string) => {
    const value = paramValues[paramName];
    if (dataType === 'date' && typeof value === 'string' && value) {
      // Convert YYYYMMDD back to YYYY-MM-DD for display
      return value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    }
    return value || '';
  };

  const handleWorkspaceChange = (value: string) => {
    setSelectedWorkspace(value);
    // Reset dependent fields when workspace changes
    if (value === '' || value === 'Select a workspace') {
      setSelectedReport('');
      setReportParams([]);
      setParamValues({});
      setIsRange(false);
    }
  };

  const handleReportChange = (value: string) => {
    setSelectedReport(value);
    // Reset dependent fields when report changes
    if (value === '' || value === 'Select a report') {
      setReportParams([]);
      setParamValues({});
      setIsRange(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Workspace and Report Selection */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Business color="primary" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
          <Typography variant={isMobile ? "body1" : "h6"} color="primary" fontWeight="bold">
            Workspace & Report
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 1 : 2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="workspace-label">Workspace</InputLabel>
              <Select
                labelId="workspace-label"
                value={selectedWorkspace}
                label="Workspace"
                onChange={(e) => handleWorkspaceChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a workspace</em>
                </MenuItem>
                {(workspaces || []).map((ws) => (
                  <MenuItem key={ws} value={ws}>
                    {ws}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" disabled={!selectedWorkspace}>
              <InputLabel id="report-label">Report</InputLabel>
              <Select
                labelId="report-label"
                value={selectedReport}
                label="Report"
                onChange={(e) => handleReportChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a report</em>
                </MenuItem>
                {(reports || []).map((report) => (
                  <MenuItem key={report} value={report}>
                    {report}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Report Parameters */}
      {reportParams.length > 0 && (
        <Box sx={{ mb: isMobile ? 2 : 3 }}>
          <Divider sx={{ mb: 1.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <TuneOutlined color="primary" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
            <Typography variant={isMobile ? "body1" : "h6"} color="primary" fontWeight="bold">
              Parameters
            </Typography>
          </Box>

          <Grid container spacing={isMobile ? 1 : 2}>
            {(reportParams || []).filter(param =>
              param.param_name !== 'cobdate_from' &&
              param.param_name !== 'cobdate_to' &&
              param.param_name !== 'cobdate'
            ).map((param) => (
              <Grid item xs={12} md={isTablet ? 12 : 6} key={param.param_name}>
                <TextField
                  fullWidth
                  size="small"
                  label={param.param_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  type={getInputType(param.data_type)}
                  value={getDisplayValue(param.param_name, param.data_type)}
                  onChange={(e) =>
                    handleParameterChange(param.param_name, e.target.value, param.data_type)
                  }
                  variant="outlined"
                  inputProps={{
                    step: param.data_type === 'float' ? '0.01' : '1',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Date Selection - only show if report has date parameters */}
      {reportParams.some(param =>
        param.param_name === 'cobdate' ||
        param.param_name === 'cobdate_from' ||
        param.param_name === 'cobdate_to'
      ) && (
          <Box sx={{ mb: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Assessment color="primary" sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
              <Typography variant={isMobile ? "body1" : "h6"} color="primary" fontWeight="bold">
                {isRange ? 'COB Date Range' : 'COB Date'}
              </Typography>
            </Box>

            <Grid container spacing={isMobile ? 1 : 2}>
              {/* Single COB Date */}
              {reportParams.some(param => param.param_name === 'cobdate') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="COB Date"
                    type="date"
                    value={cobDateFrom ? cobDateFrom.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : ''}
                    onChange={(e) => setCobDateFrom(formatDate(e.target.value))}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              )}

              {/* Date Range */}
              {reportParams.some(param => param.param_name === 'cobdate_from') && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="COB Date From"
                      type="date"
                      value={cobDateFrom ? cobDateFrom.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : ''}
                      onChange={(e) => setCobDateFrom(formatDate(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="COB Date To"
                      type="date"
                      value={cobDateTo ? cobDateTo.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : ''}
                      onChange={(e) => setCobDateTo(formatDate(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
    </Box>
  );
};

export default ParameterForm;