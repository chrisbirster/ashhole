import { For, Show } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { useParams } from '@solidjs/router';
import { api, createApiState } from '../api/client';
import { s } from '../styles/site.stylex';
import type { ArchiveYear as ArchiveYearType } from '../shared/types';

const blank = (year: number): ArchiveYearType => ({ id: year, year, title: `${year} ASHHOLE Classic`, subtitle: null, status: 'Archive', heroImage: null, cupWinner: null, migWinner: null, rounds: [], pairings: [], field: [], rooms: [], photos: [] });

export default function ArchiveYear() {
  const params = useParams();
  const year = Number(params.year);
  const state = createApiState(() => api.archiveYear(year), blank(year));
  return <><section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}><div {...stylex.attrs(s.eyebrow)}>The Archive • {year}</div><h1 {...stylex.attrs(s.darkTitle)} style="text-align:left">{state.value().title}</h1><p {...stylex.attrs(s.darkLead)} style="text-align:left;margin-left:0">{state.value().subtitle || 'A chapter from the Annual Shenvalee Hackers Holiday Of Leisurely Exercise.'}</p></div></section>
  <Show when={state.value().heroImage}><img src={state.value().heroImage!} alt={`${year} ASHHOLE group`} style="width:100%;max-height:620px;object-fit:cover" /></Show>
  <section {...stylex.attrs(s.section)}><div {...stylex.attrs(s.sectionInner)}><div {...stylex.attrs(s.cardGrid)}><For each={state.value().rounds}>{(round) => <article {...stylex.attrs(s.card)}><div {...stylex.attrs(s.roundNumber)}>{String(round.ordinal).padStart(2,'0')}</div><div {...stylex.attrs(s.roundDay)}>{round.dayLabel}</div><h3 {...stylex.attrs(s.roundTitle)}>{round.title}</h3><p {...stylex.attrs(s.muted)}>{round.teeTime} · {round.course}{round.format ? ` · ${round.format}` : ''}</p></article>}</For></div>
  <div style="height:36px" /><div {...stylex.attrs(s.playerGrid)}><article {...stylex.attrs(s.playerCard)}><div {...stylex.attrs(s.goldLabel)}>ASHHOLE Cup</div><h2 {...stylex.attrs(s.playerName)}>{state.value().cupWinner || 'Not recorded'}</h2></article><article {...stylex.attrs(s.playerCard)}><div {...stylex.attrs(s.goldLabel)}>Gil Lugo Memorial MIG Award</div><h2 {...stylex.attrs(s.playerName)}>{state.value().migWinner || 'Not recorded'}</h2></article></div>
  <Show when={state.value().field.length}><div style="height:40px" /><h2 {...stylex.attrs(s.sectionTitle)}>Field & Handicaps</h2><div {...stylex.attrs(s.rule)} /><div {...stylex.attrs(s.tableWrap)}><table {...stylex.attrs(s.table)}><thead><tr><th {...stylex.attrs(s.th)}>Player</th><th {...stylex.attrs(s.th)}>Handicap</th></tr></thead><tbody><For each={state.value().field}>{(player) => <tr><td {...stylex.attrs(s.td)}>{player.name}</td><td {...stylex.attrs(s.td)}>{player.handicap || '—'}</td></tr>}</For></tbody></table></div></Show>
  <Show when={state.value().pairings.length}><div style="height:40px" /><h2 {...stylex.attrs(s.sectionTitle)}>Cup Pairings</h2><div {...stylex.attrs(s.rule)} /><div {...stylex.attrs(s.playerGrid)}><For each={state.value().pairings}>{(pair) => <div {...stylex.attrs(s.playerCard)}><strong>{pair.playerOne}</strong><br /><span {...stylex.attrs(s.muted)}>with {pair.playerTwo || 'Open'}</span></div>}</For></div></Show>
  <Show when={state.value().rooms.length}><div style="height:40px" /><h2 {...stylex.attrs(s.sectionTitle)}>Room Assignments</h2><div {...stylex.attrs(s.rule)} /><div {...stylex.attrs(s.playerGrid)}><For each={state.value().rooms}>{(room) => <div {...stylex.attrs(s.playerCard)}><div {...stylex.attrs(s.goldLabel)}>{room.room}</div><strong>{room.occupants}</strong></div>}</For></div></Show>
  <Show when={state.value().photos.length}><div style="height:40px" /><h2 {...stylex.attrs(s.sectionTitle)}>Photos</h2><div {...stylex.attrs(s.archiveGrid)}><For each={state.value().photos}>{(photo) => <img {...stylex.attrs(s.archiveImage)} src={photo.src} alt={photo.alt} loading="lazy" />}</For></div></Show>
  </div></section></>;
}
