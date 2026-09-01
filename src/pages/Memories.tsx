import { For } from 'solid-js';
import { api, createApiState } from '../api/client';
import type { ArchiveCard } from '../shared/types';

export default function Memories() {
  const archive = createApiState<ArchiveCard[]>(api.archive, []);
  return (
    <div class="legacy-page center">
      <div class="legacy-photo-stack">
        <For each={archive.value().filter((item) => item.image)}>{(item) => (
          <>
            <p class="year-label">{item.year}</p>
            <img src={item.image!} alt={`${item.year} ASHHOLE group`} loading="lazy" />
          </>
        )}</For>
      </div>
    </div>
  );
}
