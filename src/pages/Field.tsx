import { For } from 'solid-js';
import { api, createApiState } from '../api/client';
import type { PlayerSummary } from '../shared/types';

const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, index) => 1990 + index);

export default function Field() {
  const state = createApiState<PlayerSummary[]>(api.players, []);

  return (
    <div class="legacy-page center">
      <h1>Players</h1>
      <div class="legacy-player-grid">
        <For each={state.value()}>{(player) => (
          <section class="legacy-player-card">
            <div class="legacy-player-head">
              <h2>{player.name}</h2>
              <p class="legacy-player-status">{player.tier}</p>
            </div>
            <div style="text-align:left">
              <span style="font-weight:500">Years Active:</span>
              <div class="legacy-years">
                <For each={years}>{(year) => (
                  <div class="legacy-year">
                    <div>{year}</div>
                    <div class={`legacy-year-dot${player.years.includes(year) ? ' active' : ''}`} />
                  </div>
                )}</For>
              </div>
            </div>
          </section>
        )}</For>
      </div>
    </div>
  );
}
