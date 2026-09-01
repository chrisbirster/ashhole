import * as stylex from '@stylexjs/stylex';
import { s } from '../styles/site.stylex';

export default function NotFound() {
  return <section {...stylex.attrs(s.section, s.darkSection)}><div {...stylex.attrs(s.sectionInner)}><div {...stylex.attrs(s.eyebrow)}>Lost ball</div><h1 {...stylex.attrs(s.darkTitle)} style="text-align:left">404</h1><p {...stylex.attrs(s.darkLead)} style="text-align:left;margin-left:0">That page is somewhere deep in the rough.</p><a href="/" {...stylex.attrs(s.button)}>Back to the Classic</a></div></section>;
}
