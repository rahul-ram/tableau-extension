import React, { useState, useEffect } from 'react';
import { Button } from '@tableau/tableau-ui';
import axios from 'axios';
import ParameterForm from './components/ParameterForm';
import StalenessIndicator from './components/StalenessIndicator';
import type { ReportStatus } from './types';
import { API_HOSTNAME } from './config';

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

  useEffect(() => {
    // Check if tableau object exists (running in Tableau vs browser)
    if (typeof tableau !== 'undefined' && tableau.extensions) {
      tableau.extensions.initializeAsync().then(() => {
        console.log('Tableau extension initialized');
        setUserEmail((tableau.extensions.environment as any).user);
      }).catch(error => console.error('Error initializing Tableau:', error));
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
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#003366', padding: '2rem', color: 'white' }}>
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
      <div style={{ marginTop: '1rem' }}>
        <input
          type="checkbox"
          id="range-checkbox"
          checked={isRange}
          onChange={e => setIsRange(e.target.checked)}
        />
        <label htmlFor="range-checkbox" style={{ color: 'white', marginLeft: '0.5rem' }}>
          Use COB Date Range
        </label>
      </div>
      <StalenessIndicator status={reportStatus} checkStaleness={checkStaleness} />
      <div style={{ marginTop: '2rem' }}>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (reportStatus ? !reportStatus.isStale : false)}
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </Button>
        <Button
          onClick={resetForm}
          style={{ marginLeft: '1rem' }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default App;