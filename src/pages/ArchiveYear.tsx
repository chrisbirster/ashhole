import { For, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import { api, createApiState } from '../api/client';
import type { ArchiveYear as ArchiveYearType } from '../shared/types';

const blank = (year: number): ArchiveYearType => ({
  id: year,
  year,
  title: `${year} ASHHOLE Classic`,
  subtitle: null,
  status: '',
  heroImage: null,
  cupWinner: null,
  migWinner: null,
  rounds: [],
  pairings: [],
  field: [],
  rooms: [],
  photos: [],
});

export default function ArchiveYear() {
  const params = useParams();
  const year = Number(params.year);
  const state = createApiState(() => api.archiveYear(year), blank(year));

  return (
    <div class="legacy-page center">
      <h1>{year} Results</h1>

      <section class="legacy-section">
        <h1 class="legacy-section-title">Tee Times</h1>
        <div class="legacy-table-wrap"><table class="legacy-table"><tbody>
          <For each={state.value().rounds}>{(round) => (
            <tr><td>{round.dayLabel} {round.teeTime} - {round.course}<Show when={round.format}> - {round.format}</Show></td></tr>
          )}</For>
        </tbody></table></div>
      </section>

      <section class="legacy-section">
        <h1 class="legacy-section-title">Ashhole Cup Pairings</h1>
        <div class="legacy-table-wrap"><table class="legacy-table"><tbody>
          <For each={state.value().pairings}>{(pair) => <tr><td>{pair.playerOne}</td><td>{pair.playerTwo ?? ''}</td></tr>}</For>
        </tbody></table></div>
      </section>

      <section class="legacy-section">
        <h1 class="legacy-section-title">Rooms</h1>
        <div class="legacy-table-wrap"><table class="legacy-table"><tbody>
          <For each={state.value().rooms}>{(room) => <tr><td>{room.room}</td><td>{room.occupants}</td></tr>}</For>
        </tbody></table></div>
      </section>

      <section class="legacy-section">
        <h1 class="legacy-section-title">Handicaps</h1>
        <div class="legacy-table-wrap"><table class="legacy-table"><tbody>
          <For each={state.value().field}>{(player) => <tr><td>{player.name}</td><td>{player.handicap ?? ''}</td></tr>}</For>
        </tbody></table></div>
      </section>

      <Show when={state.value().cupWinner || state.value().migWinner}>
        <section class="legacy-section">
          <h1 class="legacy-section-title">Results</h1>
          <div class="legacy-table-wrap"><table class="legacy-table"><tbody>
            <Show when={state.value().migWinner}><tr><td>MIG Award</td><td>{state.value().migWinner}</td></tr></Show>
            <Show when={state.value().cupWinner}><tr><td>Ashhole Cup</td><td>{state.value().cupWinner}</td></tr></Show>
          </tbody></table></div>
        </section>
      </Show>

      <div class="legacy-photo-stack">
        <For each={state.value().photos}>{(photo) => <img src={photo.src} alt={photo.alt} loading="lazy" />}</For>
      </div>
    </div>
  );
}
