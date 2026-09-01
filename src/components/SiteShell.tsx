import { createSignal, type ParentComponent } from 'solid-js';

const links = [
  ['Latest Results', '/latest-results'],
  ['1990-91 Pics', '/1990-91-pics'],
  ['Players', '/players'],
  ['History', '/our-history'],
  ['Memories', '/memories'],
  ['Tributes', '/tributes'],
] as const;

export const SiteShell: ParentComponent = (props) => {
  const [expanded, setExpanded] = createSignal(false);
  const activePath = () => typeof window === 'undefined' ? '/' : window.location.pathname;

  return (
    <div class="legacy-shell">
      <nav class="legacy-navigation" aria-label="Main navigation">
        <a href="/" class="legacy-nav-brand">
          <img class="legacy-nav-logo" src="/images/ashholelogo.jpg" alt="ashhole logo" />
          <span>ASHHOLE</span>
        </a>
        <button
          class="legacy-hamburger"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={expanded() ? 'true' : 'false'}
          onClick={() => setExpanded((value) => !value)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <div class={`legacy-navigation-menu${expanded() ? ' expanded' : ''}`}>
          <ul>
            {links.map(([label, href]) => (
              <li>
                <a
                  href={href}
                  class={activePath() === href || activePath().startsWith(`${href}/`) ? 'active' : ''}
                  onClick={() => setExpanded(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main class="legacy-main">{props.children}</main>

      <footer class="legacy-footer">
        <p><strong>Did you change your Email address?</strong>If so, please send an email to the Committee at gawells1954@comcast.net so we can update our records. This will ensure that you will receive the latest communications about this year's Fall Classic.</p>
        <div class="legacy-footer-spacer" />
        <p>This is a private web site. This site is for Ashholes only. This site contains privileged, non-public information. It is intended for the use of the individual entity that has been allowed and specifically authorized to view the information contained herein. This is not an invitation or offer to purchase interests. Upon proceeding, you are hereby notified that any dissemination, distribution or copying of this information, which is not for personal use, is strictly prohibited. Any resemblance to persons living or dead or in between is more than a coincidence. No animals were harmed during the making of this website. However, some feelings may be hurt.</p>
      </footer>
    </div>
  );
};
