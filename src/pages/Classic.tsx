import { createMemo, createSignal, For, Show } from 'solid-js';
import { api, createApiState } from '../api/client';
import type { EventSummary, Round } from '../shared/types';

const initial: EventSummary = {
  id: 0,
  year: new Date().getFullYear(),
  title: '',
  subtitle: null,
  status: '',
  heroImage: null,
  cupWinner: null,
  migWinner: null,
  rounds: [],
  pairings: [],
  field: [],
  rooms: [],
};

function dayKey(round: Round) {
  const value = round.dayLabel.toLowerCase();
  if (value.includes('friday')) return 'Friday';
  if (value.includes('saturday')) return 'Saturday';
  if (value.includes('sunday')) return 'Sunday';
  return round.dayLabel;
}

export default function Classic() {
  const state = createApiState(api.classic, initial);
  const [selectedDay, setSelectedDay] = createSignal(0);
  const schedule = createMemo(() => {
    const grouped = new Map<string, Round[]>();
    for (const round of state.value().rounds) {
      const key = dayKey(round);
      grouped.set(key, [...(grouped.get(key) ?? []), round]);
    }
    return [...grouped.entries()];
  });

  return (
    <>
      <div class="legacy-hero-photo">
        <img src="/images/shenvalee-bg.jpg" alt="Shenvalee Golf Resort" />
      </div>

      <main class="legacy-container legacy-home">
        <div class="legacy-hero">
          <img src="/images/ashholelogo.jpg" alt="ashhole logo" />
          <div class="legacy-hero-copy">
            <h1>Welcome to the {state.value().year} Classic</h1>
            <div class="legacy-hero-rule" />
            <p>Annual Shenvalee Hackers Holiday Of Leisurely Exercise</p>
          </div>
          <img src="/images/ashholelogo.jpg" alt="ashhole logo" />
        </div>

        <section class="legacy-schedule">
          <h1 class="legacy-section-title">Schedule</h1>
          <Show when={schedule().length} fallback={<p style="text-align:center">Schedule will be posted here.</p>}>
            <div class="legacy-tabs">
              <For each={schedule()}>{([day], index) => (
                <button class={`legacy-tab${selectedDay() === index() ? ' selected' : ''}`} onClick={() => setSelectedDay(index())}>{day}</button>
              )}</For>
            </div>
            <div class="legacy-tab-panel">
              <ul>
                <For each={schedule()[selectedDay()]?.[1] ?? []}>{(round) => (
                  <li>
                    <strong>{round.course} {round.teeTime}</strong>
                    <Show when={round.format}><span> — {round.format}</span></Show>
                  </li>
                )}</For>
              </ul>
            </div>
          </Show>
        </section>

        <section class="legacy-section">
          <h1 class="legacy-section-title">Handicaps</h1>
          <div class="legacy-table-wrap">
            <table class="legacy-table">
              <tbody>
                <For each={state.value().field}>{(player) => (
                  <tr><td>{player.name}</td><td>{player.handicap ?? ''}</td></tr>
                )}</For>
              </tbody>
            </table>
          </div>
        </section>

        <section class="legacy-section">
          <h1 class="legacy-section-title">Ashhole Cup Pairings</h1>
          <div class="legacy-table-wrap">
            <table class="legacy-table">
              <tbody>
                <For each={state.value().pairings}>{(pair) => (
                  <tr><td>{pair.playerOne}</td><td>{pair.playerTwo ?? ''}</td></tr>
                )}</For>
              </tbody>
            </table>
          </div>
        </section>

        <section class="legacy-section">
          <h1 class="legacy-section-title">Room Assignments</h1>
          <div class="legacy-table-wrap">
            <table class="legacy-table">
              <tbody>
                <For each={state.value().rooms}>{(room) => (
                  <tr><td>{room.room}</td><td>{room.occupants}</td></tr>
                )}</For>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
