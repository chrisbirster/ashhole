import { createRouter } from '@solidjs/router';
import { SiteShell } from '../components/SiteShell';
import Classic from '../pages/Classic';
import Cup from '../pages/Cup';
import Field from '../pages/Field';
import Archive from '../pages/Archive';
import ArchiveYear from '../pages/ArchiveYear';
import Story from '../pages/Story';
import Memorial from '../pages/Memorial';
import OldPics from '../pages/OldPics';
import Memories from '../pages/Memories';
import GilLugo from '../pages/GilLugo';
import JoeOfalt from '../pages/JoeOfalt';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';

const AppRouter = createRouter({
  routes: [
    {
      component: SiteShell,
      children: [
        { path: '/', component: Classic },

        { path: '/latest-results', component: Archive },
        { path: '/latest-results/:year', component: ArchiveYear },
        { path: '/1990-91-pics', component: OldPics },
        { path: '/players', component: Field },
        { path: '/our-history', component: Story },
        { path: '/memories', component: Memories },
        { path: '/tributes', component: Memorial },
        { path: '/tributes/gil-lugo', component: GilLugo },
        { path: '/tributes/joe-ofalt', component: JoeOfalt },

        { path: '/cup', component: Cup },
        { path: '/field', component: Field },
        { path: '/archive', component: Archive },
        { path: '/archive/:year', component: ArchiveYear },
        { path: '/story', component: Story },
        { path: '/memorial', component: Memorial },

        { path: '/admin', component: Admin },
        { path: '/*all', component: NotFound },
      ],
    },
  ],
});

export default function App() {
  return <AppRouter />;
}
