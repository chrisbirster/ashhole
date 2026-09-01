import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockJson(value: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('public API client', () => {
  it('loads the current Classic from the API', async () => {
    const fetchMock = mockJson({ year: 2026 });
    await api.classic();
    expect(fetchMock).toHaveBeenCalledWith('/api/classic', undefined);
  });

  it('loads a historical result year from the generic archive endpoint', async () => {
    const fetchMock = mockJson({ year: 2024, photos: [] });
    await api.archiveYear(2024);
    expect(fetchMock).toHaveBeenCalledWith('/api/archive/2024', undefined);
  });

  it('loads leaderboard data from the API rather than a compiled fallback array', async () => {
    const fetchMock = mockJson([]);
    expect(await api.cup()).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith('/api/cup', undefined);
  });
});
