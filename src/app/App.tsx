import { lazy, type ParentComponent } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import { SiteShell } from '../components/SiteShell';

const Classic = lazy(() => import('../pages/Classic'));
const Cup = lazy(() => import('../pages/Cup'));
const Field = lazy(() => import('../pages/Field'));
const Archive = lazy(() => import('../pages/Archive'));
const ArchiveYear = lazy(() => import('../pages/ArchiveYear'));
const Story = lazy(() => import('../pages/Story'));
const Memorial = lazy(() => import('../pages/Memorial'));
const Admin = lazy(() => import('../pages/Admin'));
const NotFound = lazy(() => import('../pages/NotFound'));

const Root: ParentComponent = (props) => <SiteShell>{props.children}</SiteShell>;

export default function App() {
  return (
    <Router root={Root}>
      <Route path="/" component={Classic} />
      <Route path="/cup" component={Cup} />
      <Route path="/field" component={Field} />
      <Route path="/archive" component={Archive} />
      <Route path="/archive/:year" component={ArchiveYear} />
      <Route path="/story" component={Story} />
      <Route path="/memorial" component={Memorial} />
      <Route path="/admin" component={Admin} />
      <Route path="/*all" component={NotFound} />
    </Router>
  );
}
