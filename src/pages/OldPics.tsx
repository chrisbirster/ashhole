import { For } from 'solid-js';
import { api, createApiState } from '../api/client';

export default function OldPics() {
  const state = createApiState(async () => {
    const years = await Promise.all([api.archiveYear(1990), api.archiveYear(1991)]);
    return { photos: years.flatMap((year) => year.photos) };
  }, { photos: [] as Array<{ src: string; alt: string }> });

  return (
    <div class="legacy-page center">
      <div class="legacy-photo-stack">
        <p class="year-label">Early ASHHOLE 1990-91</p>
        <For each={state.value().photos}>{(photo) => <img src={photo.src} alt={photo.alt || 'Early ASHHOLE 1990-91'} loading="lazy" />}</For>
      </div>
    </div>
  );
}
