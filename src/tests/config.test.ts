import { describe, it, expect, beforeEach } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    // Clear any existing environment variables
    delete (import.meta.env as any).VITE_API_HOSTNAME;
  });

  it('uses default hostname when no environment variable is set', async () => {
    const { API_HOSTNAME } = await import('../config');
    expect(API_HOSTNAME).toBe('http://localhost:4173');
  });

  it('uses environment variable when provided', async () => {
    // Mock the environment variable
    (import.meta.env as any).VITE_API_HOSTNAME = 'https://api.example.com';

    // Re-import to get the updated value
    const configModule = await import('../config?t=' + Date.now());
    expect(configModule.API_HOSTNAME).toBe('https://api.example.com');
  });
});