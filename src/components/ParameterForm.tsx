import React, { useEffect, useState } from 'react';
import { TextField, DropdownSelect } from '@tableau/tableau-ui';
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
    <div className="parameter-form">
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>Workspace</label>
        <DropdownSelect
          value={selectedWorkspace}
          onChange={e => setSelectedWorkspace(e.target.value)}
          label="Workspace"
          style={{ backgroundColor: '#8cb3d9', width: '100%' }}
        >
          <option value="">Select a workspace</option>
          {workspaces.map(ws => (
            <option key={ws} value={ws}>{ws}</option>
          ))}
        </DropdownSelect>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>Report</label>
        <DropdownSelect
          value={selectedReport}
          onChange={e => setSelectedReport(e.target.value)}
          label="Report"
          style={{ backgroundColor: '#8cb3d9', width: '100%' }}
        >
          <option value="">Select a report</option>
          {reports.map(report => (
            <option key={report} value={report}>{report}</option>
          ))}
        </DropdownSelect>
      </div>

      {reportParams.map(param => (
        <div key={param} style={{ marginBottom: '1rem' }}>
          <TextField
            label={param}
            value={paramValues[param] || ''}
            onChange={e => setParamValues({ ...paramValues, [param]: e.target.value })}
            style={{ backgroundColor: '#8cb3d9', width: '100%' }}
          />
        </div>
      ))}

      <div style={{ marginBottom: '1rem' }}>
        <TextField
          label="COB Date From"
          type="date"
          value={cobDateFrom}
          onChange={e => setCobDateFrom(formatDate(e.target.value))}
          style={{ backgroundColor: '#8cb3d9', width: '100%' }}
        />
      </div>

      {isRange && (
        <div style={{ marginBottom: '1rem' }}>
          <TextField
            label="COB Date To"
            type="date"
            value={cobDateTo}
            onChange={e => setCobDateTo(formatDate(e.target.value))}
            style={{ backgroundColor: '#8cb3d9', width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default ParameterForm;