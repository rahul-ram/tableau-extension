import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Paper,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Alert,
} from '@mui/material';
import { Refresh, RestartAlt } from '@mui/icons-material';
import axios from 'axios';
import { createTableauTheme } from './theme/tableauTheme';
import ParameterForm from './components/ParameterForm';
import StalenessIndicator from './components/StalenessIndicator';
import type { ReportStatus } from './types';
import { API_HOSTNAME } from './config';

const theme = createTableauTheme();

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportParams, setReportParams] = useState<string[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [isRange, setIsRange] = useState<boolean>(false);
  const [cobDateFrom, setCobDateFrom] = useState<string>('');
  const [cobDateTo, setCobDateTo] = useState<string>('');
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if tableau object exists (running in Tableau vs browser)
    if (typeof tableau !== 'undefined' && tableau.extensions) {
      tableau.extensions.initializeAsync().then(() => {
        console.log('Tableau extension initialized');
        setUserEmail((tableau.extensions.environment as any).user);
      }).catch(error => {
        console.error('Error initializing Tableau:', error);
        setError('Failed to initialize Tableau extension');
      });
    } else {
      // Development mode - use mock data
      console.log('Running in development mode - using mock user email');
      setUserEmail('dev.user@example.com');
    }
  }, []);

  const resetForm = () => {
    setSelectedWorkspace('');
    setSelectedReport('');
    setReportParams([]);
    setParamValues({});
    setIsRange(false);
    setCobDateFrom('');
    setCobDateTo('');
    setReportStatus(null);
    setError('');
  };

  const checkStaleness = async () => {
    if (selectedReport && userEmail) {
      try {
        const params = { ...paramValues, cobDate: isRange ? `${cobDateFrom}:${cobDateTo}` : cobDateFrom };
        const response = await axios.get(`${API_HOSTNAME}/reportsApi/checkDataStaleness`, {
          params: {
            currentTimestamp: new Date().toISOString(),
            reportName: selectedReport,
            workspaceName: selectedWorkspace,
            params: JSON.stringify(params),
          },
        });
        setReportStatus(response.data);
      } catch (error) {
        console.error('Error checking staleness:', error);
        setError('Failed to check data staleness');
      }
    }
  };

  // Check if all required parameters are filled
  const isFormValid = () => {
    const hasRequiredSelections = selectedWorkspace && selectedReport && cobDateFrom;
    const hasAllParams = reportParams.length === 0 || reportParams.every(param => paramValues[param]?.trim());
    const hasDateRange = !isRange || (isRange && cobDateTo);
    return hasRequiredSelections && hasAllParams && hasDateRange;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { ...paramValues, cobDate: isRange ? `${cobDateFrom}:${cobDateTo}` : cobDateFrom };
      await axios.post(`${API_HOSTNAME}/reportsApi/storeReportParams?userEmail=${userEmail}`, {
        reportName: selectedReport,
        params,
      });
      await axios.post(`${API_HOSTNAME}/reportsApi/createDataSource`, {
        userEmail,
        reportName: selectedReport,
      });
      // Refresh data sources if running in Tableau
      if (typeof tableau !== 'undefined' && tableau.extensions) {
        const dataSources = await (tableau.extensions.dashboardContent as any).dashboard.getDataSourcesAsync();
        const promises = dataSources
          .filter((ds: any) => ds.name === `Parameterized_Report_${userEmail}_${selectedReport}`)
          .map((ds: any) => ds.refreshAsync());
        await Promise.all(promises);
      } else {
        console.log('Development mode - data source refresh skipped');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setError('Failed to submit parameters');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003366 0%, #1f77b4 100%)',
          minHeight: '100vh',
          padding: 2,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary">
                Parameterized Report Extension
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dynamic parameter selection and report refresh with real-time monitoring
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <ParameterForm
              userEmail={userEmail}
              selectedWorkspace={selectedWorkspace}
              setSelectedWorkspace={setSelectedWorkspace}
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
              reportParams={reportParams}
              setReportParams={setReportParams}
              paramValues={paramValues}
              setParamValues={setParamValues}
              isRange={isRange}
              setIsRange={setIsRange}
              cobDateFrom={cobDateFrom}
              setCobDateFrom={setCobDateFrom}
              cobDateTo={cobDateTo}
              setCobDateTo={setCobDateTo}
            />

            <Box sx={{ mt: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRange}
                    onChange={(e) => setIsRange(e.target.checked)}
                    color="primary"
                  />
                }
                label="COB Range"
              />
            </Box>

            <StalenessIndicator status={reportStatus} checkStaleness={checkStaleness} />

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<RestartAlt />}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Refresh />}
                disabled={isLoading || !isFormValid()}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;