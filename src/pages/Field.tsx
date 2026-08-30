import { For } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { api, createApiState } from '../api/client';
import { s } from '../styles/site.stylex';
import type { PlayerSummary } from '../shared/types';

const initial: PlayerSummary[] = [
  { id: 1, slug: 'john-benedict', name: 'John Benedict', firstYear: 1990, appearances: 36, tier: 'RP+', years: Array.from({ length: 36 }, (_, i) => 1990 + i) },
  { id: 2, slug: 'tony-kren', name: 'Tony Kren', firstYear: 1990, appearances: 33, tier: 'Platinum', years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2021,2022,2023,2024,2025] },
  { id: 3, slug: 'gregg-wells', name: 'Gregg Wells', firstYear: 1991, appearances: 35, tier: 'Platinum', years: Array.from({ length: 35 }, (_, i) => 1991 + i) },
];

export default function Field() {
  const state = createApiState(api.players, initial);
  return <><section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}><div {...stylex.attrs(s.eyebrow)}>The hackers • The tradition • The membership</div><h1 {...stylex.attrs(s.darkTitle)} style="text-align:left">THE FIELD</h1><p {...stylex.attrs(s.darkLead)} style="text-align:left;margin-left:0">Attendance is the real stat. The historical site used membership tiers to recognize the people who kept coming back.</p></div></section>
  <section {...stylex.attrs(s.section)}><div {...stylex.attrs(s.sectionInner)}>
    <div {...stylex.attrs(s.notice)} style="color:#27383e;background:#fffaf0;border-color:#95a022"><strong>Membership key:</strong> RP+ = perfect attendance; Platinum = 10+ outings; Gold = 4–9; Silver = 2–3; Bronze = rookie.</div>
    <div {...stylex.attrs(s.playerGrid)}><For each={state.value()}>{(player) => <article {...stylex.attrs(s.playerCard)}><h2 {...stylex.attrs(s.playerName)}>{player.name}</h2><span {...stylex.attrs(s.badge)}>{player.tier}</span><p {...stylex.attrs(s.muted)}>ASHHOLE since {player.firstYear || '—'}<br />{player.appearances} recorded outings</p><div {...stylex.attrs(s.years)}><For each={player.years.slice(-18)}>{(year) => <span {...stylex.attrs(s.yearDot)}>{String(year).slice(-2)}</span>}</For></div></article>}</For></div>
  </div></section></>;
}
