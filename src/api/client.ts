import { createSignal } from 'solid-js';
import type { ArchiveCard, ArchiveYear, AwardRow, EventSummary, PlayerSummary } from '../shared/types';

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
};

export function createApiState<T extends object>(loader: () => Promise<T>, initial: T) {
  const [value, setValue] = createSignal<T>(initial);
  const [error, setError] = createSignal<string | null>(null);
  if (typeof window !== 'undefined') {
    void loader().then((next) => setValue(next)).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Request failed'));
  }
  return { value, error };
}
