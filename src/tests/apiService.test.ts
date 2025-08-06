import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ApiService, withErrorHandling, batchApiCalls } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

// Mock axios
vi.mock('axios');
const mockAxios = axios as any;

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorkspaces', () => {
    it('should fetch workspaces successfully', async () => {
      const mockResponse = { data: { workspaces: ['WS_HS1', 'WS_PVT', 'WS_OFFICIAL'] } };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.getWorkspaces();

      expect(mockAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.WORKSPACES);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when fetching workspaces', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiService.getWorkspaces()).rejects.toThrow('Network error');
    });
  });

  describe('getReports', () => {
    it('should fetch reports for a workspace successfully', async () => {
      const mockResponse = { data: { reports: ['report1', 'report2', 'report3'] } };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.getReports('WS_HS1');

      expect(mockAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.REPORTS, {
        params: { workspace_name: 'WS_HS1' }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when fetching reports', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('API error'));

      await expect(ApiService.getReports('WS_HS1')).rejects.toThrow('API error');
    });
  });

  describe('getReportParams', () => {
    it('should fetch report parameters successfully', async () => {
      const mockResponse = {
        data: {
          parameters: [
            { param_name: 'snap_type', data_type: 'string' },
            { param_name: 'riskclass', data_type: 'string' },
          ]
        }
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.getReportParams('WS_HS1', 'report1');

      expect(mockAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.REPORT_PARAMS, {
        params: { workspace_name: 'WS_HS1', report_name: 'report1' }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors when fetching report parameters', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(ApiService.getReportParams('WS_HS1', 'report1')).rejects.toThrow('Not found');
    });
  });

  describe('checkDataStaleness', () => {
    it('should check data staleness successfully', async () => {
      const mockResponse = {
        data: { timestamp: '2023-10-01T00:00:00Z', isStale: false }
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const params = { snap_type: 'EOD', riskclass: 'EQUITY' };
      const result = await ApiService.checkDataStaleness('report1', 'WS_HS1', params);

      expect(mockAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.CHECK_STALENESS, {
        params: expect.objectContaining({
          report_name: 'report1',
          workspace_name: 'WS_HS1',
          params: JSON.stringify(params)
        })
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('storeReportParams', () => {
    it('should store report parameters successfully', async () => {
      const mockResponse = {
        data: { message: 'Parameters stored successfully', paramCount: 2 }
      };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const params = { snap_type: 'EOD', riskclass: 'EQUITY' };
      const result = await ApiService.storeReportParams('user@test.com', 'report1', params);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${API_ENDPOINTS.STORE_PARAMS}?userEmail=user@test.com`,
        { reportName: 'report1', params }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createDataSource', () => {
    it('should create data source successfully', async () => {
      const mockResponse = {
        data: { message: 'Data source created successfully', status: 'ready' }
      };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.createDataSource('user@test.com', 'report1');

      expect(mockAxios.post).toHaveBeenCalledWith(API_ENDPOINTS.CREATE_DATASOURCE, {
        userEmail: 'user@test.com',
        reportName: 'report1'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      const mockResponse = {
        data: { status: 'healthy', timestamp: '2023-10-01T00:00:00Z' }
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.healthCheck();

      expect(mockAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.HEALTH);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getApiInfo', () => {
    it('should get API information successfully', async () => {
      const mockResponse = {
        data: { message: 'Tableau Extension API', version: '1.0.0' }
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.getApiInfo();

      expect(mockAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.ROOT);
      expect(result).toEqual(mockResponse.data);
    });
  });
});

describe('withErrorHandling', () => {
  it('should return result when API call succeeds', async () => {
    const mockApiCall = vi.fn().mockResolvedValueOnce('success');

    const result = await withErrorHandling(mockApiCall, 'Custom error message');

    expect(result).toBe('success');
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it('should return null and log error when API call fails', async () => {
    const mockApiCall = vi.fn().mockRejectedValueOnce(new Error('API failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await withErrorHandling(mockApiCall, 'Custom error message');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Custom error message:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should use default error message when none provided', async () => {
    const mockApiCall = vi.fn().mockRejectedValueOnce(new Error('API failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await withErrorHandling(mockApiCall);

    expect(consoleSpy).toHaveBeenCalledWith('API call failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});

describe('batchApiCalls', () => {
  it('should handle multiple successful API calls', async () => {
    const call1 = vi.fn().mockResolvedValueOnce('result1');
    const call2 = vi.fn().mockResolvedValueOnce('result2');
    const call3 = vi.fn().mockResolvedValueOnce('result3');

    const results = await batchApiCalls([call1, call2, call3]);

    expect(results).toEqual(['result1', 'result2', 'result3']);
    expect(call1).toHaveBeenCalledTimes(1);
    expect(call2).toHaveBeenCalledTimes(1);
    expect(call3).toHaveBeenCalledTimes(1);
  });

  it('should handle mixed success and failure cases', async () => {
    const call1 = vi.fn().mockResolvedValueOnce('result1');
    const call2 = vi.fn().mockRejectedValueOnce(new Error('Failed'));
    const call3 = vi.fn().mockResolvedValueOnce('result3');

    const results = await batchApiCalls([call1, call2, call3]);

    expect(results).toEqual(['result1', null, 'result3']);
  });

  it('should handle empty array of calls', async () => {
    const results = await batchApiCalls([]);

    expect(results).toEqual([]);
  });
});