import { For, Show, createSignal } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import type { AdminEventDraft, EventPlayerRow, PairingRow, RoomAssignmentRow, Visibility } from '../shared/types';
import { s } from '../styles/site.stylex';

type EditableRound = AdminEventDraft['rounds'][number];

const currentYear = new Date().getFullYear();

function emptyDraft(year: number): AdminEventDraft {
  return {
    year,
    title: `${year} ASHHOLE Classic`,
    subtitle: '',
    status: 'Planning',
    visibility: 'admin',
    heroImage: null,
    cupWinner: null,
    migWinner: null,
    rounds: [],
    pairings: [],
    field: [],
    rooms: [],
    isCurrent: false,
  };
}

export default function Admin() {
  const [token, setToken] = createSignal(localStorage.getItem('ashhole-admin-token') || '');
  const [year, setYear] = createSignal(currentYear);
  const [draft, setDraft] = createSignal<AdminEventDraft>(emptyDraft(currentYear));
  const [message, setMessage] = createSignal('Enter the admin token, then load 2025 or 2026.');
  const [busy, setBusy] = createSignal(false);

  function headers() {
    localStorage.setItem('ashhole-admin-token', token());
    return { 'content-type': 'application/json', authorization: `Bearer ${token()}` };
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, { ...init, headers: { ...headers(), ...(init?.headers || {}) } });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText}${text ? ` — ${text}` : ''}`);
    }
    return response.json() as Promise<T>;
  }

  async function loadYear(target = year()) {
    setBusy(true);
    setMessage(`Loading ${target}…`);
    try {
      const data = await request<AdminEventDraft>(`/api/admin/events/${target}`);
      setYear(target);
      setDraft(data);
      setMessage(data.isCurrent ? `${target} loaded. This is the current front-page Classic.` : `${target} loaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load year.');
    } finally {
      setBusy(false);
    }
  }

  async function copyPreviousYear() {
    const target = year();
    const sourceYear = target - 1;
    setBusy(true);
    setMessage(`Copying the reusable ${sourceYear} setup into ${target}…`);
    try {
      const source = await request<AdminEventDraft>(`/api/admin/events/${sourceYear}`);
      setDraft({
        ...source,
        year: target,
        title: `${target} ASHHOLE Classic`,
        status: 'Planning',
        visibility: 'admin',
        cupWinner: null,
        migWinner: null,
        pairings: [],
        field: source.field.map((player) => ({ ...player })),
        rounds: source.rounds.map((round) => ({ ...round })),
        rooms: source.rooms.map((room) => ({ ...room })),
        isCurrent: false,
      });
      setMessage(`Copied rounds, field, and rooms from ${sourceYear}. Cup pairings and award winners were intentionally cleared.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to copy previous year.');
    } finally {
      setBusy(false);
    }
  }

  async function save(makeCurrent: boolean) {
    setBusy(true);
    setMessage(makeCurrent ? `Saving ${year()} and publishing it to the front page…` : `Saving ${year()}…`);
    try {
      const value = draft();
      await request(`/api/admin/events/${year()}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: value.title,
          subtitle: value.subtitle || null,
          status: value.status,
          heroImage: value.heroImage || null,
          visibility: makeCurrent ? 'public' : value.visibility,
          cupWinner: value.cupWinner || null,
          migWinner: value.migWinner || null,
          rounds: value.rounds,
          pairings: value.pairings,
          field: value.field,
          rooms: value.rooms,
          makeCurrent,
        }),
      });
      await loadYear(year());
      setMessage(makeCurrent ? `${year()} saved and is now the live front-page Classic.` : `${year()} saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  function updateRound(index: number, patch: Partial<EditableRound>) {
    setDraft((value) => ({ ...value, rounds: value.rounds.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  function updatePairing(index: number, patch: Partial<PairingRow>) {
    setDraft((value) => ({ ...value, pairings: value.pairings.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  function updatePlayer(index: number, patch: Partial<EventPlayerRow>) {
    setDraft((value) => ({ ...value, field: value.field.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  function updateRoom(index: number, patch: Partial<RoomAssignmentRow>) {
    setDraft((value) => ({ ...value, rooms: value.rooms.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  return <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}>
    <div {...stylex.attrs(s.eyebrow)}>Protected workspace</div>
    <h1 {...stylex.attrs(s.darkTitle)} style="text-align:left">CLASSIC ADMIN</h1>
    <p {...stylex.attrs(s.darkLead)} style="text-align:left;margin-left:0;max-width:820px">One screen owns a whole ASHHOLE year. Finish 2025 here, then load 2026 and publish it when the new schedule, field, handicaps, Cup pairings, and room assignments are ready.</p>

    <div {...stylex.attrs(s.notice)}>
      There is no member area. The public Classic contains the schedule, field/handicaps, Cup pairings, room assignments, and published awards. Only this admin workspace is protected.
    </div>

    <div style="display:grid;grid-template-columns:minmax(220px,1fr) minmax(160px,.45fr);gap:12px;max-width:760px;align-items:end">
      <label {...stylex.attrs(s.label)}>Admin token<input {...stylex.attrs(s.input)} type="password" value={token()} onInput={(e) => setToken(e.currentTarget.value)} /></label>
      <label {...stylex.attrs(s.label)}>Year<input {...stylex.attrs(s.input)} type="number" min="1990" max="2200" value={year()} onInput={(e) => setYear(Number(e.currentTarget.value))} /></label>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 34px">
      <button {...stylex.attrs(s.button)} type="button" disabled={busy()} onClick={() => void loadYear()}>Load year</button>
      <button {...stylex.attrs(s.button)} type="button" disabled={busy()} onClick={() => { setYear(2025); void loadYear(2025); }}>2025</button>
      <button {...stylex.attrs(s.button)} type="button" disabled={busy()} onClick={() => { setYear(2026); void loadYear(2026); }}>2026</button>
      <button {...stylex.attrs(s.button)} type="button" disabled={busy()} onClick={() => void copyPreviousYear()}>Copy previous year setup</button>
    </div>

    <p style="min-height:24px;color:#d8d9c1;margin-bottom:28px">{message()}</p>

    <div style="display:grid;gap:34px">
      <section {...stylex.attrs(s.card)}>
        <div {...stylex.attrs(s.goldLabel)}>01 · Year identity</div>
        <h2 {...stylex.attrs(s.roundTitle)}>Classic details</h2>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-top:18px">
          <label style="display:grid;gap:6px">Title<input {...stylex.attrs(s.input)} value={draft().title} onInput={(e) => setDraft((v) => ({ ...v, title: e.currentTarget.value }))} /></label>
          <label style="display:grid;gap:6px">Status<input {...stylex.attrs(s.input)} value={draft().status} placeholder="Planning / Final / Archived" onInput={(e) => setDraft((v) => ({ ...v, status: e.currentTarget.value }))} /></label>
        </div>
        <label style="display:grid;gap:6px;margin-top:12px">Subtitle<input {...stylex.attrs(s.input)} value={draft().subtitle || ''} onInput={(e) => setDraft((v) => ({ ...v, subtitle: e.currentTarget.value }))} /></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
          <label style="display:grid;gap:6px">Visibility<select {...stylex.attrs(s.input)} value={draft().visibility} onChange={(e) => setDraft((v) => ({ ...v, visibility: e.currentTarget.value as Visibility }))}><option value="admin">Admin draft</option><option value="public">Public</option></select></label>
          <label style="display:grid;gap:6px">Hero image URL (optional)<input {...stylex.attrs(s.input)} value={draft().heroImage || ''} onInput={(e) => setDraft((v) => ({ ...v, heroImage: e.currentTarget.value }))} /></label>
        </div>
        <Show when={draft().isCurrent}><p {...stylex.attrs(s.badge)}>CURRENT FRONT-PAGE YEAR</p></Show>
      </section>

      <section {...stylex.attrs(s.card)}>
        <div {...stylex.attrs(s.goldLabel)}>02 · Results</div>
        <h2 {...stylex.attrs(s.roundTitle)}>Awards</h2>
        <p {...stylex.attrs(s.muted)}>For 2025, enter the final winners. For 2026, leave these blank until the weekend is complete.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
          <label style="display:grid;gap:6px">ASHHOLE Cup winner(s)<input {...stylex.attrs(s.input)} value={draft().cupWinner || ''} onInput={(e) => setDraft((v) => ({ ...v, cupWinner: e.currentTarget.value }))} /></label>
          <label style="display:grid;gap:6px">Gil Lugo Memorial MIG winner<input {...stylex.attrs(s.input)} value={draft().migWinner || ''} onInput={(e) => setDraft((v) => ({ ...v, migWinner: e.currentTarget.value }))} /></label>
        </div>
      </section>

      <section {...stylex.attrs(s.card)}>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap"><div><div {...stylex.attrs(s.goldLabel)}>03 · Weekend</div><h2 {...stylex.attrs(s.roundTitle)}>Rounds & tee times</h2></div><button {...stylex.attrs(s.button, s.lightButton)} type="button" onClick={() => setDraft((v) => ({ ...v, rounds: [...v.rounds, { dayLabel: '', title: '', course: '', teeTime: '', holes: 18, format: null }] }))}>Add round</button></div>
        <div style="display:grid;gap:12px;margin-top:18px"><For each={draft().rounds}>{(round, index) => <div style="display:grid;grid-template-columns:90px 1fr 1fr 1fr 90px 1fr auto;gap:8px;align-items:end">
          <label style="display:grid;gap:4px">Day<input {...stylex.attrs(s.input)} value={round.dayLabel} onInput={(e) => updateRound(index(), { dayLabel: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Round<input {...stylex.attrs(s.input)} value={round.title} onInput={(e) => updateRound(index(), { title: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Course<input {...stylex.attrs(s.input)} value={round.course} onInput={(e) => updateRound(index(), { course: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Tee time<input {...stylex.attrs(s.input)} value={round.teeTime} onInput={(e) => updateRound(index(), { teeTime: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Holes<input {...stylex.attrs(s.input)} type="number" value={round.holes ?? ''} onInput={(e) => updateRound(index(), { holes: e.currentTarget.value ? Number(e.currentTarget.value) : null })} /></label>
          <label style="display:grid;gap:4px">Format<input {...stylex.attrs(s.input)} value={round.format || ''} placeholder="Skins / Scramble" onInput={(e) => updateRound(index(), { format: e.currentTarget.value || null })} /></label>
          <button {...stylex.attrs(s.button, s.lightButton)} style="margin-top:0" type="button" onClick={() => setDraft((v) => ({ ...v, rounds: v.rounds.filter((_, i) => i !== index()) }))}>Remove</button>
        </div>}</For></div>
      </section>

      <section {...stylex.attrs(s.card)}>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap"><div><div {...stylex.attrs(s.goldLabel)}>04 · Field</div><h2 {...stylex.attrs(s.roundTitle)}>Players & handicaps</h2></div><button {...stylex.attrs(s.button, s.lightButton)} type="button" onClick={() => setDraft((v) => ({ ...v, field: [...v.field, { name: '', handicap: null }] }))}>Add player</button></div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 18px;margin-top:18px"><For each={draft().field}>{(player, index) => <div style="display:grid;grid-template-columns:1fr 110px auto;gap:8px;align-items:end">
          <label style="display:grid;gap:4px">Player<input {...stylex.attrs(s.input)} value={player.name} onInput={(e) => updatePlayer(index(), { name: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Handicap<input {...stylex.attrs(s.input)} value={player.handicap || ''} onInput={(e) => updatePlayer(index(), { handicap: e.currentTarget.value || null })} /></label>
          <button {...stylex.attrs(s.button, s.lightButton)} style="margin-top:0" type="button" onClick={() => setDraft((v) => ({ ...v, field: v.field.filter((_, i) => i !== index()) }))}>×</button>
        </div>}</For></div>
      </section>

      <section {...stylex.attrs(s.card)}>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap"><div><div {...stylex.attrs(s.goldLabel)}>05 · Cup</div><h2 {...stylex.attrs(s.roundTitle)}>ASHHOLE Cup pairings</h2></div><button {...stylex.attrs(s.button, s.lightButton)} type="button" onClick={() => setDraft((v) => ({ ...v, pairings: [...v.pairings, { playerOne: '', playerTwo: null }] }))}>Add pairing</button></div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 18px;margin-top:18px"><For each={draft().pairings}>{(pair, index) => <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end">
          <label style="display:grid;gap:4px">Player 1<input {...stylex.attrs(s.input)} value={pair.playerOne} onInput={(e) => updatePairing(index(), { playerOne: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Player 2<input {...stylex.attrs(s.input)} value={pair.playerTwo || ''} onInput={(e) => updatePairing(index(), { playerTwo: e.currentTarget.value || null })} /></label>
          <button {...stylex.attrs(s.button, s.lightButton)} style="margin-top:0" type="button" onClick={() => setDraft((v) => ({ ...v, pairings: v.pairings.filter((_, i) => i !== index()) }))}>×</button>
        </div>}</For></div>
      </section>

      <section {...stylex.attrs(s.card)}>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap"><div><div {...stylex.attrs(s.goldLabel)}>06 · Rooms</div><h2 {...stylex.attrs(s.roundTitle)}>Room assignments</h2></div><button {...stylex.attrs(s.button, s.lightButton)} type="button" onClick={() => setDraft((v) => ({ ...v, rooms: [...v.rooms, { room: '', occupants: '' }] }))}>Add room</button></div>
        <p {...stylex.attrs(s.muted)}>Room assignments publish with the rest of the Classic when this year is public.</p>
        <div style="display:grid;gap:10px;margin-top:18px"><For each={draft().rooms}>{(room, index) => <div style="display:grid;grid-template-columns:180px 1fr auto;gap:8px;align-items:end">
          <label style="display:grid;gap:4px">Room<input {...stylex.attrs(s.input)} value={room.room} onInput={(e) => updateRoom(index(), { room: e.currentTarget.value })} /></label>
          <label style="display:grid;gap:4px">Occupants<input {...stylex.attrs(s.input)} value={room.occupants} onInput={(e) => updateRoom(index(), { occupants: e.currentTarget.value })} /></label>
          <button {...stylex.attrs(s.button, s.lightButton)} style="margin-top:0" type="button" onClick={() => setDraft((v) => ({ ...v, rooms: v.rooms.filter((_, i) => i !== index()) }))}>Remove</button>
        </div>}</For></div>
      </section>
    </div>

    <div style="position:sticky;bottom:0;background:#071923;border-top:1px solid #36525c;margin:40px -24px -64px;padding:18px 24px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;z-index:10">
      <button {...stylex.attrs(s.button)} style="margin-top:0" type="button" disabled={busy()} onClick={() => void save(false)}>Save {year()}</button>
      <button {...stylex.attrs(s.button)} style="margin-top:0" type="button" disabled={busy()} onClick={() => void save(true)}>Save & make front page</button>
      <span style="color:#d8d9c1">{draft().isCurrent ? `${year()} is live` : 'Not live until you choose “make front page”.'}</span>
    </div>
  </div></section>;
}
