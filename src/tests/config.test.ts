import { describe, it, expect, beforeEach } from 'vitest';

describe('config', () => {
  it('uses default hostname when no environment variable is set', async () => {
    const { API_HOSTNAME } = await import('../config');
    expect(API_HOSTNAME).toBe('http://localhost:4173');
  });

  it('validates API hostname format', async () => {
    const { API_HOSTNAME } = await import('../config');
    expect(API_HOSTNAME).toMatch(/^https?:\/\/[a-zA-Z0-9.-]+:[0-9]+$/);
  });
});