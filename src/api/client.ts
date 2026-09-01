import { createSignal } from 'solid-js';
import type { ArchiveCard, ArchiveYear, AwardRow, EventSummary, MemoryPhoto, PlayerSummary } from '../shared/types';

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export const api = {
  classic: () => json<EventSummary>('/api/classic'),
  cup: () => json<AwardRow[]>('/api/cup'),
  players: () => json<PlayerSummary[]>('/api/players'),
  archive: () => json<ArchiveCard[]>('/api/archive'),
  archiveYear: (year: number) => json<ArchiveYear>(`/api/archive/${year}`),
  memories: async () => {
    const archive = await json<ArchiveCard[]>('/api/archive');
    return archive
      .filter((item) => item.year >= 1996 && item.year <= 2019 && item.image)
      .sort((a, b) => a.year - b.year)
      .map<MemoryPhoto>((item) => ({ year: item.year, src: item.image!, alt: `${item.year} ASHHOLE group` }));
  },
};

export function createApiState<T extends object>(loader: () => Promise<T>, initial: T) {
  const [value, setValue] = createSignal<T>(initial as Exclude<T, Function>);
  const [error, setError] = createSignal<string | null>(null);
  if (typeof window !== 'undefined') {
    void loader()
      .then((next) => setValue(() => next))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Request failed'));
  }
  return { value, error };
}
