import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { Refresh, RestartAlt } from '@mui/icons-material';
import { createTableauTheme } from './theme/tableauTheme';
import ParameterForm from './components/ParameterForm';
import StalenessIndicator from './components/StalenessIndicator';
import type { ReportStatus, ReportParameter } from './types';
import { ApiService, withErrorHandling } from './api/apiService';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportParams, setReportParams] = useState<ReportParameter[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, string | number>>({});
  const [isRange, setIsRange] = useState<boolean>(false);
  const [cobDateFrom, setCobDateFrom] = useState<string>('');
  const [cobDateTo, setCobDateTo] = useState<string>('');
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const theme = createTableauTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    if (selectedReport && selectedWorkspace) {
      const params = { ...paramValues, cobDate: isRange ? `${cobDateFrom}:${cobDateTo}` : cobDateFrom };
      const result = await withErrorHandling(
        () => ApiService.checkDataStaleness(selectedReport, selectedWorkspace, params),
        'Error checking staleness'
      );
      
      if (result) {
        setReportStatus(result);
      } else {
        setError('Failed to check data staleness');
      }
    }
  };

  // Check if all required parameters are filled
  const isFormValid = () => {
    const hasRequiredSelections = selectedWorkspace && selectedReport;

    // Check if all non-date parameters are filled
    const nonDateParams = reportParams.filter(param =>
      param.param_name !== 'cobdate' &&
      param.param_name !== 'cobdate_from' &&
      param.param_name !== 'cobdate_to'
    );
    const hasAllParams = nonDateParams.length === 0 || nonDateParams.every(param => {
      const value = paramValues[param.param_name];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });

    // Check date parameters
    let hasValidDates = true;
    if (reportParams.some(param => param.param_name === 'cobdate')) {
      hasValidDates = !!cobDateFrom;
    } else if (reportParams.some(param => param.param_name === 'cobdate_from')) {
      hasValidDates = !!(cobDateFrom && cobDateTo);
    }

    return hasRequiredSelections && hasAllParams && hasValidDates;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = { ...paramValues, cobDate: isRange ? `${cobDateFrom}:${cobDateTo}` : cobDateFrom };
      
      // Store parameters and create data source
      const [storeResult, dataSourceResult] = await Promise.all([
        withErrorHandling(
          () => ApiService.storeReportParams(userEmail, selectedReport, params),
          'Error storing parameters'
        ),
        withErrorHandling(
          () => ApiService.createDataSource(userEmail, selectedReport),
          'Error creating data source'
        )
      ]);
      
      if (!storeResult || !dataSourceResult) {
        setError('Failed to submit parameters');
        return;
      }
      
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
          padding: isMobile ? 1 : 2,
          position: 'relative',
        }}
      >
        <Container maxWidth={isMobile ? "sm" : "md"} disableGutters={isMobile}>
          <Paper
            elevation={3}
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              margin: isMobile ? 1 : 0,
              position: 'relative',
            }}
          >
            <StalenessIndicator status={reportStatus} checkStaleness={checkStaleness} />
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="h1"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Parameterized Report Extension
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dynamic parameter selection and report refresh
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, fontSize: '0.75rem' }}
                onClose={() => setError('')}
              >
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

            <Box sx={{
              mt: 2,
              display: 'flex',
              gap: isMobile ? 1 : 2,
              justifyContent: 'flex-end',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<RestartAlt />}
                disabled={isLoading}
                size="small"
                fullWidth={isMobile}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Refresh />}
                disabled={isLoading || !isFormValid()}
                size="small"
                fullWidth={isMobile}
                sx={{ minWidth: isMobile ? 'auto' : 120 }}
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