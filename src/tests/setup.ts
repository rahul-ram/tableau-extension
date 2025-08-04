import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// Mock ResizeObserver for Material UI
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.matchMedia for Material UI
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
