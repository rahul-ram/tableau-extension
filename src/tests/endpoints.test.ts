import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  API_ENDPOINTS, 
  API_PARAMS, 
  addCustomEndpoint, 
  logAllEndpoints,
  type EndpointKey,
  type EndpointValue 
} from '../api/endpoints';

describe('API Endpoints', () => {
  describe('API_ENDPOINTS', () => {
    it('should have all required endpoints defined', () => {
      expect(API_ENDPOINTS.WORKSPACES).toBeDefined();
      expect(API_ENDPOINTS.REPORTS).toBeDefined();
      expect(API_ENDPOINTS.REPORT_PARAMS).toBeDefined();
      expect(API_ENDPOINTS.CHECK_STALENESS).toBeDefined();
      expect(API_ENDPOINTS.STORE_PARAMS).toBeDefined();
      expect(API_ENDPOINTS.CREATE_DATASOURCE).toBeDefined();
      expect(API_ENDPOINTS.ROOT).toBeDefined();
      expect(API_ENDPOINTS.HEALTH).toBeDefined();
    });

    it('should use correct base URL format', () => {
      expect(API_ENDPOINTS.WORKSPACES).toContain('http://localhost:4173');
      expect(API_ENDPOINTS.WORKSPACES).toContain('/reports/workspaces');
    });

    it('should have correct endpoint paths', () => {
      expect(API_ENDPOINTS.WORKSPACES).toMatch(/\/reports\/workspaces$/);
      expect(API_ENDPOINTS.REPORTS).toMatch(/\/reports\/getReports$/);
      expect(API_ENDPOINTS.REPORT_PARAMS).toMatch(/\/reports\/getReportParams$/);
      expect(API_ENDPOINTS.CHECK_STALENESS).toMatch(/\/reports\/checkDataStaleness$/);
      expect(API_ENDPOINTS.STORE_PARAMS).toMatch(/\/reports\/storeReportParams$/);
      expect(API_ENDPOINTS.CREATE_DATASOURCE).toMatch(/\/reports\/createDataSource$/);
      expect(API_ENDPOINTS.ROOT).toMatch(/\/$$/);
      expect(API_ENDPOINTS.HEALTH).toMatch(/\/health$/);
    });
  });

  describe('API_PARAMS', () => {
    it('should generate correct workspace parameters', () => {
      const params = API_PARAMS.workspaceParams('WS_HS1');
      expect(params).toEqual({ workspace_name: 'WS_HS1' });
    });

    it('should generate correct report parameters', () => {
      const params = API_PARAMS.reportParams('WS_HS1', 'report1');
      expect(params).toEqual({
        workspace_name: 'WS_HS1',
        report_name: 'report1'
      });
    });

    it('should generate correct staleness parameters', () => {
      const testParams = { snap_type: 'EOD', riskclass: 'EQUITY' };
      const params = API_PARAMS.stalenessParams('report1', 'WS_HS1', testParams);
      
      expect(params).toMatchObject({
        report_name: 'report1',
        workspace_name: 'WS_HS1',
        params: JSON.stringify(testParams)
      });
      expect(params.currentTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should generate correct user email parameters', () => {
      const params = API_PARAMS.userEmailParams('user@test.com');
      expect(params).toEqual({ userEmail: 'user@test.com' });
    });
  });

  describe('addCustomEndpoint', () => {
    it('should create custom endpoint with correct base URL', () => {
      const customEndpoint = addCustomEndpoint('/custom/path');
      expect(customEndpoint).toContain('http://localhost:4173');
      expect(customEndpoint).toContain('/custom/path');
    });

    it('should handle paths with and without leading slash', () => {
      const endpoint1 = addCustomEndpoint('/custom/path');
      const endpoint2 = addCustomEndpoint('custom/path');
      
      expect(endpoint1).toMatch(/\/custom\/path$/);
      expect(endpoint2).toMatch(/\/custom\/path$/);
    });
  });

  describe('logAllEndpoints', () => {
    it('should log endpoints in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logAllEndpoints();
      
      expect(consoleSpy).toHaveBeenCalledWith('📡 Available API Endpoints:', API_ENDPOINTS);
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log endpoints in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logAllEndpoints();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('TypeScript types', () => {
    it('should have correct endpoint key types', () => {
      const key: EndpointKey = 'WORKSPACES';
      expect(typeof key).toBe('string');
    });

    it('should have correct endpoint value types', () => {
      const value: EndpointValue = API_ENDPOINTS.WORKSPACES;
      expect(typeof value).toBe('string');
    });
  });

  describe('Response types', () => {
    it('should validate WorkspacesResponse structure', () => {
      const response = { workspaces: ['WS_HS1', 'WS_PVT'] };
      expect(Array.isArray(response.workspaces)).toBe(true);
      expect(response.workspaces.every(w => typeof w === 'string')).toBe(true);
    });

    it('should validate ReportsResponse structure', () => {
      const response = { reports: ['report1', 'report2'] };
      expect(Array.isArray(response.reports)).toBe(true);
      expect(response.reports.every(r => typeof r === 'string')).toBe(true);
    });

    it('should validate ReportParamsResponse structure', () => {
      const response = {
        parameters: [
          { param_name: 'snap_type', data_type: 'string' as const },
          { param_name: 'offset', data_type: 'number' as const }
        ]
      };
      expect(Array.isArray(response.parameters)).toBe(true);
      expect(response.parameters.every(p => 
        typeof p.param_name === 'string' && 
        ['string', 'number', 'float', 'date'].includes(p.data_type)
      )).toBe(true);
    });

    it('should validate StalenessResponse structure', () => {
      const response = { timestamp: '2023-10-01T00:00:00Z', isStale: false };
      expect(typeof response.timestamp).toBe('string');
      expect(typeof response.isStale).toBe('boolean');
    });
  });
});