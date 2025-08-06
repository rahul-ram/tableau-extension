/**
 * API Service Layer
 * Centralized API calls using the endpoints configuration
 */

import axios, { AxiosResponse } from 'axios';
import { 
  API_ENDPOINTS, 
  API_PARAMS,
  WorkspacesResponse,
  ReportsResponse,
  ReportParamsResponse,
  StalenessResponse,
  StoreParamsResponse,
  CreateDataSourceResponse,
} from './endpoints';

/**
 * API Service class for all backend communications
 */
export class ApiService {
  /**
   * Get available workspaces
   */
  static async getWorkspaces(): Promise<WorkspacesResponse> {
    const response: AxiosResponse<WorkspacesResponse> = await axios.get(API_ENDPOINTS.WORKSPACES);
    return response.data;
  }

  /**
   * Get reports for a specific workspace
   */
  static async getReports(workspaceName: string): Promise<ReportsResponse> {
    const response: AxiosResponse<ReportsResponse> = await axios.get(
      API_ENDPOINTS.REPORTS,
      { params: API_PARAMS.workspaceParams(workspaceName) }
    );
    return response.data;
  }

  /**
   * Get parameters for a specific report
   */
  static async getReportParams(workspaceName: string, reportName: string): Promise<ReportParamsResponse> {
    const response: AxiosResponse<ReportParamsResponse> = await axios.get(
      API_ENDPOINTS.REPORT_PARAMS,
      { params: API_PARAMS.reportParams(workspaceName, reportName) }
    );
    return response.data;
  }

  /**
   * Check data staleness for a report
   */
  static async checkDataStaleness(
    reportName: string, 
    workspaceName: string, 
    params: object
  ): Promise<StalenessResponse> {
    const response: AxiosResponse<StalenessResponse> = await axios.get(
      API_ENDPOINTS.CHECK_STALENESS,
      { params: API_PARAMS.stalenessParams(reportName, workspaceName, params) }
    );
    return response.data;
  }

  /**
   * Store report parameters
   */
  static async storeReportParams(
    userEmail: string,
    reportName: string,
    params: object
  ): Promise<StoreParamsResponse> {
    const response: AxiosResponse<StoreParamsResponse> = await axios.post(
      `${API_ENDPOINTS.STORE_PARAMS}?userEmail=${userEmail}`,
      { reportName, params }
    );
    return response.data;
  }

  /**
   * Create data source
   */
  static async createDataSource(
    userEmail: string,
    reportName: string
  ): Promise<CreateDataSourceResponse> {
    const response: AxiosResponse<CreateDataSourceResponse> = await axios.post(
      API_ENDPOINTS.CREATE_DATASOURCE,
      { userEmail, reportName }
    );
    return response.data;
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(API_ENDPOINTS.HEALTH);
    return response.data;
  }

  /**
   * Get API information
   */
  static async getApiInfo(): Promise<any> {
    const response = await axios.get(API_ENDPOINTS.ROOT);
    return response.data;
  }
}

/**
 * Error handling wrapper for API calls
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'API call failed'
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return null;
  }
};

/**
 * Batch API calls helper
 */
export const batchApiCalls = async <T>(
  calls: Array<() => Promise<T>>
): Promise<Array<T | null>> => {
  const results = await Promise.allSettled(calls.map(call => call()));
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  );
};

// Export for backward compatibility and direct use
export { API_ENDPOINTS, API_PARAMS };