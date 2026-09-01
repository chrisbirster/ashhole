import { For } from 'solid-js';
import { api, createApiState } from '../api/client';
import type { ArchiveCard, AwardRow } from '../shared/types';

export default function Archive() {
  const archive = createApiState<ArchiveCard[]>(api.archive, []);
  const awards = createApiState<AwardRow[]>(api.cup, []);

  return (
    <div class="legacy-page center">
      <h1>Latest Results</h1>

      <section class="legacy-section">
        <h1 class="legacy-section-title">Leaderboard</h1>
        <div class="legacy-table-wrap">
          <table class="legacy-table">
            <thead><tr><th>Year</th><th>MIG Award</th><th>Ashhole Cup</th></tr></thead>
            <tbody>
              <For each={awards.value()}>{(row) => (
                <tr><td>{row.year}</td><td>{row.migWinner ?? 'N/A'}</td><td>{row.cupWinner ?? 'N/A'}</td></tr>
              )}</For>
            </tbody>
          </table>
        </div>
      </section>

      <div class="legacy-card-grid">
        <For each={archive.value()}>{(item) => (
          <a href={`/latest-results/${item.year}`} class="legacy-photo-card">
            {item.image && <img src={item.image} alt={`${item.year} ASHHOLE group`} />}
            <div class="legacy-photo-card-title">{item.year}</div>
          </a>
        )}</For>
      </div>
    </div>
  );
}
