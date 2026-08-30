import type { ParentComponent } from 'solid-js';
import * as stylex from '@stylexjs/stylex';
import { s } from '../styles/site.stylex';

const links = [
  ['The Classic', '/'],
  ['The Cup', '/cup'],
  ['The Field', '/field'],
  ['The Archive', '/archive'],
  ['The Story', '/story'],
  ['The Memorial', '/memorial'],
] as const;

export const SiteShell: ParentComponent = (props) => (
  <div {...stylex.attrs(s.app)}>
    <header {...stylex.attrs(s.header)}>
      <nav {...stylex.attrs(s.nav)} aria-label="Main navigation">
        <a href="/" {...stylex.attrs(s.brand)}>
          <img {...stylex.attrs(s.logo)} src="/assets/logo/ashholelogo.jpg" alt="ASHHOLE logo" />
          <div>
            <div {...stylex.attrs(s.brandTitle)}>ASHHOLE</div>
            <div {...stylex.attrs(s.brandSub)}>Annual Shenvalee Hackers<br />Holiday Of Leisurely Exercise</div>
          </div>
        </a>
        <div {...stylex.attrs(s.links)}>
          {links.map(([label, href]) => <a href={href} {...stylex.attrs(s.navLink)}>{label}</a>)}
        </div>
      </nav>
    </header>
    <main {...stylex.attrs(s.main)}>{props.children}</main>
    <footer {...stylex.attrs(s.footer)}>
      <div {...stylex.attrs(s.footerInner)}>
        <div><span {...stylex.attrs(s.footerStrong)}>ASHHOLE</span><br />Serious tradition. Questionable golf.<br /><a href="/admin" style="color:inherit;font-size:12px">Admin</a></div>
        <div>Shenvalee • Since 1990<br />Let us remember the good times and good friends.</div>
      </div>
    </footer>
  </div>
);
