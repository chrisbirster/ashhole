import { For } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { api, createApiState } from '../api/client';
import { archiveCards } from '../data/public';
import { s } from '../styles/site.stylex';

export default function Archive() {
  const state = createApiState(api.archive, archiveCards);
  return <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}>
    <div {...stylex.attrs(s.eyebrow)}>1990 → present</div><h1 {...stylex.attrs(s.darkTitle)} style="text-align:left">THE ASHHOLE ARCHIVE</h1><p {...stylex.attrs(s.darkLead)} style="text-align:left;margin-left:0">Years of hacking, memories, awards, and questionable decisions. A single data-driven template replaces the legacy one-page-per-year setup.</p>
    <div style="height:34px" /><div {...stylex.attrs(s.archiveGrid)}><For each={state.value()}>{(item) => <a href={`/archive/${item.year}`} {...stylex.attrs(s.archiveCard)}>{item.image && <img {...stylex.attrs(s.archiveImage)} src={item.image} alt={`${item.year} ASHHOLE archive`} />}<div {...stylex.attrs(s.archiveBody)}><div {...stylex.attrs(s.archiveYear)}>{item.year}</div><strong>{item.title}</strong><p {...stylex.attrs(s.muted)}>{item.blurb}</p></div></a>}</For></div>
  </div></section>;
}
