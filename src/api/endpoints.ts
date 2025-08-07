/**
 * API Endpoints Configuration
 * Centralized location for all API endpoint definitions
 */

import { API_HOSTNAME } from '../config';

// Base API paths
const BASE_PATHS = {
  REPORTS: '/reports',
} as const;

// Endpoint builders
const buildEndpoint = (path: string) => `${API_HOSTNAME}${path}`;

/**
 * All API endpoints used by the application
 */
export const API_ENDPOINTS = {
  // Workspace endpoints
  WORKSPACES: buildEndpoint(`${BASE_PATHS.REPORTS}/workspaces`),

  // Report endpoints
  REPORTS: buildEndpoint(`${BASE_PATHS.REPORTS}/getReports`),
  REPORT_PARAMS: buildEndpoint(`${BASE_PATHS.REPORTS}/getReportParams`),

  // Data management endpoints
  CHECK_STALENESS: buildEndpoint(`${BASE_PATHS.REPORTS}/checkDataStaleness`),
  STORE_PARAMS: buildEndpoint(`${BASE_PATHS.REPORTS}/storeReportParams`),
  CREATE_DATASOURCE: buildEndpoint(`${BASE_PATHS.REPORTS}/createDataSource`),

  // Health and info endpoints
  ROOT: buildEndpoint('/'),
  HEALTH: buildEndpoint('/health'),
} as const;

/**
 * API parameter builders for consistent parameter naming
 */
export const API_PARAMS = {
  // Workspace parameters
  workspaceParams: (workspaceName: string) => ({
    workspace_name: workspaceName,
  }),

  // Report parameters
  reportParams: (workspaceName: string, reportName: string) => ({
    workspace_name: workspaceName,
    report_name: reportName,
  }),

  // Staleness check parameters
  stalenessParams: (reportName: string, workspaceName: string, params: object) => ({
    currentTimestamp: new Date().toISOString(),
    report_name: reportName,
    workspace_name: workspaceName,
    params: JSON.stringify(params),
  }),

  // User email parameter
  userEmailParams: (userEmail: string) => ({
    userEmail,
  }),
} as const;

/**
 * Type definitions for API responses
 */
export interface WorkspacesResponse {
  workspaces: string[];
}

export interface ReportsResponse {
  reports: string[];
}

export interface ReportParamsResponse {
  parameters: Array<{
    param_name: string;
    data_type: 'string' | 'number' | 'float' | 'date';
  }>;
}

export interface StalenessResponse {
  timestamp: string;
  isStale: boolean;
}

export interface StoreParamsResponse {
  message: string;
  userEmail: string;
  reportName: string;
  paramCount: number;
}

export interface CreateDataSourceResponse {
  message: string;
  dataSourceName: string;
  userEmail: string;
  reportName: string;
  status: string;
}

/**
 * Helper function to add new endpoints easily
 */
export const addCustomEndpoint = (path: string): string => {
  // Ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return buildEndpoint(normalizedPath);
};

/**
 * Development helper to log all endpoints
 */
export const logAllEndpoints = (): void => {
  if (import.meta.env.DEV) {
    console.log('📡 Available API Endpoints:', API_ENDPOINTS);
  }
};

// Export types for external use
export type EndpointKey = keyof typeof API_ENDPOINTS;
export type EndpointValue = typeof API_ENDPOINTS[EndpointKey];