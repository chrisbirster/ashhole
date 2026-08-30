import { For, Show } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { api, createApiState } from '../api/client';
import { s } from '../styles/site.stylex';
import type { EventSummary } from '../shared/types';

const initial: EventSummary = {
  id: 2024,
  year: 2024,
  title: '2024 ASHHOLE Classic',
  subtitle: 'Latest complete public archive',
  status: 'Archived',
  heroImage: null,
  cupWinner: 'Brian Bruneau',
  migWinner: 'Jeff Cochran',
  rounds: [
    { id: 1, eventId: 2024, ordinal: 1, dayLabel: 'Friday', title: 'Opening Round', course: 'Creek → Miller', teeTime: '11:42 AM', holes: 18, format: null },
    { id: 2, eventId: 2024, ordinal: 2, dayLabel: 'Saturday AM', title: 'Round Two', course: 'Creek → Olde', teeTime: '7:48 AM', holes: 18, format: null },
    { id: 3, eventId: 2024, ordinal: 3, dayLabel: 'Saturday PM', title: 'The Wildcard', course: 'Olde → Miller', teeTime: '2:42 PM', holes: 9, format: 'Scramble · Red tees' },
    { id: 4, eventId: 2024, ordinal: 4, dayLabel: 'Sunday', title: 'Skins', course: 'Creek → Miller', teeTime: '8:33 AM', holes: 18, format: 'Skins' },
  ],
  pairings: [],
  field: [],
};

export default function Classic() {
  const state = createApiState(api.classic, initial);
  return <>
    <section {...stylex.attrs(s.hero)}>
      {state.value().heroImage && <img {...stylex.attrs(s.heroImage)} src={state.value().heroImage!} alt="ASHHOLE group at Shenvalee" />}
      <div {...stylex.attrs(s.heroPattern)} />
      <div {...stylex.attrs(s.heroScrim)} />
      <div {...stylex.attrs(s.heroContent)}>
        <div {...stylex.attrs(s.eyebrow)}>The Fall Classic • Shenvalee • Since 1990</div>
        <h1 {...stylex.attrs(s.display)}>Serious tradition.<br /><span {...stylex.attrs(s.displayAccent)}>Questionable golf.</span></h1>
        <p {...stylex.attrs(s.intro)}>{state.value().subtitle || 'The Annual Shenvalee Hackers Holiday Of Leisurely Exercise: one weekend, one Cup, decades of stories, and absolutely no Tour cards required.'}</p>
      </div>
    </section>
    <div {...stylex.attrs(s.statusGrid)}>
      <div {...stylex.attrs(s.status)}><div {...stylex.attrs(s.statusLabel)}>Classic</div><div {...stylex.attrs(s.statusValue)}>{state.value().year}</div></div>
      <div {...stylex.attrs(s.status)}><div {...stylex.attrs(s.statusLabel)}>Status</div><div {...stylex.attrs(s.statusValue)}>{state.value().status}</div></div>
      <div {...stylex.attrs(s.status)}><div {...stylex.attrs(s.statusLabel)}>Field</div><div {...stylex.attrs(s.statusValue)}>{state.value().field.length || '—'}</div></div>
      <div {...stylex.attrs(s.status)}><div {...stylex.attrs(s.statusLabel)}>Rounds</div><div {...stylex.attrs(s.statusValue)}>{state.value().rounds.length}</div></div>
    </div>

    <section {...stylex.attrs(s.section)}><div {...stylex.attrs(s.sectionInner)}>
      <h2 {...stylex.attrs(s.sectionTitle)}>The Weekend</h2><div {...stylex.attrs(s.rule)} />
      <p {...stylex.attrs(s.sectionLead)}>The live schedule below comes directly from the selected Classic year in the admin workspace.</p>
      <div {...stylex.attrs(s.cardGrid)}><For each={state.value().rounds}>{(round) => <article {...stylex.attrs(s.card)}>
        <div {...stylex.attrs(s.roundNumber)}>{String(round.ordinal).padStart(2, '0')}</div>
        <div {...stylex.attrs(s.roundDay)}>{round.dayLabel}</div>
        <h3 {...stylex.attrs(s.roundTitle)}>{round.title}</h3>
        <p {...stylex.attrs(s.muted)}>{round.teeTime}<br />{round.course}<br />{round.holes ? `${round.holes} holes` : ''}{round.format ? ` · ${round.format}` : ''}</p>
      </article>}</For></div>
    </div></section>

    <Show when={state.value().field.length}>
      <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}>
        <div {...stylex.attrs(s.eyebrow)}>The field</div>
        <h2 {...stylex.attrs(s.darkTitle)} style="text-align:left">{state.value().year} Hackers & Handicaps</h2>
        <div {...stylex.attrs(s.tableWrap)} style="margin-top:26px"><table {...stylex.attrs(s.table)}><thead><tr><th {...stylex.attrs(s.th)}>Player</th><th {...stylex.attrs(s.th)}>Handicap</th></tr></thead><tbody><For each={state.value().field}>{(player) => <tr><td {...stylex.attrs(s.td)}>{player.name}</td><td {...stylex.attrs(s.td)}>{player.handicap || '—'}</td></tr>}</For></tbody></table></div>
      </div></section>
    </Show>

    <Show when={state.value().pairings.length}>
      <section {...stylex.attrs(s.section)}><div {...stylex.attrs(s.sectionInner)}>
        <h2 {...stylex.attrs(s.sectionTitle)}>ASHHOLE Cup Pairings</h2><div {...stylex.attrs(s.rule)} />
        <p {...stylex.attrs(s.sectionLead)}>The current Cup teams, updated from the admin workspace.</p>
        <div {...stylex.attrs(s.playerGrid)}><For each={state.value().pairings}>{(pair, index) => <article {...stylex.attrs(s.playerCard)}><div {...stylex.attrs(s.goldLabel)}>Team {index() + 1}</div><div {...stylex.attrs(s.playerName)}>{pair.playerOne}</div><div {...stylex.attrs(s.muted)}>{pair.playerTwo || 'TBD'}</div></article>}</For></div>
      </div></section>
    </Show>

    <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner, s.featureGrid)}>
      <div><div {...stylex.attrs(s.goldLabel)}>The prize</div><h2 {...stylex.attrs(s.bigName)}>The ASHHOLE Cup</h2><p {...stylex.attrs(s.darkLead)} style="text-align:left;margin-left:0">Everyone comes to Shenvalee. Only one team leaves with this. Explore the complete lineage of winners and the Gil Lugo Memorial MIG Award.</p><a href="/cup" {...stylex.attrs(s.button)}>View the lineage</a></div>
      <div {...stylex.attrs(s.featurePlaque)} aria-label="ASHHOLE Cup heritage plaque"><div {...stylex.attrs(s.plaqueSmall)}>Annual Shenvalee Hackers</div><div {...stylex.attrs(s.plaqueMark)}>A</div><div {...stylex.attrs(s.plaqueTitle)}>THE ASHHOLE CUP</div><div {...stylex.attrs(s.plaqueSmall)}>Shenvalee • Since 1990</div></div>
    </div></section>
  </>;
}
