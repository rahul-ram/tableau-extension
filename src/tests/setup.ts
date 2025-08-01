import '@testing-library/jest-dom';

// Mock Tableau Extensions API
const mockTableau = {
    extensions: {
        initializeAsync: vi.fn(() => Promise.resolve()),
        environment: {
            user: 'test@example.com',
        },
        dashboardContent: {
            dashboard: {
                getDataSourcesAsync: vi.fn(() => Promise.resolve([
                    { name: 'Parameterized_Report_test@example.com_TestReport', refreshAsync: vi.fn(() => Promise.resolve()) }
                ]))
            }
        }
    }
};

// @ts-ignore
global.tableau = mockTableau;

// Mock axios globally
vi.mock('axios', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}));
