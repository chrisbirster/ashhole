import { For } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { api, createApiState } from '../api/client';
import { awards } from '../data/public';
import { s } from '../styles/site.stylex';

export default function Cup() {
  const state = createApiState(api.cup, awards);
  return <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}>
    <div {...stylex.attrs(s.eyebrow)} style="text-align:center">The prize • The lineage</div>
    <h1 {...stylex.attrs(s.darkTitle)}>THE ASHHOLE CUP</h1>
    <p {...stylex.attrs(s.darkLead)}>An absurdly prestigious presentation of a genuinely meaningful golf tradition. Historical names below are preserved as recorded in the legacy archive.</p>
    <div style="height:34px" />
    <div {...stylex.attrs(s.tableWrap)}><table {...stylex.attrs(s.table)}><thead><tr><th {...stylex.attrs(s.th)}>Year</th><th {...stylex.attrs(s.th)}>Gil Lugo Memorial MIG Award</th><th {...stylex.attrs(s.th)}>ASHHOLE Cup</th></tr></thead><tbody>
      <For each={state.value()}>{(row) => <tr><td {...stylex.attrs(s.td)}>{row.year}</td><td {...stylex.attrs(s.td)}>{row.migWinner || '—'}</td><td {...stylex.attrs(s.td)}>{row.cupWinner || '—'}</td></tr>}</For>
    </tbody></table></div>
  </div></section>;
}
