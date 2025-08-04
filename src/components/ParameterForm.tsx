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
} from '@mui/material';
import { Business, Assessment, TuneOutlined } from '@mui/icons-material';
import axios from 'axios';
import { API_HOSTNAME } from '../config';

interface ParameterFormProps {
  userEmail: string;
  selectedWorkspace: string;
  setSelectedWorkspace: (value: string) => void;
  selectedReport: string;
  setSelectedReport: (value: string) => void;
  reportParams: string[];
  setReportParams: (params: string[]) => void;
  paramValues: Record<string, string>;
  setParamValues: (values: Record<string, string>) => void;
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
  cobDateFrom,
  setCobDateFrom,
  cobDateTo,
  setCobDateTo,
}) => {
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [reports, setReports] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get(`${API_HOSTNAME}/reportsApi/getWorkspace`, {
        params: { userEmail },
      })
      .then(response => {
        setWorkspaces(response.data.workspaces);
      })
      .catch(error => console.error('Error fetching workspaces:', error));
  }, [userEmail]);

  useEffect(() => {
    if (selectedWorkspace) {
      axios
        .get(`${API_HOSTNAME}/reportsApi/getReports`, {
          params: { userEmail, workspaceName: selectedWorkspace },
        })
        .then(response => {
          setReports(response.data.reports);
          setSelectedReport('');
          setReportParams([]);
          setParamValues({});
        })
        .catch(error => console.error('Error fetching reports:', error));
    }
  }, [selectedWorkspace, userEmail]);

  useEffect(() => {
    if (selectedReport) {
      axios
        .get(`${API_HOSTNAME}/reportsApi/getReportParams`, {
          params: { reportName: selectedReport },
        })
        .then(response => {
          setReportParams(response.data.parameters);
          setParamValues({});
        })
        .catch(error => console.error('Error fetching report params:', error));
    }
  }, [selectedReport]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '');
  };

  return (
    <Box>
      {/* Workspace and Report Selection */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Business color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            Workspace & Report Selection
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="workspace-label">Workspace</InputLabel>
              <Select
                labelId="workspace-label"
                value={selectedWorkspace}
                label="Workspace"
                onChange={(e) => setSelectedWorkspace(e.target.value)}
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
            <FormControl fullWidth disabled={!selectedWorkspace}>
              <InputLabel id="report-label">Report</InputLabel>
              <Select
                labelId="report-label"
                value={selectedReport}
                label="Report"
                onChange={(e) => setSelectedReport(e.target.value)}
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
        <Box sx={{ mb: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TuneOutlined color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary">
              Report Parameters
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {(reportParams || []).map((param) => (
              <Grid item xs={12} md={6} key={param}>
                <TextField
                  fullWidth
                  label={param}
                  value={paramValues[param] || ''}
                  onChange={(e) =>
                    setParamValues({ ...paramValues, [param]: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Date Selection */}
      <Box sx={{ mb: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Assessment color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            Close of Business Date
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={isRange ? 6 : 12}>
            <TextField
              fullWidth
              label="COB Date From"
              type="date"
              value={cobDateFrom ? cobDateFrom.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : ''}
              onChange={(e) => setCobDateFrom(formatDate(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {isRange && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="COB Date To"
                type="date"
                value={cobDateTo ? cobDateTo.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : ''}
                onChange={(e) => setCobDateTo(formatDate(e.target.value))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default ParameterForm;