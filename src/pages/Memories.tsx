import { For } from 'solid-js';
import { api, createApiState } from '../api/client';
import type { MemoryPhoto } from '../shared/types';

export default function Memories() {
  const state = createApiState<MemoryPhoto[]>(api.memories, []);
  return (
    <div class="legacy-page center">
      <div class="legacy-photo-stack">
        <For each={state.value()}>{(photo) => (
          <>
            <p class="year-label">{photo.year}</p>
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </>
        )}</For>
      </div>
    </div>
  );
}
